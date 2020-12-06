const testUtil = require('../testUtil');
const queryProcessor = require('../../queryProcessor');
const recommender = require('../../recommender');

jest.mock('../../queryProcessor');

const DATASET1_CSV = "src/__tests__/data/dataset1.csv";
const DATASET2_CSV = "src/__tests__/data/dataset2.csv";
const QUERY1_CSV = "src/__tests__/data/query1.csv";
const QUERY2_CSV = "src/__tests__/data/query2.csv";

describe("dataset #1: form 30개", () => {
    beforeAll(() => {
        const dbData = testUtil.importCSV(DATASET1_CSV);
        queryProcessor.getForms.mockResolvedValue(dbData);
    });
    
    test('가장 좋은 폼 추천', async () => {
        const results = await recommender.get();
        
        expect(results[0].evaluation_index).toBe(24);
    });
    
    test('fragrance 속성이 뛰어난 폼 추천', async () => {
        const results = await recommender.getByAttribute(['fragrance']);
    
        expect(results[0].evaluation_index).toBe(21);
    });
    
    test('세 가지 속성이 뛰어난 폼 추천', async () => {
        const results = await recommender.getByAttribute([
            'fragrance',
            'acidity',
            'uniformity',
        ]);
    
        expect(results[0].evaluation_index).toBe(27);
    });
    
    test('본인의 폼과 비슷한 폼 추천', async () => {
        const forms = testUtil.importCSV(QUERY1_CSV);
        const form = testUtil.byFormName(forms, 'Sim_1');
        const results = await recommender.getSimilar(form);
    
        expect(results[0].evaluation_index).toBe(18);
    });
    
    test('본인의 폼과 비슷하면서 flavor, body, overall 속성이 뛰어난 폼 추천', async () => {
        const forms = testUtil.importCSV(QUERY1_CSV);
        const form = testUtil.byFormName(forms, 'SimKey_1');
        const results = await recommender.getSimilarByAttribute(form, [
            'flavor',
            'bodiness',
            'overall',
        ]);
    
        expect(results[0].evaluation_index).toBe(1);
    });
});

describe("dataset #2: form 1000개", () => {
    beforeAll(() => {
        const dbData = testUtil.importCSV(DATASET2_CSV);
        queryProcessor.getForms.mockResolvedValue(dbData);
    });

    test('가장 좋은 폼 추천', async () => {
        const results = await recommender.get();
        
        expect(results[0].evaluation_index).toBe(717);
    });

    test('세 가지 속성이 뛰어난 폼 추천', async () => {
        const results = await recommender.getByAttribute([
            'flavor',
            'acidity',
            'bodiness',
        ]);
    
        expect(results[0].evaluation_index).toBe(92);
    });

    test('본인의 폼과 비슷하면서 aftertaste, overall 속성이 뛰어난 폼 추천', async () => {
        const forms = testUtil.importCSV(QUERY2_CSV);
        const form = testUtil.byFormName(forms, 'SimKey_2');
        const results = await recommender.getSimilarByAttribute(form, [
            'afterTaste',
            'overall',
        ]);
    
        expect(results[0].evaluation_index).toBe(430);
    });
});

describe("다른 방식의 입력 처리", () => {
    beforeAll(() => {
        const dbData = testUtil.importCSV(DATASET1_CSV);
        queryProcessor.getForms.mockResolvedValue(dbData);
    });

    describe("속성은 대소문자 가리지 않아도 됨", () => {
        test("뛰어난 속성 추천", async () => {
            let results = await recommender.getByAttribute([
                "Fragrance",
                "ACIDITY",
                "UnIfOrMiTy",
            ]);
    
            expect(results[0].evaluation_index).toBe(27);
        });
    
        test("본인 폼 기반 뛰어난 속성 추천", async () => {
            const forms = testUtil.importCSV(QUERY1_CSV);
            const form = testUtil.byFormName(forms, "SimKey_1");
            let results = await recommender.getSimilarByAttribute(form, [
                "FLavor",
                "BODINESS",
                "overAll",
            ]);
    
            expect(results[0].evaluation_index).toBe(1);
        });
    });

    test("유사한 폼 추천에 자기 자신은 끼지 않음", async () => {
        const dbData = testUtil.importCSV(DATASET1_CSV);
        const form = dbData[0];

        const result = await recommender.getSimilar(form);
        expect(result[0]).not.toEqual(form);
    });
});

describe("잘못된 입력에 대한 오류 처리", () => {
    beforeAll(() => {
        const dbData = testUtil.importCSV(DATASET1_CSV);
        queryProcessor.getForms.mockResolvedValue(dbData);
    });

    test("유효하지 않은 속성", () => {
        return expect(recommender.getByAttribute(["fragrance", "aroma"])).rejects.toBeTruthy();
    });

    test("속성은 string이 아닌 array<string>", () => {
        return expect(recommender.getByAttribute("fragrance")).rejects.toBeTruthy();
    });
});