let request = require('superagent');

let host = require('../configs/api.custom').host;

let endpoint = `${host}/concepts`;
let resource = (name) => `${endpoint}/${encodeURIComponent(name)}`;

let promiseWrap = (req) => new Promise((resolve) => {
	req.end((err, res) => resolve(res.body));
});

export default {

	all() {
		return promiseWrap(request.get(endpoint));
	},

	find(name) {
		return promiseWrap(request.get(resource(name)));
	},

	create(concept) {
		return promiseWrap(request.post(endpoint, {concept}));
	},

	update(name, concept) {
		return promiseWrap(request.post(resource(name), {concept}));
	},

	delete(name) {
		return promiseWrap(request.del(resource(name)));
	},

	reposition(concepts) {
		return promiseWrap(request.post(`${endpoint}/position`, {concepts}));
	}

};
