/**
 * RESTful api for console
 * Created by Charlie on 2017-08-08.
 */

const express = require('express');
const dbAction = require('../utils/db_action');
const router = express.Router();
const wsServer = require('ws').Server,
    wss = new wsServer({ port: 8080 })
let connected = false;

router.route('/')
    .get(async (req, res) => {
        // return the jade for menagement console
        res.render('console.jade')
    })

wss.on('connection', function (ws, req) {
    // if (!connected) connected = true
    // else {
    //     ws.send('only one connection allowed')
    //     return
    // }
    console.log('ws connected, ip: ', req.connection.remoteAddress)
    ws.on('message', async message => {
        console.log('received:', message)
        const msgData = JSON.parse(message)
        const data = msgData.data
        let response;
        switch (msgData.type) {
            case "getDisciplines":
                response = (await dbAction.getDisciplines()).map(({ name }) => name)
                break;
            case "addDiscipline":
                dbAction.addDiscipline(data)
                break;
            case "editDiscipline":
                console.log('update discipline from', data.from, 'to', data.to)
                break;
            case "removeDiscipline":
                console.log('remove discipline', data)
                break;
        }
        ws.send(JSON.stringify({
            type: msgData.type,
            response
        }))
    })
    ws.on('close', () => {
        console.log('disconnected', req.connection.remoteAddress)
    })
    ws.send(JSON.stringify({
        type: "connected to ws"
    }))
})
module.exports = router;