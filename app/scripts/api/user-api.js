import _ from 'lodash';

import {http, forResource} from './api-helpers';

let {endpoint} = forResource('users');

export default {

  exists(name) {
    return http.get(`${endpoint}/exists`, {name});
  },

  current() {
    return http.get(`${endpoint}/current`);
  },

  login(user) {
    return http.post(`${endpoint}/login`, {user});
  },

  logout() {
    return http.post(`${endpoint}/logout`);
  },

  register(user) {
    return http.post(`${endpoint}/register`, {user});
  }

};
