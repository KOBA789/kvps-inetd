var cluster = require('cluster');

if (cluster.isMaster) {
  var io = require('socket.io').listen(36389),
      events = require('events');

  io.sockets.on('connection', function (socket) {
    socket.on('add', function (src, dstHost, dstPort, callback) {
      add(src, dstHost, dstPort, callback);
    });

    socket.on('remove', function (src, callback) {
      remove(src, callback);
    });
  });

  for (var i = 0; i < 1; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.pid + ' died');
    cluster.fork();
  });

  var table = {};

  function sendToAll (message) {
    for (var id in cluster.workers) {
      cluster.workers[id].send(message);
    }
  }
  
  function add (src, dstHost, dstPort, callback) {
    dstPort = dstPort || src;
    if (table[src]) {
      if (typeof callback === 'function') {
        callback(new Error('the entry already exists'));
      }
    } else {
      table[src] = {
        port: dstPort,
        host: dstHost
      };
      sendToAll({
        type: 'add',
        src: src,
        host: dstHost,
        port: dstPort
      });
      callback(null);
    }
  }

  function remove (src, callback) {
    if (table[src]) {
      delete table[src];
      sendToAll({
        type: 'remove',
        src: src
      });
      callback(null);
    } else {
      if (typeof callback === 'function') {
        callback(new Error('the entry does\'nt exist'));
      }
    }
  }
} else {
  require('./worker');
}