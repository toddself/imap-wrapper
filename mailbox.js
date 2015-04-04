'use strict';

const IMAP = require('imap');
const log = require('./logger');

function Mailbox (box, imapInstance) {
  this.imap = imapInstance;
  this.box = box;
  this.messageList = [];
}

Mailbox.prototype.open = function (cb) {
  const self = this;
  if (this.mailbox) {
    return cb();
  }

  this.imap.openBox(this.box, function(err, box){
    if (err) {
      log.fatal(err);
      return;
    }
    self.mailbox = box;
    cb();
  });
};

Mailbox.prototype.close = function (expunge, cb) {
  expunge = expunge || false;
  const self = this;
  this.imap.closeBox(expunge, function(){
    self.mailbox = void 0;
    return cb();
  });
};

Mailbox.prototype.listMail = function (start, end, headers, cb) {
  const defaultHeaders = 'FROM TO SUBJECT DATE';
  if (typeof headers === 'function') {
    cb = headers;
    headers = defaultHeaders;
  }
  const seq = [start, end].join(':');
  const opts = {
    bodies: `HEADER.FIELDS (#{headers})`,
    struct: true
  };
  const messageList = [];
  const self = this;

  this.imap.seq
    .fetch(seq, opts)
    .on('message', function(msg, seqno) {
      msg.on('body', function (stream, info) {
        const headerBuffer = [];

        stream.on('data', function (chunk) {
          headerBuffer.push(chunk.toString('utf8'));
        });

        stream.on('end', function() {
          console.log('INFO', info);
          messageList[seqno] = IMAP.parseHeader(headerBuffer.join(''));
          headerBuffer = '';
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

module.exports = Mailbox;
