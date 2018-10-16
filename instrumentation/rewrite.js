const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const path = require('path');

function rewrite(content, filename) {
	// Step 1
	const before = esprima.parse(content, { loc: true });

	// Step 2
	const after = estraverse.replace(before, {
		enter(node) {
			switch(node.type) {
				case 'FunctionDeclaration':
					// fallthrough

				case 'FunctionExpression':
					// Note: a lot of these will be anonymous
					// It might be worth putting in the effort to look
					// at the parent node and grab name from from
					// (as in variable assignments)
					injectLog(node, filename);
					break;
			}

			return node;
		}
	});


	// Step 3
	const code = escodegen.generate(after);
	return code;
}

function injectLog(node, filename) {
	const name = node.id && node.id.name || 'anonymous';
	const start = node.loc.start;
	const rel = path.relative(process.cwd(), filename);
	const loc = `${name} (${rel}:${start.line}:${start.column})`;

	node.body.type === 'BlockStatement' && node.body.body.unshift({
		'type': 'ExpressionStatement',
		'expression': {
			'type': 'CallExpression',
			'callee': {
				'type': 'MemberExpression',
				'computed': false,
				'object': {
					'type': 'Identifier',
					'name': 'global'
				},
				'property': {
					'type': 'Identifier',
					'name': 'addCall'
				}
			},
			'arguments': [
				{
					type: 'Literal',
					value: loc
				}
			]
		}
	});
}

module.exports = rewrite;
