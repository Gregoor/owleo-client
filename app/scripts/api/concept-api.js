import request from 'superagent';
import _ from 'lodash';

let host = require('../configs/api.custom').host;

let endpoint = `${host}/concepts`;
let resource = (id) => `${endpoint}/${id}`;

let promiseWrap = (req) => new Promise((resolve) => {
	req.end((err, res) => resolve(res.body));
});

export default {

	all() {
		return promiseWrap(request.get(endpoint));
	},

	find(id) {
		return promiseWrap(request.get(resource(id)));
	},

	create(concept) {
		return promiseWrap(
			request.post(endpoint, {concept}).withCredentials()
		);
	},

	update(id, concept) {
		return promiseWrap(
			request.post(resource(id), {concept}).withCredentials()
		);
	},

	delete(id) {
		return promiseWrap(
			request.del(resource(id)).withCredentials()
		);
	},

	reposition(concepts) {
		return promiseWrap(request.post(`${endpoint}/position`, {
			'concepts': concepts.map(c => _.pick(c, 'id', 'x', 'y', 'r'))
		}).withCredentials());
	}

};
