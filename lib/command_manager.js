function Command (name, argTypes, action) {
  this.name = name;
  this.argTypes = argTypes;
}

var typeHash = {
  'number': Number,
  'string': String,
  'boolean': Boolean,
  'object': Object
};

Command.prototype.parse = function (args) {
  if (!this.typeCheck(args)) {
    return undefined;
  }

  return {
    type: this.name,
    args: this.castArgs(args)
  };
};

Command.prototype.typeCheck = function (args) {
  if (this.argTypes.length !== args.length) {
    return false;
  }
  
  return args.every(function (val, i) {
    if (val === null) {
      console.log(val, 'null');
      return false;
    }
    var expectedType = this.argTypes[i];
    val = typeHash[expectedType](val);
    if (expectedType === 'number' && isNaN(val)) {
      return false;
    }
    return typeof val === expectedType;
  }.bind(this));
};

Command.prototype.castArgs = function (args) {
  return args.map(function (arg, i) {
    var expectedType = this.argTypes[i];
    return typeHash[expectedType](arg);
  }.bind(this));
};

function CommandManager () {
  this.commands = {};
}

CommandManager.prototype.register = function (name, argTypes) {
  if (!(name in this.commands)) {
    this.commands[name] = [];
  }
  this.commands[name].push(new Command(name, argTypes));
};

CommandManager.prototype.parse = function (str) {
  var argv = str.trim().split(' ').filter(function (str) {
    return str.length > 0;
  });

  if (argv.length <= 0) {
    return false;
  }

  var name = argv[0],
      args = argv.slice(1);
  if (!(name in this.commands)) {
    return undefined;
  }
  return this.commands[name].map(function (command) {
    return command.parse(args);
  }).filter(function (result) {
    return result !== undefined;
  })[0];
};

module.exports = CommandManager;