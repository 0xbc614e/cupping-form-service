import * as queryProcessor from "./queryProcessor";
import * as metafields from "./metafields.json";

const fields = Object.keys(metafields);
const lowerCasedFields = fields.map(value => value.toLowerCase());
const numericAttributes = fields.filter(value => metafields[value].type == "number");

export async function get() {
    let forms = await queryProcessor.getForms();
    forms.sort((a, b) => b.finalScore - a.finalScore);
    return forms;
}

export async function getByAttribute(attributes) {
    let forms = await queryProcessor.getForms();

    let scores = [];
    for (const form of forms) {
        const score = attributes.reduce((prev, curr) => {
            const fi = lowerCasedFields.indexOf(curr.toLowerCase());
            const f = fi != -1 ? fields[fi] : curr;
            return prev + form[f];
        }, 0);
        scores.push({score, form});
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.map(value => value.form);
}

export async function getSimiliar(form) {
    let forms = await queryProcessor.getForms();
    return sortFormsByDistance(forms, form);
}

export async function getSimiliarByAttribute(form, attributes) {
    let forms = await queryProcessor.getForms();
    return sortFormsByDistance(forms, form, attributes);
}

function sortFormsByDistance(forms, anchorForm, keyAttributes = []) {
    let distances = [];
    for (const f of forms) {
        const distance = getFormDistance(anchorForm, f, keyAttributes);
        distances.push({distance, form: f});
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.map(value => value.form);
}

function getFormDistance(a, b, keyAttributes = []) {
    let result = 0;
    const p = 2;

    for (const attr of numericAttributes) {
        const metafield = metafields[attr];
        const isKey = keyAttributes.includes(attr);
        const aAttr = isKey ? metafield.max : a[attr];
        
        let term;
        if (typeof aAttr === 'number') {
            if (typeof b[attr] === 'number') {
                // 일반 거리
                term = aAttr - b[attr];
            } else {
                // 가장 멀도록 b[attr] 조정
                term = Math.max(aAttr - metafield.min, metafield.max - aAttr);
            }
        } else {
            if (typeof b[attr] === 'number') {
                // b[attr]가 높을 수록 가깝게
                term = metafield.max - b[attr];
            } else {
                // 없으면 최대로
                term = metafield.max - metafield.min;
            }
        }
        term /= metafield.max - metafield.min;
        if (isKey) term *= 2;
        result += Math.pow(Math.abs(term), p);
    }

    result = Math.pow(result, 1 / p);
    return result;
}
