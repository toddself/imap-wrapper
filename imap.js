'use strict';

const IMAP = require('imap');

const log = require('./logger');

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

ImapConnection.prototype.openBox = function (box, cb) {
  this.currentBox = box;
  const self = this;
  this.imap.openBox(box, function(err, box){
    if (err) {
      log.fatal(err);
      return;
    }
    self.openBox = box;
    cb();
  });
};

ImapConnection.prototype.closeBox = function (expunge, cb) {
  expunge = expunge || false;
  this.imap.closeBox(expunge, function(){
    this.openBox = void 0;
    this.currentBox = void 0;
    return cb();
  });
};

ImapConnection.prototype._list = function (items, page, cb) {
  const start = items * page;
  const end = start + items;
  const seq = [start, end].join(':');
  const opts = {
    bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
    struct: true
  };
  const messageList = {};
  const self = this;

  this.imap.seq
    .fetch(seq, opts)
    .on('message', function( msg, seqno) {
      msg.on('body', function (stream) {
        let buffer = '';

        stream.on('data', function (chunk) {
          buffer += chunk.toString('utf8');
        });

        stream.on('end', function() {
          messageList[seqno] = buffer;
          buffer = '';
        });
      });
    })
    .on('error', function (err) {
      log.fatal('Unable to obtain message list', {err: err});
      cb(err);
    })
    .on('end', function () {
      self.messageList = messageList;
      return cb(null, messageList);
    });
};

ImapConnection.prototype.listBox = function (box, items, page, cb) {
  if(box !== this.currentBox || !this.openBox){
    const self = this;
    return this.openBox(box, function () {
      self._list(items, page, cb);
    });
  }
  this._list(items, page, cb);
};


module.exports = ImapConnection;
