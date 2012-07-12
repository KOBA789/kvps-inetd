module.exports = {
  INVALID: new Error('invalid command or arguments'),
  DEFINED: new Error('the entry having the same source port was already defined'),
  UNDEFINED: new Error('an entry having that source port is not defined')
};