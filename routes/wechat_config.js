/**
 * This is the configs for wechat official account app to talk to Tencent's server
 * @type {{token: string, appid: string, encodingAESKey: string, checkSignature: boolean}}
 */
const config = {
    token: 'helloCSSA',
    appid: 'wx706d50cf10d5536e',
    encodingAESKey: 'fSQIzMxHI90YLIV7uXSfC8s2PPOoC4SzTPf78i9luXV',
    checkSignature: false // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

module.exports = config;

