import request from 'superagent';
import _ from 'lodash';

import {host} from '../configs/api.custom';

let endpoint = `${host}/users`;

let promiseWrap = (req) => new Promise((resolve) => {
	req.end((err, res) => resolve(res.body));
});

export default {

	current() {
		return promiseWrap(request.get(`${endpoint}/current`));
	},

	login(user) {
		return promiseWrap(request.post(`${endpoint}/login`, {user}));
	},

	register(user) {
		return promiseWrap(request.post(`${endpoint}/login`, {user}));
	}

};
