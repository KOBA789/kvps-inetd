var io = require('socket.io-client'),
    socket = io.connect('http://' + process.argv[2] + ':' + process.argv[3]);

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('> ');
rl.prompt();

rl.on('line', function (line) {
  var args = line.trim().split(' ').filter(function (str) {
    return str.length > 0;
  });
  if (args.length < 0) {
    invalid();
    return;
  }
  switch (args[0]) {
  case 'add':
    if (args.length !== 3 && args.length !== 4) {
      invalid();
      return;
    }
    
    if (args.length === 3) {
      args.push(args[1]);
    }

    socket.emit('add', args[1], args[2], args[3], callback);
    break;
  case 'remove':
    if (args.length !== 2) {
      invalid();
      return;
    }

    socket.emit('remove', args[1], callback);
  }

  function invalid () {
    console.log('Error: invalid command');
    rl.prompt();
  }

  function callback (err) {
    if (err) {
      console.log(err.toString());
    } else {
      console.log('success');
    }
    rl.prompt();
  }
});

rl.on('SIGINT', function() {
  process.exit();
});