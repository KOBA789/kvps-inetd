var cluster = require('cluster'),
    events = require('events'),
    util = require('util');

function WorkerManager (workerCount) {
  if (WorkerManager._instance) {
    return WorkerManager._instance;
  }
  events.EventEmitter.call(this);
  WorkerManager._instance = this;
  
  process.nextTick(function () {
    for (var i = 0; i < workerCount; ++i) {
      this.fork();
    }
    
    cluster.on('exit', function (worker, code, signal) {
      this.emit('exit', worker, code, signal);
      this.fork();
    }.bind(this));
  }.bind(this));
  
  return this;
}

util.inherits(WorkerManager, events.EventEmitter);

WorkerManager.prototype.tableToCommands = function (table) {
  var keys = Object.keys(table);
  return keys.map(function (src) {
    return {
      src: src,
      host: table[src],
      port: table[src]
    };
  });
};

WorkerManager.prototype.fork = function () {
  var self = this;
  this.emit('table', function (table) {
    var worker = cluster.fork();
    this.tableToCommands(table).forEach(function (command) {
      worker.send(command);
    });
    this.emit('fork');
  }.bind(this));
};

WorkerManager.prototype.broadcast = function (message) {
  Object.keys(cluster.workers).forEach(function (id) {
    cluster.workers[id].send(message);
  });
};

module.exports = WorkerManager;