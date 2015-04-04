'use strict';

const bunyan = require('bunyan');

const log = bunyan.createLogger({
  name: 'nodemailapp',
  streams: [
    {
      level: process.env.LOG_LEVEL || 'fatal',
      stream: process.stdout
    }
  ]
});

module.exports = log;
