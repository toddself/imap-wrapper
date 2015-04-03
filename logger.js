'use strict';

const path = require('path');
const bunyan = require('bunyan');
const config = require('./config');

const log = bunyan.createLogger({
  name: 'nodemailapp',
  streams: [
    {
      level: 'info',
      path: path.join(config.logPath, 'nodemailapp.log')
    },
    {
      level: 'fatal',
      stream: process.stdout
    }
  ]
});

module.exports = log;
