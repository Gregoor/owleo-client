import Reflux from 'reflux';
import _ from 'lodash';

import userAPI from '../api/user-api';

let userStore = Reflux.createStore({

	init() {
		this.reset();
		userAPI.current().then(this.setUser);
	},

	reset() {
		this.setUser({'admin': false, 'loggedIn': false});
	},

	setUser(user) {
		let loggedIn = user ? user.loggedIn : undefined;
		if (loggedIn === undefined) loggedIn = Boolean(user);
		this.trigger(this.user = _.assign({}, user, {loggedIn}));
	},

	auth(user, exists) {
		(exists ? userAPI.login(user) : userAPI.register(user)).then(this.setUser);
	},

	logout() {
		userAPI.logout().then(this.reset);
	}

});

export default userStore;
