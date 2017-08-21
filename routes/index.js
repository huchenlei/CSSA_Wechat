/**
 * All functions related to user actions
 * @Author: Chenlei Hu
 */
const crypto = require('crypto');
const express = require('express');
const wechat = require('wechat');
const router = express.Router();
const dbAction = require('../utils/db_action');

const DOMAIN_ADDRESS = "utcssa.info";

/**
 * This function dispatches user input to different database related actions
 * @param message user commandline input
 * @param openId
 * @return Object
 */
function processCommandlineInput(message, openId) {
    const memberInfoFields = dbAction.USER_INFO_FIELDS;
    const usage = `Usage:
bind \<CSSA card number\> 
bind wechat id with CSSA card number. The action is permanent.

check  \<field\>
check the existing member information.

update \<field\> \<text\> 
update member information\(field: ${memberInfoFields.join(", ")}\)

validate
validate the membership of current wechat user`;

    const messageTokens = message.split(' ');
    const command = messageTokens[0];

    function checkParamNumber(assertParamNumber) {
        if ((messageTokens.length - 1) != assertParamNumber) throw usage;
    }

    if (command === "bind") {
        checkParamNumber(1);
        // Bind the wechat openid to corresponding card number
        return dbAction.bindUser(openId, messageTokens[1]);
    } else if (command === "check") {
        checkParamNumber(1);
        const field = messageTokens[1];
        return dbAction.queryMemberInfo(openId, field);
    } else if (command === "update") {
        checkParamNumber(2);
        const field = messageTokens[1];
        const value = messageTokens[2];
        if (!memberInfoFields.includes(field)) {
            throw `field options: ${memberInfoFields.join(", ")}`;
        }
        let newInfo = {};
        newInfo[field] = value;
        return dbAction.updateMemberInfo(openId, newInfo);
    } else if (command === "validate") {
        checkParamNumber(0);
        return dbAction.validateMember(openId);
    } else {
        throw usage;
    }
}

const config = require('./../config/wechat_config');
router.use(express.query());
router.post('/', wechat(config, function (req, res, next) {
    function replyMessage(message) {
        console.log(`Replying ${message}`);
        res.reply(message);
    }

    const data = req.weixin;
    console.log(`data pack is ${data}`); // Debugging
    const openId = data.FromUserName;

    let message;
    if (data.Event) {
        if (data.Event === 'scancode_waitmsg') { // QRCode scan bind card
            const scanUrl = data.ScanCodeInfo.ScanResult;
            const urlPattern = /'http:\/\/.+?\?serial=(.+)$'/;
            let serial;
            if (urlPattern.test(scanUrl)) {
                serial = urlPattern.exec(scanUrl)[1]; // Extract serial code from url
            } else { // Handle invalid scanning
                replyMessage("Sorry, the QR code is invalid.");
                return;
            }
            // console.log(`serial is ${serial}`); // Debugging
            message = `bind ${serial}`;
        } else if (data.Event === 'VIEW') { // click on member info(OAUTH version)
            return; // User will be redirect to info page; do nothing here
        } else if (data.Event === 'CLICK') {
            if (data.EventKey === 'member_info') { // click on member info
                // Send member info page
                dbAction.validateMember(openId).then((dbResult) => {
                    if (dbResult.data) {
                        replyMessage(
                            [{
                                title: 'Member Info',
                                description: 'Check&Update your information',
                                url: `http://${DOMAIN_ADDRESS}/user/${openId}` // Dynamically construct URL
                            }]
                        );
                    } else { // Not yet member
                        replyMessage(dbResult.msg);
                    }
                });
            } else { // click on other menu options
                // Send corresponding articles
            }
            return;
        }
    } else {
        message = data.Content;
    }

    try {
        processCommandlineInput(message, openId).then((result) => {
            replyMessage(result['msg']);
        });
    } catch (e) {
        replyMessage(e);
    }
    // Continue with other routes
    next();
}));


/**
 * Wechat token validate
 */
router.get('/', function (req, res) {
    const token = config.token;
    const signature = req.query.signature;
    const timestamp = req.query.timestamp;
    const nonce = req.query.nonce;
    const echostr = req.query.echostr;

    /*  加密/校验流程如下： */
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    let array = [token, timestamp, nonce];
    array.sort();
    const str = array.toString().replace(/,/g, "");

    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    const sha1Code = crypto.createHash("sha1");
    const code = sha1Code.update(str, 'utf-8').digest("hex");

    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (code === signature) {
        res.send(echostr);
    } else {
        res.send("error");
    }
});

module.exports = router;
