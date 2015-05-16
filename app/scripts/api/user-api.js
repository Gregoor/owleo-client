import request from 'superagent';
import _ from 'lodash';

import {host} from '../configs/api.custom';

let endpoint = `${host}/users`;

let promiseWrap = req => new Promise(resolve => {
	req.end((err, res) => resolve(res.body));
});

export default {

	exists(name) {
		return promiseWrap(request.get(`${endpoint}/exists`, {name}));
	},

	current() {
		return promiseWrap(request.get(`${endpoint}/current`).withCredentials());
	},

	login(user) {
		return promiseWrap(
			request.post(`${endpoint}/login`, {user}).withCredentials()
		);
	},

	logout() {
		return promiseWrap(request.post(`${endpoint}/logout`).withCredentials());
	},

	register(user) {
		return promiseWrap(
			request.post(`${endpoint}/register`, {user}).withCredentials()
		);
	}

};
