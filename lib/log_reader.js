var fs = require('fs'),
    ws = fs.createWriteStream('./command.log', {flags: 'a'});

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
