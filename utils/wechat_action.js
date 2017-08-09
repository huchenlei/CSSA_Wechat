/**
 * This file specifies most used wechat actions (talking to tencent's server)
 * Created by Charlie on 2017-08-01.
 */

require('any-promise/register/q');
const request = require('request-promise-any');
const wechatConfig = require('./../config/wechat_config');

/**
 * Get access_token string from tencent's server
 * GET request
 */
async function getAccessToken() {
    const options = {
        method: 'GET',
        uri: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wechatConfig.appid}&secret=${wechatConfig.appSecret}`,
        json: true
    };
    let body = await request(options);
    if (body.hasOwnProperty('errcode')) throw "Bad status from tencent's server(config problem)";
    return body.access_token;
}

/**
 * Create a list of buttons in wechat official account
 * POST request
 * @param accessToken
 * @param buttonList an Array of buttons following the wechat specifications
 */
async function createMenuItem(accessToken, buttonList) {
    const options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`,
        body: {button: buttonList},
        json: true
    };
    let body = await request(options);
    if (body['errcode'] !== 0) throw body['errmsg'];
    return body;
}

/**
 * Query the current menu item status
 * @param accessToken
 * @return {*} the menu describing json following the wechat specifications
 */
async function queryMenuItem(accessToken) {
    const options = {
        method: 'GET',
        uri: `https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${accessToken}`,
        json: true
    };
    return await request(options);
}

/**
 * Delete all current menu items
 * @param accessToken
 * @return {*} request result
 */
async function deleteMenuItem(accessToken) {
    const options = {
        method: 'GET',
        uri: `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${accessToken}`,
        json: true
    };
    return await request(options);
}

async function getMaterialList(accessToken, type, offset, count) {
    const options = {
        method: 'POST',
        uri: `https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${accessToken}`,
        body: {
            type: type, // news, voice, image, video
            offset: offset,
            count: count // between 1 ~ 20
        },
        json: true
    };
    return await request(options);
}

module.exports = {
    getAccessToken, createMenuItem, queryMenuItem, deleteMenuItem, getMaterialList
};


