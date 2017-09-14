/**
 * RESTful api for console
 * Created by Charlie on 2017-08-08.
 */

const express = require('express');
const dbAction = require('../utils/db_action');
const router = express.Router();
const wsServer = require('ws').Server,
    wss = new wsServer({ port: 8080 })
const fs = require('fs')
const wechatAction = require('./../utils/wechat_action');

let connected = false;

router.route('/')
    .get(async (req, res) => {
        // return the jade for menagement console
        res.render('console.jade')
    })

wss.on('connection', function (ws, req) {
    if (!connected) connected = true
    else {
        ws.close(1013, 'only one connection allowed')
        return
    }
    console.log('ws connected, ip: ', req.connection.remoteAddress)
    ws.on('message', async message => {
        console.log('received:', message)
        const msgData = JSON.parse(message)
        const data = msgData.data
        let response;
        try {
            switch (msgData.type) {
                case "getDisciplines":
                    response = (await dbAction.getDisciplines()).map(({ name }) => name)
                    break;
                case "addDiscipline":
                    await dbAction.addDiscipline(data)
                    response = "success"
                    break;
                case "editDiscipline":
                    console.log('update discipline from', data.from, 'to', data.to)
                    await dbAction.addDiscipline(data.to)
                    await dbAction.mergeDisciplines(data.to, [data.from])
                    response = "TB checked"
                    break;
                case "removeDiscipline":
                    console.log('will not remove', data)
                    // await dbAction.removeDiscipline(data)
                    response = "success"
                    break;
                case "mergeDisciplines":
                    await dbAction.mergeDisciplines(data.to, data.from)
                    response = "success"
                    break;
                case "getMenuItems":
                    response = await readMenu();
                    break;
                case "saveMenuItems":
                    response = await saveMenu(data)
                    break;
            }
        } catch (e) {
            console.error(e)
            response = e
        }
        ws.send(JSON.stringify({
            type: msgData.type,
            response
        }))
    })
    ws.on('close', () => {
        console.log('disconnected', req.connection.remoteAddress)
        connected = false
    })
    ws.send(JSON.stringify({
        type: "connected to ws"
    }))
})

async function readMenu() {
    // const token = await wechatAction.getAccessToken();
    // let result = await wechatAction.queryMenuItem(token);
    // console.log('current menu', result)
    return new Promise((accept, reject) => {
        fs.readFile('./config/menu.json', (err, data) => {
        // fs.readFile('./config/menu-mock.json', (err, data) => {
            if (err) {
                reject(err)
            } else {
                accept(data.toString())
            }
        })
    })
}
async function saveMenu(jsonText) {
    let menuItems
    try {
        menuItems = JSON.parse(jsonText)
    } catch (e) {
        throw "Invalid JSON"
    }
    const writeToDisk = new Promise((accept, reject) => {
        fs.writeFile('./config/menu.json', jsonText, (err) => {
        // Using a mock menu.json now for testing
        // fs.writeFile('./config/menu-mock.json', jsonText, (err) => {
            if (err) {
                reject(err)
            } else {
                accept("success")
            }
        })
    })
    const token = await wechatAction.getAccessToken();
  // throw "Mock Failure"
    await wechatAction.deleteMenuItem(token);
    const result = await wechatAction.createMenuItem(token, menuItems);
    console.log(result)
    return writeToDisk
}
module.exports = router;
