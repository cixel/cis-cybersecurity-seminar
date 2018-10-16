const Module = require('module');

const compile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
	console.log(filename);
	const r = compile.apply(this, arguments);
	return r;
}
