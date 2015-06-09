import _ from 'lodash';

import {http, forResource} from './api-helpers';

let {endpoint, member} = forResource('concepts');

export default {

  all() {
    return http.get(endpoint);
  },

  find(id) {
    return http.get(member(id));
  },

  create(concept) {
    return http.post(endpoint, {concept});
  },

  update(id, concept) {
    return http.post(member(id), {concept});
  },

  delete(id) {
    return http.delete(member(id));
  },

  reposition(concepts) {
    return http.post(`${endpoint}/position`, {
      'concepts': concepts.map(c => _.pick(c, 'id', 'x', 'y', 'r'))
    });
  }

};
