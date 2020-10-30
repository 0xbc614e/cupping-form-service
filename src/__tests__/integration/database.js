const mysql = require('mysql');

const testUtil = require('../testUtil');
const queryProcessor = require('../../queryProcessor');

const env = require('dotenv').config().parsed;

describe('실제 DB 연결', () => {
    let connection;

    beforeAll(done => {
        connection = mysql.createConnection({
            host     : env.TEST_HOST_URL,
            user     : env.TEST_USER_ID,
            password : env.TEST_USER_PASSWORD,
            database : env.TEST_DATABASE_NAME,
        });

        connection.connect(error => {
            if (error) {
                console.error('Connection error:');
                console.error('Message: ' + error.message);
                console.error('Stack: ' + error.stack);
                done(error);
            }
            done();
        });
    });

    afterAll(done => {
        connection.end(error => {
            if (error) {
                console.error('Disconnection error:');
                console.error('Message: ' + error.message);
                console.error('Stack: ' + error.stack);
                done(error);
            }
            done();
        });
    });

    test('가장 기본적인 연결.', done => {
        connection.query('SELECT 1 AS test', (error, results) => {
            if (error) done(error);
    
            expect(results[0].test).toBe(1);
    
            done();
        });
    });
});

describe('DB 제어', () => {
    beforeAll(async () => {
        await queryProcessor.connect();
    });

    afterAll(async () => {
        await queryProcessor.disconnect();
    });

    describe('커핑 폼 DB 제어', () => {
        const testUser = {
            ip: "127.0.0.2",
            name: "tester",
        };
        
        beforeEach(async () => {
            await queryProcessor.clearForms();
            await queryProcessor.clearUsers();

            await queryProcessor.addUser(testUser.ip, testUser.name);
        });

        test('데이터베이스에 폼 업로드 및 삭제', async () => {
            const targets = testUtil.importCSV('src/__tests__/data/query1.csv');
            for (const target of targets) {
                await queryProcessor.addForm(target, testUser);
            }

            const query = {
                ip: testUser.ip,
                sampleID: "Sim_1"
            };
            const results = await queryProcessor.getForms(query);
            expect(results.length).not.toBe(0);

            await queryProcessor.removeForms(query);

            const emptyResults = await queryProcessor.getForms(query);
            expect(emptyResults.length).toBe(0);
        });
        
        test('데이터베이스에 다량의 폼 업로드', async () => {
            const query = {ip: testUser.ip};
            let forms = await queryProcessor.getForms(query);
            const previousNum = forms.length;

            const targets = testUtil.importCSV('src/__tests__/data/dataset1.csv');
            for (const target of targets) {
                await queryProcessor.addForm(target, testUser);
            }

            forms = await queryProcessor.getForms(query);
            const num = forms.length;
            expect(num).toBe(previousNum + 30);
        });

        const invalidForms = require('../data/invalidForms.json');
        test.each(invalidForms)('잘못된 폼 업로드 방지', async (invalidForm) => {
            return expect(queryProcessor.addForm(invalidForm, testUser)).rejects.toBeTruthy();
        });

        test("폼 수정", async () => {
            const targets = testUtil.importCSV('src/__tests__/data/query1.csv');
            for (const target of targets) {
                await queryProcessor.addForm(target, testUser);
            }

            const query = {
                ip: testUser.ip,
                sampleID: "SimKey_1"
            };
            const valueInfo = {
                fragrance: 8.75,
                overall: 8.25
            };
            await queryProcessor.modifyForms(query, valueInfo);

            const actualForm = await queryProcessor.getForms(query);
            for (const attr in valueInfo) {
                expect(actualForm[0][attr]).toBe(valueInfo[attr]);
            }
        });

        const invalidValueInfo = require("../data/invalidValueInfo.json");
        test.each(invalidValueInfo)("잘못된 폼 수정", async invalidValueInfo => {
            const target = testUtil.importCSV('src/__tests__/data/query1.csv')[0];
            await queryProcessor.addForm(target, testUser);

            return expect(queryProcessor.modifyForms({ip: testUser.ip}, invalidValueInfo)).rejects.toBeTruthy();
        });
    });

    describe('사용자 DB 제어', () => {
        beforeEach(async () => {
            await queryProcessor.clearForms();
            await queryProcessor.clearUsers();
        });

        test('사용자 추가', async () => {
            const previousUsers = await queryProcessor.getUsers();

            await queryProcessor.addUser("127.0.0.2", "Alice");
            await queryProcessor.addUser("127.0.0.3", "Bob");

            const users = await queryProcessor.getUsers();
            expect(users.length).toBeGreaterThanOrEqual(previousUsers.length + 2);
        });
    });
});