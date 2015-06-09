import request from 'superagent';

import {host} from '../configs/api.custom';

let promiseWrap = (req) => new Promise((resolve) => {
  req.end((err, res) => resolve(res.body));
});

let wrapRequest = (req) => promiseWrap(req.withCredentials());

export default {
  http: {
    get(...args) {
      return wrapRequest(request.get(...args));
    },
    post(...args) {
      return wrapRequest(request.post(...args));
    },
    delete(...args) {
      return wrapRequest(request.del(...args));
    }
  },

  forResource: (resource, endpoint = `${host}/${resource}`) => {
    return {endpoint, member: (id) => `${endpoint}/${id}`};
  }
};
