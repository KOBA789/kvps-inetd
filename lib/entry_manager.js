var events = require('events'),
    util = require('util'),
    errorDef = require('./error_def');

function EntryManager () {
  this.table = {};

  events.EventEmitter.call(this);
}

util.inherits(EntryManager, events.EventEmitter);

EntryManager.prototype.command = function (type, args) {
  this.emit('command', {
    type: type,
    args: args
  });
};

EntryManager.prototype.add = function (args) {
  var src = args[0],
      host = args[1],
      port = args[2];

  if (src in this.table) {
    throw(errorDef.DEFINED);
  }

  var newEntry = {
    src: src,
    host: host,
    port: port
  };
  this.table[src] = newEntry;
  this.command('add', args);
};

EntryManager.prototype.remove = function (args) {
  var src = args[0];
  if (!(src in this.table)) {
    throw(errorDef.UNDEFINED);
  }
  var entry = this.table[src];
  delete this.table[src];
  this.command('remove', args);
};

EntryManager.prototype.list = function (args) {
  return this.table;
  this.command('list', args);
};

module.exports = EntryManager;