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
dbAction.initializeDB()
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
    .put(function (req, res, next) {
        const newInfo = _.pick(req.body, dbAction.USER_INFO_FIELDS);
        dbAction.updateMemberInfo(req.params.openId, newInfo)
            .then((dbResult) => {
                console.log(dbResult.msg + ' - ' + dbResult.data);
                res.json({
                    status: 0
                });
            }).catch(next);
    });

/**
 * Test path for dev only
 */
router
    .get("/test/:openId", async (req, res) => {
        // console.log(req.params, 'params')
        res.locals.user = {
            name: "Rain",
            graduation: "2017-05-31",
            discipline: "EngSci",
            email: "ggg@ttt.com",
            phone: "666-999-4444"
        };
        res.locals.title = "Member Info";
        res.locals.openId = 12345;
        await dbAction.bindUser(12345, "Rain")
        res.locals.disciplines = await dbAction.getDisciplines()
        // console.log('disciplines', res.locals.disciplines)
        res.render('user_info.jade');
    })
    .put("/test/:openId", parseMultipart, async (req, res) => {
        console.log('requestbody', req.body)
        const { name, graduation, email, phone, discipline, openId } = req.body
        const disciplines = (await dbAction.getDisciplines()).map(({ name }) => name)
        console.log(disciplines)
        try {
            if (!disciplines.includes(discipline)) {
                await dbAction.addDiscipline(discipline)
            }
            await dbAction.updateMemberInfo(openId, { name, graduation: graduation.slice(0, 4), email, phone, discipline })
            res.json({ type: "success" });
        }
        catch (err) {
            res.json({ type: "error", message: err });
        }
    })


/**
 * The path is deprecated, should use RESTful PUT /user/<openId> instead
 * @Deprecated
 */
router.post('/update_info', (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;
