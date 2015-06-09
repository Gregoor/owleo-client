let request = require('superagent');

let {host} = require('../configs/api.custom');

export default params => {
  params = {'json': JSON.stringify(params)};
  return new Promise(resolve => {
    request.get(`${host}/search`, params).end((err, res) => resolve(res.body));
  });
};
