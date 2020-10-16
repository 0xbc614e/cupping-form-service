import {horizontalAttributes} from './fields.json';

// 이게 진짜 필요함? 지금 용도가 거 getter 붙여주는 거 말고 없는데
// 아니면 attribute 하나가 바뀌면 score도 바뀌니까 이대로 괜찮다?
export default class Form {
    constructor(attr) {
        for (const key in attr) {
            if (/^\d+(\.\d*)?$/.test(attr[key])) {
                this[key] = parseFloat(attr[key]);
            } else {
                this[key] = attr[key];
            }
        }
    }

    get totalScore() {
        return horizontalAttributes.reduce((prev, curr) => prev + this[curr], 0);
    }

    get defects() {
        return this.defectsNumOfCups * this.defectsIntensity;
    }

    get finalScore() {
        return this.totalScore - this.defects;
    }
}
