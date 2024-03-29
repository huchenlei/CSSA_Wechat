/**
 * This module defines all database actions
 * Executing this file directly will initialize database data from card-number-pool json file
 */
const crypto = require('crypto');
const assert = require('assert');
const mongoose = require('mongoose');
const fs = require('fs');
const encryptCardId = require('./encrypter').encrypt;
const Promise = require('q').Promise;
mongoose.Promise = Promise; // Use q for mongoose promises

const userSchema = mongoose.Schema({
    openId: String,
    joinedTime: {type: Date, default: null},
    detailedInfo: {
        name: {type: String, default: ""},
        graduation: {type: Number, default: 1970},
        discipline: {type: String, default: ""},
        email: {type: String, default: ""},
        phone: {type: String, default: ""}
    },
    cssaCardNumber: {type: String, required: true, unique: true, dropDups: true},
    cardAvailable: Boolean
}, {minimize: false});

const disciplineSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true, dropDups: true}
});

const conn = mongoose.createConnection('mongodb://localhost:27017/CssaWechat', {useMongoClient: true});
const User = conn.model('users', userSchema); // The user model(use users collection in database)
const Discipline = conn.model('disciplines', disciplineSchema);

conn.on('error', console.error.bind(console, 'connection error:'));

const USER_INFO_FIELDS = Object.keys(new User().detailedInfo);

/**
 * add empty card info to database
 * @param jsonPath the path to json public file
 * @return Promise
 */
function addAvailableCards(jsonPath) {
    const cardIds = JSON.parse(fs.readFileSync(jsonPath)); // array containing all card ids
    const users = [];
    cardIds.forEach((cardId) => {
        let newUser = new User();
        newUser.cardAvailable = true;
        newUser.cssaCardNumber = cardId;
        users.push(newUser);
    });
    return User.insertMany(users); // return a promise obj
}

/**
 * Drop the users collection and initialize with test data
 * [WARNING] Do NOT use this function in production env
 * @return Promise
 */
function initializeDB() {
    const disciplines = ["ECE", "EngSci", "Chem", "Civ", "Mech", "Indy", "Material", "Mining"];
    return Promise.all([
        User.remove().exec() // clean users collection
            .then(() => addAvailableCards('./data/card-pool-public.json')),
        Discipline.remove().exec() //clean disciplines
            .then(() => disciplines.forEach(addDiscipline))])
}

/**
 * Bind the wechat user to specific card in database
 * @param openId unique wechat id for each wechat user
 * @param cardNumber private card number (unencrypted)
 * @return Object
 */
async function bindUser(openId, cardNumber) {
    const encryptedCardId = encryptCardId(cardNumber);
    const card = await User.findOne({cssaCardNumber: encryptedCardId});
    if (!card) throw "Sorry, the card number seems to be invalid";
    if (!card.cardAvailable) throw "Sorry, the card is already bind to a wechat account";
    const user = await User.findOne({openId: openId});
    if (user) throw "Sorry, you are already a member of CSSA! You can not bind another card";
    await User.updateOne(
        {cssaCardNumber: encryptedCardId, cardAvailable: true},
        {openId: openId, cardAvailable: false, joinedTime: Date.now()});
    return {msg: "Bind card successful!"};
}

/**
 * Query the member information they previously filled
 * @param openId unique wechat id for each wechat user
 * @param field information field
 * @return Object
 * @throws String the commandline feedback to user
 */
async function queryMemberInfo(openId, field) {
    let result = {};
    let user = await User.findOne({openId: openId});
    if (!user) throw "Sorry, you are not yet a member of CSSA, please bind a card first";
    if (field) { // query specific field
        if (!(user.detailedInfo && user.detailedInfo[field]))
            throw `The information field ${field} not yet filled, please fill the information first`;
        result['data'] = user.detailedInfo[field];
        result['msg'] = `${field}: ${user.detailedInfo[field]}`;
    } else { // Query all information
        result['data'] = user.detailedInfo;
        result['msg'] = JSON.stringify(user.detailedInfo, null, 4);
    }
    return result;
}


/**
 * Update user's information (user.detailedInfo) fields
 * @param openId
 * @param newInfo
 * @return {{}}
 */
async function updateMemberInfo(openId, newInfo) {
    let result = {};
    let user = await User.findOne({openId: openId});
    if (!user) throw "Sorry, you are not yet a member of CSSA, please bind a card first";
    result['msg'] = `${JSON.stringify(user.detailedInfo, null, 4)} => ${JSON.stringify(newInfo, null, 4)}`;
    let update = {};
    Object.keys(newInfo).map((key) => {
        update[`detailedInfo.${key}`] = newInfo[key];
    });
    result['data'] = await User.updateOne({openId: openId}, {$set: update});
    return result;
}

/**
 * Validate the membership of given user
 * @param openId
 * @return {Promise.<T>|Promise}
 */
async function validateMember(openId) {
    let user = await User.findOne({openId: openId});
    return user ?
        {
            'msg': `Yes, you are currently a member of CSSA! Your public key is ${user.cssaCardNumber}`,
            'data': true
        } : {'msg': "Sorry, you are not a member of CSSA.", 'data': false}
}

/**
 * Add new discipline to discipline list
 * @param name
 */
async function addDiscipline(name) {
    assert(typeof name === 'string');
    let newDiscipline = new Discipline();
    newDiscipline.name = name;
    return await newDiscipline.save();
}

/**
 * Return all disciplines
 * @return {*|{}|T|Query}
 */
async function getDisciplines() {
    return await Discipline.find();
}

/**
 * Merge multiple disciplines with different names but essentially the same
 * [WARNING] reserved api for admin users
 * @param targetDis the final discipline obj of all disciplines listed
 * @param dList discipline list to be replaced by the target
 */
async function mergeDisciplines(targetDis, dList) {
    assert(dList instanceof Array, 'dList must be an array!');
    assert(typeof targetDis === 'string', 'targetDis must be string');
    for (const discipline of dList) {
        assert(typeof discipline === 'string');
        // remove duplications in Discipline collection
        if (discipline !== targetDis)
            await Discipline.remove({name: discipline}).exec();
        // update the discipline field in user schema
        await User.updateMany({'detailedInfo.discipline': discipline}, {$set: {'detailedInfo.discipline': targetDis}});
    }
}

module.exports = {
    addAvailableCards,
    initializeDB,
    bindUser,
    queryMemberInfo,
    updateMemberInfo,
    validateMember,

    addDiscipline,
    getDisciplines,
    mergeDisciplines,
    USER_INFO_FIELDS
};
