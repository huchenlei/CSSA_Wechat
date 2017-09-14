/**
 * Created by Charlie on 2017-08-04.
 *
 * Due to wechat official account IP white-list, the tests in this module could only pass
 * on the server
 */

const wechatAction = require('./../utils/wechat_action');
const config = require('../config/wechat_config');
// const originalUrl = encodeURIComponent("http://138.197.149.174/user");
// const scope = 'snsapi_base';
// const oauthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${originalUrl}&response_type=code&scope=${scope}`;
const menuItems = JSON.parse(require('fs').readFileSync('./config/menu.json'));
const should = require('chai').should();

let token;

describe('getAccessToken', function () {
    it('Should return access token', async function () {
        token = await wechatAction.getAccessToken();
        token.should.be.a('string');
    });
});

describe('queryMenuItem', function () {
    it('Should return success', async function () {
        let result = await wechatAction.queryMenuItem(token);
        result.should.be.a('object');
    });
});

describe('deleteMenuItem', function () {
    it('Should return success', async function () {
        let result = await wechatAction.deleteMenuItem(token);
        result.should.be.a('object');
        result.errcode.should.be.eql(0);
        result.errmsg.should.be.eql('ok');
    });

    it('Should remove all menu items', async function () {
        let menuItem = await wechatAction.queryMenuItem(token);
        menuItem.should.not.have.property('menu');
    });
});

describe('createMenuItem', function () {
    it('Should return success', async function () {
        let result = await wechatAction.createMenuItem(token, menuItems);
        result.errcode.should.be.eql(0);
        result.errmsg.should.be.eql('ok');
    });

    it('Should add menu items', async function () {
        let result = await wechatAction.queryMenuItem(token);
        result.should.be.a('object');
        result.should.have.property('menu');
    });
});
