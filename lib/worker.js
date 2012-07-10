var net = require('net');

var table = {};

process.on('message', function(message) {
  if (message.type === 'add') {
    table[message.src] = createBridge(message.src,
                                      message.host,
                                      message.port);
  } else if (message.type === 'remove') {
    if (table[message.src]) {
      table[message.src].close();
      delete table[message.src];
    }
  }
});

function createBridge (src, host, port) {
  var server = net.createServer(function (socket) {
    var client = net.createConnection({
      port: port,
      host: host
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