/**
 * Testcases for db_action
 * Created by Charlie on 2017-07-27.
 */

const dbAction = require('./db_action');
const fs = require('fs');

const cardPool = JSON.parse(fs.readFileSync('../data/card-pool-private.json'));
const openId = "123";
dbAction.initializeDB();
// dbAction.bindUser(openId, cardPool[0]).then(console.log);
// dbAction.queryMemberInfo(openId, "name").then(console.log);
// dbAction.queryMemberInfo(openId).then(console.log);
// dbAction.updateMemberInfo(openId, {name: "Charlie", email: "Chen.hu@mail.utoronto.ca"}).then(console.log).catch(console.error);
// dbAction.validateMember(openId).then(console.log);
