var cluster = require('cluster'),
    fs = require('fs'),
    events = require('events'),
    io = require('socket.io').listen(36389, {'log level': 1}),
    ws = fs.createWriteStream('./command.log', {flags: 'a'}),
    noop = function () {},
    table = {};

fs.exists('./command.log', function (exists) {
  if (!exists) {
    return;
  }
  fs.readFile('./command.log', 'utf-8', function (err, data) {
    var lines = data.split('\n').map(function (line) {
      return line.trim();
    }).filter(function (line) {
      return line.length > 0;
    }).map(function (line) {
      return line.split(' ');
    }).filter(function (args) {
      return (args.length === 2 && args[0] === 'remove') || (args.length === 4 && args[0] === 'add');
    }).forEach(function (args) {
      switch (args[0]) {
      case 'add':
        table[Number(args[1])] = {
          host: args[2],
          port: args[3]
        };
        break;
      case 'remove':
        delete table[Number(args[1])];
        break;
      }
    });

    for (var key in table) {
      sendToAll({
        type: 'add',
        src: key,
        host: table[key].host,
        port: table[key].port
      });
    }
  });
});

io.sockets.on('connection', function (socket) {
  socket.on('add', function (src, dstHost, dstPort, callback) {
    add(src, dstHost, dstPort, callback);
  });

  socket.on('remove', function (src, callback) {
    remove(src, callback);
  });

  socket.on('list', function (callback) {
    list(callback);
  });
});

for (var i = 0; i < 1; i++) {
  cluster.fork();
}

cluster.on('exit', function(worker, code, signal) {
  console.log('worker ' + worker.pid + ' died');
  var newWorker = cluster.fork();
  for (var key in table) {
    newWorker.send({
      type: 'add',
      src: key,
      host: table[key].host,
      port: table[key].port
    });
  }
});

function writeLog (str) {
  ws.write(str + '\n');
}

function sendToAll (message) {
  for (var id in cluster.workers) {
    cluster.workers[id].send(message);
  }
}

function invalid (callback) {
  callback(new Error('invalid command').toString());
}

function isNull (val) {
  return val === null;
}

function isNumber (val) {
  return !isNaN(val) && typeof val === 'number';
}

function not (func) {
  return function () {
    return !func.apply(this, arguments);
  };
}

function add (src, dstHost, dstPort, callback) {
  callback = (typeof callback === 'function') ? callback : noop;
  if ([src, dstHost, dstPort].some(isNull)) {
    invalid(callback);
    return;
  };

  src = Number(src);
  dstPort = Number(dstPort);

  if ([src, dstPort].some(not(isNumber))) {
    invalid(callback);
    return;
  }

  if (typeof dstHost !== 'string') {
    invalid();
    return;
  }

  if (table[src]) {
    callback(new Error('the entry already exists').toString());
  } else {
    writeLog(['add', src, dstHost, dstPort].join(' '));
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
  callback = (typeof callback === 'function') ? callback : noop;

  if (isNull(src)) {
    invalid();
    return;
  }

  src = Number(src);

  if (not(isNumber)(src)) {
    invalid(callback);
    return;      
  }

  if (table[src]) {
    writeLog(['remove', src].join(' '));
    delete table[src];
    sendToAll({
      type: 'remove',
      src: src
    });
    callback(null);
  } else {
    callback(new Error('the entry does\'nt exist').toString());
  }
}

function list (callback) {
  var lines = [];
  for (var key in table) {
    lines.push([key, table[key].host, table[key].port]);
  }
  callback(null, lines);
}