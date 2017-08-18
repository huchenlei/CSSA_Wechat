/**
 * Created by Charlie on 2017-08-17.
 */

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let openIdConfig = require('./test_db_action');

chai.use(chaiHttp);

describe('GET /convert/qrcode', function () {
    const serial = "ATestString";
    it('Should extract serial number', function (done) {
        chai.request(server)
            .get(`/user/convert/qrcode?serial=${serial}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.include(serial);
                done();
            });
    });
});

describe('GET /:openId', function () {
    it('Should return info page of user if user registered', function (done) {
        chai.request(server)
            .get(`/user/${openIdConfig.registeredOpenId}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.not.include('error-icon');
            });
        done();
    });

    it('Should return error page if user unregistered', function (done) {
        chai.request(server)
            .get(`/user/${openIdConfig.unregisteredOpenId}`)
            .end((err, res) => {
                res.should.have.status(500);
                res.text.should.include('error-icon');
            });
        done();
    });
});