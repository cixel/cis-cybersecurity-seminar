const Module = require('module');
const rewrite = require('./rewrite.js');

const compile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
	arguments[0] = rewrite(content, filename);
	const r = compile.apply(this, arguments);
	return r;
}

const hooked = new WeakSet();
const load = Module._load;
Module._load = function(filename) {
	const r = load.apply(this, arguments);

	if (filename === 'express' && !hooked.has(r)) {
		hooked.add(r);

		console.log(r);
	}

	return r;
}
