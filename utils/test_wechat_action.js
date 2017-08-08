/**
 * Created by Charlie on 2017-08-04.
 */

const wechatAction = require('./wechat_action');
const config = require('../config/wechat_config');
const originalUrl = encodeURIComponent("http://138.197.149.174/user");
const scope = 'snsapi_base';
const oauthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${originalUrl}&response_type=code&scope=${scope}`;
wechatAction.getAccessToken().then((token) => {
    wechatAction.deleteMenuItem(token).then(
        (result) => {
            console.log(result);
            wechatAction.createMenuItem(token, [
                {
                    "name": "会员",
                    "sub_button": [
                        {
                            "type": "scancode_waitmsg",
                            "name": "扫码绑卡",
                            "key": "rselfmenu_0_0",
                            "sub_button": []
                        },
                        {
                            "type": "view",
                            "name": "会员信息",
                            "url": oauthUrl,
                            "sub_button": []
                        }
                    ]
                },
            ]).then(console.log);
        }
    )
}).catch(console.error);
