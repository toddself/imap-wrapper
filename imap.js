'use strict';

const IMAP = require('imap');

const Mailbox = require('./mailbox');
const log = require('./logger');

const defaultStart = 0;
const defaultPageSize = 30;

function ImapConnection(config){
  this.config = config;
  this.imap = new IMAP({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    tls: true,
    debug: config.debug || false
  });
  this.mailboxes = {};
}

ImapConnection.prototype.connect = function (cb) {
  this.imap.once('ready', cb);

  this.imap.on('error', function (err) {
    log.fatal('IMAP Error', {err: err});
  });

  this.imap.on('end', function(){
    log.info('IMAP connection closed');
  });

  this.imap.connect();
};

ImapConnection.prototype.getMailForBox = function(mailbox, options, cb) {
  const start = options.start || defaultStart;
  const end = (start + 1) * (options.page || defaultPageSize);
  const self = this;

  if (this.mailboxes[mailbox]) {
    return this.mailboxes[mailbox].listMail(start, end, options.headers, cb);
  }

  this.mailboxes[mailbox] = new Mailbox(mailbox, this.imap);
  this.mailboxes[mailbox].open(function () {
    self.mailboxes[mailbox].listMail(start, end, options.headers, cb);
  });
};

ImapConnection.prototype.listBoxes = function (ns, cb) {
  if (typeof ns === 'function') {
    cb = ns;
    ns = undefined;
  }

  this.imap.getBoxes(ns, function(err, boxList){
    if (err) {
      return cb(err);
    }
    this.boxList = boxList;
    cb(null, this.boxList);
  });
};

module.exports = ImapConnection;
