/**
 * Testcases for db_action
 * Created by Charlie on 2017-07-27.
 */

const dbAction = require('./db_action');
const fs = require('fs');

const cardPool = JSON.parse(fs.readFileSync('../data/card-pool-private.json'));
const openId = "1234";
// dbAction.initializeDB();
// dbAction.bindUser(openId, cardPool[1]).then(console.log);
// dbAction.queryMemberInfo(openId, "name").then(console.log);
// dbAction.queryMemberInfo(openId).then(console.log);
// dbAction.updateMemberInfo(openId, {
//     name: "Emily",
//     email: "Chen.hu@mail.utoronto.ca",
//     discipline: "Electrical"
// }).then(console.log).catch(console.error);
// dbAction.validateMember(openId).then(console.log);
// dbAction.addDiscipline("ECE");
// dbAction.addDiscipline("Electrical");
// dbAction.getDisciplines().then(console.log);
// dbAction.mergeDisciplines('ECE', ['Electrical']).then(console.log);

