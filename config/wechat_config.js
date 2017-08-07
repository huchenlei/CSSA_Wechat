/**
 * This is the configs for wechat official account app to talk to Tencent's server
 * @type {{token: string, appid: string, encodingAESKey: string, checkSignature: boolean}}
 */
const testConfig = {
    token: 'helloCSSA',
    appid: 'wx706d50cf10d5536e',
    encodingAESKey: 'fSQIzMxHI90YLIV7uXSfC8s2PPOoC4SzTPf78i9luXV',
    appSecret: 'ac256d6addae2a2045224e9eed214f2c',
    checkSignature: false // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

const config = {
    token: 'nMEMFobtKGvmxumienzQ',
    appid: 'wxb3d39e3729626373',
    encodingAESKey: 'aYDHJAgLTkJdxVNUPOvojWTdmKrURtyqfYFaHiLjELB',
    appSecret: '', // TODO
    checkSignature: false
};

// Config on wechat dev platform
const testConfig2 = {
  appid: 'wx1bcdcfacf978464c',
  appSecret: '20f14890f637a3a1a11d00e739de50a6',
  token: 'nMEMFobtKGvmxumienzQ',
  encodingAESKey: 'aYDHJAgLTkJdxVNUPOvojWTdmKrURtyqfYFaHiLjELB',
  checkSignature: false
};

module.exports = testConfig2;

