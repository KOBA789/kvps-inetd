var net = require('net');

var table = {};

process.on('message', function(message) {
  if (message.type === 'add') {
    table[message.args[0]] = createBridge(message.args[0],
                                          message.args[1],
                                          message.args[2]);
  } else if (message.type === 'remove') {
    if (table[message.args[0]]) {
      table[message.args[0]].close();
      delete table[message.args[0]];
    }
  }
});

function createBridge (src, host, port) {
  var server = net.createServer(function (socket) {
    var client = net.createConnection({
      port: port,
      host: host
    });
    
    client.on('error', function (err) {
      console.log(err.toString());
    });

    client.pipe(socket);
    socket.pipe(client);
  });

  server.on('error', function (err) {
    console.log(err.toString());
    setTimeout(function () {
      server.close();
      server.listen(src);
    }, 500);
  });

  server.listen(src);
  return server;
}