/**
 * All functions related to user actions
 * @Author: Chenlei Hu
 */
const express = require('express');
const wechat = require('wechat');
const router = express.Router();
const db_action = require('../utils/db_action');

/**
 * This function dispatches user input to different database related actions
 * @param message user commandline input
 * @param openId
 * @return Promise
 */
function processCommandlineInput(message, openId) {
    const memberInfoFields = ["name", "discipline", "graduation", "email", "phone"];
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
        return db_action.bindUser(openId, messageTokens[1]);
    } else if (command === "check") {
        checkParamNumber(1);
        const field = messageTokens[1];
        return db_action.queryMemberInfo(openId, field);
    } else if (command === "update") {
        checkParamNumber(2);
        const field = messageTokens[1];
        const value = messageTokens[2];
        if (!memberInfoFields.includes(field)) {
            throw `field options: ${memberInfoFields.join(", ")}`;
        }
        return db_action.updateMemberInfo(openId, field, value);
    } else if (command === "validate") {
        checkParamNumber(0);
        return db_action.validateMember(openId);
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
    const message = data.Content;
    const openId = data.FromUserName;
    try {
        processCommandlineInput(message, openId).then(replyMessage);
    } catch (e) {
        replyMessage(e);
    }
}));

module.exports = router;
