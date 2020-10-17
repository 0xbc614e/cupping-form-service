const testUtil = require('../testUtil');
const queryProcessor = require('../../queryProcessor');
const recommender = require('../../recommender');

jest.mock('../../queryProcessor');

const DATASET1_CSV = "src/__tests__/data/dataset1.csv";
const DATASET2_CSV = "src/__tests__/data/dataset2.csv";
const QUERY1_CSV = "src/__tests__/data/query1.csv";

describe("dataset #1: form 30개", () => {
    beforeAll(() => {
        const dbData = testUtil.importCSV(DATASET1_CSV);
        queryProcessor.getForms.mockResolvedValue(dbData);
    });
    
    test('가장 좋은 폼 추천', async () => {
        const results = await recommender.get();
        
        expect(results[0].notes).toEqual('final 최고득점');
    });
    
    test('fragrance 속성이 뛰어난 폼 추천', async () => {
        const results = await recommender.getByAttribute(['fragrance']);
    
        expect(results[0].notes).toEqual('fragrance 최고득점');
    });
    
    test('세 가지 속성이 뛰어난 폼 추천', async () => {
        const results = await recommender.getByAttribute([
            'fragrance',
            'acidity',
            'uniformity',
        ]);
    
        expect(results[0].notes).toEqual('fragrance, acidity, uniformity 최고득점');
    });
    
    test('본인의 폼과 비슷한 폼 추천', async () => {
        const forms = testUtil.importCSV(QUERY1_CSV);
        const form = testUtil.bySampleID(forms, 'Sim_1');
        const results = await recommender.getSimiliar(form);
    
        expect(results[0].sampleID).toEqual(form.notes);
    });
    
    test('본인의 폼과 비슷하면서 flavor, body, overall 속성이 뛰어난 폼 추천', async () => {
        const forms = testUtil.importCSV(QUERY1_CSV);
        const form = testUtil.bySampleID(forms, 'SimKey_1');
        const results = await recommender.getSimiliarByAttribute(form, [
            'flavor',
            'body',
            'overall',
        ]);
    
        expect(results[0].sampleID).toEqual(form.notes);
    });
});

describe("dataset #2: form 1000개", () => {
    beforeAll(() => {
        const dbData = testUtil.importCSV(DATASET2_CSV);
        queryProcessor.getForms.mockResolvedValue(dbData);
    });

    test('가장 좋은 폼 추천', async () => {
        const results = await recommender.get();
        
        expect(results[0].notes).toEqual('final 최고득점');
    });

    test('세 가지 속성이 뛰어난 폼 추천', async () => {
        const results = await recommender.getByAttribute([
            'flavor',
            'acidity',
            'body',
        ]);
    
        expect(results[0].notes).toEqual('flavor, acidity, body 최고득점');
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
    
            expect(results[0].notes).toEqual("fragrance, acidity, uniformity 최고득점");
        });
    
        test("본인 폼 기반 뛰어난 속성 추천", async () => {
            const forms = testUtil.importCSV(QUERY1_CSV);
            const form = testUtil.bySampleID(forms, "SimKey_1");
            let results = await recommender.getSimiliarByAttribute(form, [
                "FLavor",
                "BODY",
                "overAll",
            ]);
    
            expect(results[0].sampleID).toEqual(form.notes);
        });
    });
});

describe("잘못된 입력에 대한 오류 처리", () => {
    beforeAll(() => {
        const dbData = testUtil.importCSV(DATASET1_CSV);
        queryProcessor.getForms.mockResolvedValue(dbData);
    });

    test("유효하지 않은 속성. (aroma보단 fragrance로 용어 통일)", () => {
        return expect(recommender.getByAttribute(["fragrance", "aroma"])).rejects.toBeTruthy();
    });

    test("속성은 string이 아닌 array<string>", () => {
        return expect(recommender.getByAttribute("fragrance")).rejects.toBeTruthy();
    });

    test("new Form을 통해서 생성된 것만 허용", () => {
        // 그래야 type 때문에 생기는 잠재적인 오묘한 버그를 막을 수 있음.
        return expect(recommender.getSimiliar({
            "sampleID": "invalid fragrance",
            "sampleRoastLevel": 4,
            "fragrance": 6.25,
            "fragranceDry": 3,
            "fragranceBreak": 5,
            "flavor": 7.75,
            "aftertaste": 7.0,
            "acidity": 7.5,
            "acidityIntensity": 4,
            "body": 8.0,
            "bodyLevel": 2,
            "balance": 7.25,
            "uniformity": 10,
            "cleanCup": 10,
            "sweetness": 8,
            "overall": 7.25,
            "defectsNumOfCups": 0,
            "defectsIntensity": 0,
            "notes": "이건 안 됌"
        })).rejects.toBeTruthy();
    });
});