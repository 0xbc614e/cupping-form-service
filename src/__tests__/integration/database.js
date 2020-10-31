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
            user_num: 0,
            user_name: "tester",
            user_id: "test",
            user_password: "xccfgll"
        };
        
        beforeEach(async () => {
            await queryProcessor.clearForms();
            await queryProcessor.clearUsers();

            await queryProcessor.addUser(testUser);
        });

        test('데이터베이스에 폼 업로드 및 삭제', async () => {
            const targets = testUtil.importCSV('src/__tests__/data/query1.csv');
            for (const target of targets) {
                await queryProcessor.addForm(target);
            }

            const query = {
                user_num: testUser.user_num,
                sample: "Sim_1"
            };
            const results = await queryProcessor.getForms(query);
            expect(results.length).not.toBe(0);

            await queryProcessor.removeForms(query);

            const emptyResults = await queryProcessor.getForms(query);
            expect(emptyResults.length).toBe(0);
        });
        
        test('데이터베이스에 다량의 폼 업로드', async () => {
            const query = {user_num: testUser.user_num};
            let forms = await queryProcessor.getForms(query);
            const previousNum = forms.length;

            const targets = testUtil.importCSV('src/__tests__/data/dataset1.csv');
            for (const target of targets) {
                await queryProcessor.addForm(target);
            }

            forms = await queryProcessor.getForms(query);
            const num = forms.length;
            expect(num).toBe(previousNum + 30);
        });

        const invalidForms = require('../data/invalidForms.json');
        test.each(invalidForms)('잘못된 폼 업로드 방지 %#', async (invalidForm) => {
            return expect(queryProcessor.addForm(invalidForm)).rejects.toBeTruthy();
        });

        test("폼 수정", async () => {
            const targets = testUtil.importCSV('src/__tests__/data/query1.csv');
            for (const target of targets) {
                await queryProcessor.addForm(target);
            }

            const query = {
                user_num: testUser.user_num,
                sample: "SimKey_1"
            };
            const valueInfo = {
                fragAroma: 8.75,
                overall: 8.25
            };
            await queryProcessor.modifyForms(query, valueInfo);

            const actualForm = await queryProcessor.getForms(query);
            for (const attr in valueInfo) {
                expect(actualForm[0][attr]).toBe(valueInfo[attr]);
            }
        });

        const invalidValueInfo = require("../data/invalidValueInfo.json");
        test.each(invalidValueInfo)("잘못된 폼 수정(query: %o)", async invalidValueInfo => {
            const target = testUtil.importCSV('src/__tests__/data/query1.csv')[0];
            await queryProcessor.addForm(target);

            return expect(queryProcessor.modifyForms({user_num: testUser.user_num}, invalidValueInfo)).rejects.toBeTruthy();
        });
    });

    describe('사용자 DB 제어', () => {
        beforeEach(async () => {
            await queryProcessor.clearForms();
            await queryProcessor.clearUsers();
        });

        test('사용자 추가', async () => {
            const previousUsers = await queryProcessor.getUsers();

            await queryProcessor.addUser({
                user_name: "Alice",
                user_id: "a12345",
                user_password: "xcv$g"
            });
            await queryProcessor.addUser({
                user_name: "Bob",
                user_id: "bobobobobob",
                user_password: "b99b90df00)"
            });
            
            const users = await queryProcessor.getUsers();
            expect(users.length).toBeGreaterThanOrEqual(previousUsers.length + 2);
        });
    });
});