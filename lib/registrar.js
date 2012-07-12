var io = require('socket.io-client'),
    socket = io.connect('http://' + (process.argv[2] || 'localhost') + ':' + (process.argv[3] || 36389));

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

socket.on('connect', function () {
  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', function (line) {
    socket.emit('input', line, function (err, data) {
      if (err) {
        console.log(err);
      }
      if (data) {
        console.log(data);
      }
      rl.prompt();
    });
  });
});

rl.on('SIGINT', function() {
  process.exit();
});