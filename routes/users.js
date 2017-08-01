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
    res.locals.title = "Bind Card";
    res.locals.serial = req.query['serial'];
    res.render('serial_number.jade');
});

module.exports = router;
