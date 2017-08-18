/**
 * Created by Charlie on 2017-08-17.
 */

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

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
