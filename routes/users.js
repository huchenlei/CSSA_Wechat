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
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
router.use(bodyParser.json());

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
    .get(function (req, res) {
        const code = req.query['code'];
        const options = {
            method: 'GET',
            uri: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appid}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`,
            json: true
        };
        let openId; // expose openId in higher scope
        request(options).then((data) => {
            console.log('data is ' + JSON.stringify(data)); // Debug log
            if (data['errcode']) {
                throw `${data['errcode']}: ${data['errmsg']}`;
            } else {
                openId = data['openid'];
                return openId;
            }
        }).then(dbAction.queryMemberInfo).then((dbResult) => {
            console.log('user is ' + JSON.stringify(dbResult.data)); // Debug log
            res.locals.user = dbResult.data;
            res.locals.openId = openId;
            res.locals.title = "Member Info";
            res.render('user_info.jade');
        }).catch((err) => {
            res.locals.message = typeof err === "string" ? err : "Unknown issue encountered";
            res.render('error.jade');
        });
    });

router.route('/:openId')
    .get(function (req, res) {
        dbAction.queryMemberInfo(req.params.openId)
            .then((dbResult) => {
                res.json(dbResult.data);
            })
            .catch((e) => {
                res.json({errmsg: e});
            });
    })
    .put(function (req, res) {
        const newInfo = _.pick(req.body, dbAction.USER_INFO_FIELDS);
        dbAction.updateMemberInfo(req.params.openId, newInfo)
            .then((dbResult) => {
                console.log(dbResult.msg + ' - ' + dbResult.data);
                res.json({
                    status: 0
                });
            })
            .catch((e) => {
                res.json({
                    status: -1,
                    errmsg: e
                });
            });
    });

/**
 * Test path for dev only
 */
router.get('/test/:openId', (req, res) => {
    res.locals.user = {
        name: "Rain",
        graduation: "2017-05-31",
        discipline: "EngSci",
        email: "ggg@ttt.com",
        phone: "666-999-4444"
    };
    res.locals.title = "Member Info";
    res.locals.openId = req.params.openId;
    res.render('user_info.jade');
});


/**
 * The path is deprecated, should use RESTful PUT /user/<openId> instead
 * @Deprecated
 */
router.post('/update_info', (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;
