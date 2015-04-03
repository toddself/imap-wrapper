'use strict';

const level = require('level');
const sublevel = require('level-sublevel');

const config = require('./config');
const db = sublevel(level(config.dataPath, {valueEncoding: 'json'}));

module.exports = db;
