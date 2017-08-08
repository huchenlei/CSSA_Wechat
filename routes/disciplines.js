/**
 * RESTful api for disciplines
 * Created by Charlie on 2017-08-08.
 */

const express = require('express');
const dbAction = require('../utils/db_action');
const _ = require('lodash');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
router.use(bodyParser.json());

router.route('/')
    .get((req, res) => {
        dbAction.getDisciplines().then((dbResult) => {
            let jsonResult = [];
            dbResult.forEach((item) => {
                jsonResult.push(_.pick(item, ['name']));
            });
            res.json(jsonResult);
        }).catch((e) => {
            res.json({
                status: -1,
                errmsg: e
            });
        });
    })
    .post((req, res) => {
    console.log(req.body.name);
        dbAction.addDiscipline(req.body.name).then((dbResult) => {
            res.json({
                status: 0
            });
        }).catch((e) => {
            res.locals.message = e;
            res.render('error');
        })
    });

module.exports = router;