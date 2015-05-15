import Reflux from 'reflux';
import _ from 'lodash';

import userAPI from '../api/user-api';

let userStore = Reflux.createStore({

	init() {
		this.setUser({'admin': false, 'loggedIn': false});
		userAPI.current().then(user => {
			this.setUser(_.assign({}, user, {'loggedIn': Boolean(user)}))
		});
	},

	setUser(user) {
		this.trigger(this.user = user);
	}

});

export default userStore;
