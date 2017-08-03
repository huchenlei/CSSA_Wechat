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

router.get('/info', function (req, res) {
    res.locals.user = {
        name: "Charlie",
        graduation: "2019",
        discipline: "ECE",
        email: "charlie.hu@mail.utoronto.ca",
        phone: "666-999-4444"
    };
    res.locals.openId = "12345";
    res.locals.title = "Member Info";
    res.render('user_info.jade');
});

module.exports = router;
