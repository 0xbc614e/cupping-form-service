const mysql = require('mysql');
const env = require('dotenv').config().parsed;

import Form from './Form';

const dbConfig = {
    host     : env.HOST_URL,
    user     : env.USER_ID,
    password : env.USER_PASSWORD,
    database : env.DATABASE_NAME,
};
const tableForm = env.TABLE_FORM;
const tableUser = env.TABLE_USER;

let connection = mysql.createConnection(dbConfig);

export function connect() {
    return new Promise((resolve, reject) => {
        connection.connect(error => {
            if (error) reject(error);
            resolve();
        });
    });
}

export function disconnect() {
    return new Promise((resolve, reject) => {
        connection.end(error => {
            if (error) reject(error);
            resolve();
        });
    });
}

export function addForm(form, user) {
    const record = {ip: user.ip, ...form};
    return singleQuery(insertInto(tableForm, record));
}

export async function getForms(queryInfo) {
    const queryResult = await singleQuery(selectFrom(tableForm, queryInfo));

    let result = [];
    for (const q of queryResult) {
        result.push(new Form(q));
    }
    return result;
}

export async function modifyForms(queryInfo, valueInfo) {
    return await singleQuery(updateSet(tableForm, valueInfo, queryInfo));
}

export async function removeForms(queryInfo) {
    return await singleQuery(deleteFrom(tableForm, queryInfo));
}

export async function clearForms() {
    return await singleQuery(deleteFrom(tableForm));
}

export async function addUser(ip, name) {
    return await singleQuery(insertInto(tableUser, {ip, name}));
}

export async function getUser(ip) {
    return await singleQuery(selectFrom(tableUser, {ip}, ["ip", "name"]));
}

export async function getUsers() {
    return await singleQuery(selectFrom(tableUser, undefined, ["ip", "name"]));
}

export async function clearUsers() {
    return await singleQuery(deleteFrom(tableUser));
}

function singleQuery(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
}

function selectFrom(table, query, column) {
    let columnString;
    if (typeof column === 'undefined' || column.length == 0) columnString = "*";
    else columnString = column.map(value => mysql.escapeId(value)).join(",");

    return `SELECT ${columnString} FROM ${mysql.escapeId(table)} ${where(query)};`;
}

function insertInto(table, obj) {
    let attributes = [];
    let values = [];
    for (const key in obj) {
        attributes.push(mysql.escapeId(key));
        values.push(mysql.escape(obj[key]));
    }
    return `INSERT INTO ${mysql.escapeId(table)}(${attributes.join(",")}) VALUES (${values.join(",")});`;
}

function updateSet(table, value, query) {
    return `UPDATE ${mysql.escapeId(table)} ${set(value)} ${where(query)};`;
}

function deleteFrom(table, query) {
    return `DELETE FROM ${mysql.escapeId(table)} ${where(query)};`;
}

function where(query) {
    if (typeof query === "undefined" || query.length == 0) return "";

    let filters = [];
    for (const key in query) {
        filters.push(`${mysql.escapeId(key)}=${mysql.escape(query[key])}`);
    }
    return `WHERE ${filters.join(" AND ")}`;
}

function set(value) {
    let modifiers = [];
    for (const key in value) {
        modifiers.push(`${mysql.escapeId(key)}=${mysql.escape(value[key])}`);
    }
    return `SET ${modifiers.join(",")}`;
}