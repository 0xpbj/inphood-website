var Parser = require('./parser');

var Lib = new Parser();
Lib.Parser = Parser;
Lib.Defaults = require('./defaults');

module.exports = Lib;