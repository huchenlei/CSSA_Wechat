/**
 * Testcases for db_action
 * Created by Charlie on 2017-07-27.
 */

const dbAction = require('./../utils/db_action');
const fs = require('fs');
const expect = require('chai').expect;
const should = require('chai').use(require('chai-as-promised')).should();

const cardPool = JSON.parse(fs.readFileSync('./data/card-pool-private.json'));

const registeredOpenId = "12345";
const unregisteredOpenId = "54321";

describe('initializeDB & getDisciplines & bindUser', function () {
    it('Should add card/discipline info & bind user', async function () {
        await dbAction.initializeDB();
        const disciplines = await dbAction.getDisciplines();
        const bindResult = await dbAction.bindUser(registeredOpenId, cardPool[0]);
        disciplines.should.be.a('Array');
        disciplines.should.have.lengthOf.above(0);

        bindResult.toLowerCase().should.include('success');
    });
    it('Should not allow same card bind twice', async function () {
        dbAction.bindUser(registeredOpenId, cardPool[0]).should.be.rejected;
    });
    it('Should not allow invalid card number', async function () {
        dbAction.bindUser(registeredOpenId, 'Invalid Card').should.be.rejected;
    });
});

describe('updateMemberInfo & queryMemberInfo', function () {
    const queryField = 'name';
    const queryFieldValue = 'Charlie';
    it('Should throw exception if user unregistered', async function () {
        dbAction.queryMemberInfo(unregisteredOpenId).should.be.rejected;
        dbAction.updateMemberInfo(unregisteredOpenId, {}).should.be.rejected;
    });

    it('Should throw exception if field is not filled yet', async function () {
        dbAction.queryMemberInfo(registeredOpenId, queryField).should.be.rejected;
    });

    it('Should update field info / Should query specific field if field param is provided', async function () {
        const newInfo = {};
        newInfo[queryField] = queryFieldValue;
        const updateResult = await dbAction.updateMemberInfo(registeredOpenId, newInfo);
        expect(updateResult.data).to.not.be.undefined;
        expect(updateResult.msg).to.not.be.undefined;
        const queryResult = await dbAction.queryMemberInfo(registeredOpenId, queryField);
        queryResult.data.should.not.be.undefined;
        queryResult.msg.should.include(queryField);
    });

    it('Should return all fields if field param is not provided', async function () {
        const result = await dbAction.queryMemberInfo(registeredOpenId);
        result.data.should.be.a('object');
        result.msg.should.not.be.undefined;
    });
});

describe('validateMember', function () {
    it('Should admit registered user', async function () {
        let result = await dbAction.validateMember(registeredOpenId);
        result.should.have.property('data');
        result.should.have.property('msg');
        result.data.should.be.true;
        result.msg.toLowerCase().should.include('yes');
    });
    it('Should reject unregistered user', async function () {
        let result = await dbAction.validateMember(unregisteredOpenId);
        result.should.have.property('data');
        result.should.have.property('msg');
        result.data.should.be.false;
        result.msg.toLowerCase().should.not.include('yes');
    });
});

describe('addDiscipline', function () {
    const testDiscipline = 'A Test Discipline';
    it('Should add previously not existed discipline to database', async function () {
        const disciplines = await dbAction.getDisciplines();
        expect(disciplines.find(d => d.name === testDiscipline)).to.be.undefined;
        const result = await dbAction.addDiscipline(testDiscipline);
        result.name.should.be.eql(testDiscipline);
    });

    it('Should report Error if add existing discipline to database', async function () {
        const disciplines = await dbAction.getDisciplines();
        disciplines.should.have.lengthOf.above(0);
        dbAction.addDiscipline(disciplines[0].name).should.be.rejected;
    });
});

describe('mergeDisciplines', function () {
    const testDisciplines = ['d', 'd1', 'd2', 'd3'];
    const mergeTarget = testDisciplines[0];
    it('Should merge d1, d2, d3 to d', async function () {
        for (let i = 0; i < testDisciplines.length; i++) {
            const openId = `openId${i}`;
            await dbAction.addDiscipline(testDisciplines[i]);
            await dbAction.bindUser(openId, cardPool[i + 1]);
            await dbAction.updateMemberInfo(openId, { discipline: testDisciplines[i] });
        }
        await dbAction.mergeDisciplines(mergeTarget, testDisciplines);
        // User list should be updated
        for (let i = 0; i < testDisciplines; i++) {
            const openId = `openId${i}`;
            const result = await dbAction.queryMemberInfo(openId, 'discipline');
            result.data.to.be.eql(mergeTarget);
        }
        // Discipline list should be updated
        const result = await dbAction.getDisciplines();
        testDisciplines.forEach((discipline) => {
            let disFind = result.find(d => d.name === discipline);
            if (discipline === mergeTarget) {
                expect(disFind).not.to.be.undefined;
            } else {
                expect(disFind).to.be.undefined;
            }
        });
    });
});

module.exports = { registeredOpenId, unregisteredOpenId };