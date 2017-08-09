/**
 * Created by Charlie on 2017-08-04.
 */

const wechatAction = require('./../utils/wechat_action');
const config = require('../config/wechat_config');
const originalUrl = encodeURIComponent("http://138.197.149.174/user");
const scope = 'snsapi_base';
const oauthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${originalUrl}&response_type=code&scope=${scope}`;
const menuItems = [
    {
        "name": "情系CSSA",
        "sub_button": [
            {
                "type": "view",
                "name": "了解我们",
                "key": "about",
                "url": "http://mp.weixin.qq.com/s?__biz=MjM5NDAwMzM2MA==&mid=208190747&idx=1&sn=848d5aaa717467c3a4925c1b2dc1244e&scene=18#wechat_redirect"
            },
            {
                "type": "view",
                "name": "CSSA换届",
                "key": "re_elect",
                "url": "http://mp.weixin.qq.com/s?__biz=MjM5NDAwMzM2MA==&mid=503218005&idx=1&sn=f421fa8c6741136acb7c155693313e6c&chksm=3e84bf9a09f3368ccd14a912aaf34bba09a1df4225c78e976bb70666e1a93409a3ec4faee661#rd"
            }
        ]
    },
    {
        "name": "会员",
        "sub_button": [
            {
                "type": "scancode_waitmsg",
                "name": "扫码绑卡",
                "key": "bind_card",
            },
            // deprecated oauth interface
            // {
            //     "type": "view",
            //     "name": "会员信息",
            //     "url": oauthUrl,
            // }
            {
                "type": "click",
                "name": "会员信息",
                "key": "member_info"
            }
        ]
    },
];


// wechatAction.getAccessToken().then(wechatAction.queryMenuItem).then(console.log);
wechatAction.getAccessToken().then((token) => {
    wechatAction.deleteMenuItem(token).then(
        (result) => {
            console.log(result); // Debug log
            wechatAction.createMenuItem(token, menuItems).then(console.log); // Debug log
        }
    )
}).catch(console.error);

// wechatAction.getAccessToken().then((token) => {
//     wechatAction.getMaterialList(token, 'news', 0, 5).then(console.log);
// });