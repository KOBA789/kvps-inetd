var CommandManager = require('./command_manager'),
    cmm = new CommandManager();

cmm.register('add', ['number', 'string']);
cmm.register('add', ['number', 'string', 'number']);
cmm.register('remove', ['number']);
cmm.register('list', []);

module.exports = cmm;