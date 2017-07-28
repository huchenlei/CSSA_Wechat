/**
 * All functions related to user actions
 * @Author: Chenlei Hu
 */
const express = require('express');
const router = express.Router();

/**
 * User scan QR code to sign-up for CSSA membership
 */
router.get('/user/sign_up', function (req, res, next) {
    // TODO QR code get OpenID wechat SDK
    res.send('respond with a resource');
});

module.exports = router;
