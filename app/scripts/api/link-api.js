import _ from 'lodash';

import {http, forResource} from './api-helpers';

let forConcept = (id) => forResource(`concepts/${id}/links`);

let votesPathFor = (conceptId, id) => {
  return `${forConcept(conceptId).endpoint}/${id}/votes`;
};

export default {

  create(conceptId, link) {
    return http.post(forConcept(conceptId).endpoint, {link});
  },

  vote(conceptId, id) {
    return http.post(votesPathFor(conceptId, id));
  },

  unvote(conceptId, id) {
    return http.delete(votesPathFor(conceptId, id));
  }

};
