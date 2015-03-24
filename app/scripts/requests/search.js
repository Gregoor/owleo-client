let qwest = require('qwest');

let {host} = require('../configs/api.custom');

export default (params) => {
	params = {'json': JSON.stringify(params)};
	return new Promise((resolve) => {
		qwest.get(`${host}/search`, params).then((data) => {
			resolve(JSON.parse(data));
		});
	});
};
