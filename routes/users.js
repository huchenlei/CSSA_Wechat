/**
 * All functions related to user actions
 * @Author: Chenlei Hu
 */
const express = require('express');
const router = express.Router();
const config = require('../config/wechat_config');
const dbAction = require('../utils/db_action');
require('any-promise/register/q');
const request = require('request-promise-any');
const _ = require('lodash');
// const bodyParser = require('body-parser');
// router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// router.use(bodyParser.json());
const parseMultipart = require('multer')().array()//need to use multer to parse ajax form data

/**
 * User scan QR code convert the qr code to a code copy page
 */
router.get('/convert/qrcode', function (req, res) {
    res.locals.title = "Bind Card";
    res.locals.serial = req.query['serial'];
    res.render('serial_number.jade');
});

/**
 * RESTful API for user actions
 */
router.route('/')
/**
 * @Deprecated The un-certified wechat official account cannot use oauth interface
 */
    .get(function (req, res, next) {
        const code = req.query['code'];
        const options = {
            method: 'GET',
            uri: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appid}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`,
            json: true
        };
        let openId; // expose openId in higher scope
        request(options).then((data) => {
            if (data['errcode']) {
                throw `${data['errcode']}: ${data['errmsg']}`;
            } else {
                openId = data['openid'];
                return openId;
            }
        }).then(dbAction.queryMemberInfo).then((dbResult) => {
            res.locals.user = dbResult.data;
            res.locals.openId = openId;
            res.locals.title = "Member Info";
            res.render('user_info');
        }).catch(next);
    });

router.route('/:openId')
    .get(function (req, res, next) {
        const openId = req.params.openId;
        dbAction.queryMemberInfo(openId)
            .then((dbResult) => {
                const user = dbResult.data;
                if (req.xhr) {
                    res.json(user);
                } else {
                    res.locals.user = user;
                    res.locals.openId = openId;
                    res.locals.title = "Member Info";
                    res.render('user_info');
                }
            }).catch(next);
    })
    .put(parseMultipart, function (req, res, next) {
        console.log(req.body);
        const newInfo = _.pick(req.body, dbAction.USER_INFO_FIELDS);
        dbAction.updateMemberInfo(req.params.openId, newInfo)
            .then((dbResult) => {
                res.json({
                    status: 0
                });
            }).catch(next);
    });

module.exports = router;
