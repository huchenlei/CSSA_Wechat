/**
 * All functions related to user actions
 * @Author: Chenlei Hu
 */
const express = require('express');
const router = express.Router();

/**
 * User scan QR code convert the qr code to a code copy page
 */
router.get('/convert/qrcode', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
