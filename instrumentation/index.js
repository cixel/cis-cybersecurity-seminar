const Module = require('module');
const rewrite = require('./rewrite.js');
const data = require('./data.js');

const compile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
	arguments[0] = rewrite(content, filename);
	const r = compile.apply(this, arguments);
	return r;
}

const hooked = new WeakSet();
const load = Module._load;
Module._load = function(filename) {
	let r = load.apply(this, arguments);

	if (filename === 'express' && !hooked.has(r)) {
		hooked.add(r);

		r = new Proxy(r, {
			apply(target, thisArg, args) {
				const app = target.apply(thisArg, args);

				app.use(function(req, res, next) {
					req.query = new Proxy(req.query, {
						get(target, prop, recv) {
							const v = Reflect.get(...arguments);
							data.queries.push({
								key: prop,
								val: v
							});
							console.log(`getting querystring value ${prop}: ${v}`);
							return v;
						}
					});
					next();
				});

				app.get('/instrumentation/calls', function(req, res) {
					res.send(data.calls);
				});

				app.get('/instrumentation/queries', function(req, res) {
					res.send(data.queries);
				});

				return app;
			}
		});
	}

	return r;
};
