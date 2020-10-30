const fs = require('fs');
const parse = require('csv-parse/lib/sync');

import Form from '../Form';

export function importCSV(filename) {
    const csvContents = fs.readFileSync(filename);
    const jsonContents = parse(csvContents, {
        columns: true,
        skip_empty_lines: true,
    });

    let result = [];
    for (const j of jsonContents) {
        const form = new Form(j);
        result.push(form);
    }
    return result;
}

export function bySampleID(forms, id) {
    return forms.find(form => form.sample == id);
}
