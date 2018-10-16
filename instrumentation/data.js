module.exports = {
	queries: [],
	calls: []
};

global.addCall = function(call) {
	module.exports.calls.push(call);
}
