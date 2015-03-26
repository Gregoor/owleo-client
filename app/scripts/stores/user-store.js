let Reflux = require('reflux');

let userStore = Reflux.createStore({

	init() {
		this.trigger(this.user = {'editMode': true});
	}

});

export default userStore;
