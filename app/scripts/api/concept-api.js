let request = require('superagent');

let host = require('../configs/api.custom').host;

let endpoint = `${host}/concepts`;
let ressource = (name) => `${endpoint}/${name}`;

let promiseWrap = (req) => new Promise((resolve) => {
	req.end((err, res) => resolve(res.body));
});

export default {

	all() {
		return promiseWrap(request.get(endpoint));
	},

	find(name) {
		return promiseWrap(request.get(ressource(name)));
	},

	create(concept) {
		return promiseWrap(request.post(endpoint, {concept}));
	},

	update(name, concept) {
		return promiseWrap(request.post(ressource(name), {concept}));
	},

	delete(name) {
		return promiseWrap(request.del(ressource(name)));
	},

	reposition(concepts) {
		return promiseWrap(request.post(`${endpoint}/position`, {concepts}));
	}

};
