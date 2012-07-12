var io = require('socket.io').listen(36389, {'log level': 1}),
    WorkerManager = require('./worker_manager'),
    EntryManager = require('./entry_manager'),
    commandDef = require('./command_def'),
    errorDef = require('./error_def'),
    wm = new WorkerManager(2),
    em = new EntryManager(),
    noop = function () {};

wm.on('table', function (callback) {
  callback(em.list());
});

em.on('command', function (command) {
  wm.broadcast(command);
});

io.sockets.on('connection', function (socket) {
  socket.on('input', function (input, callback) {
    try {
      var command = commandDef.parse(input);
      if (command === undefined) {
        throw errorDef.INVALID;
      }
      var args = command.args,
          result;
      if (!(command.type in em)) {
        throw errorDef.INVALID;
      }
      result = em[command.type](args);
      callback(null, result);
    } catch (err) {
      callback(err.toString());
    }
  });
});