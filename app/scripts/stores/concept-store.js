let Reflux = require('reflux');

let _ = require('lodash');

let ConceptActions = require('../actions/concept-actions');
let conceptAPI = require('../api/concept-api');

let conceptStore = Reflux.createStore({

  listenables: ConceptActions,

	getAll() {
		conceptAPI.all().then(this.setAll);
	},

	reposition(concepts) {
		conceptAPI.reposition(concepts).then(this.setAll);
	},

  select(name) {
	  if (this.selected && name == this.selected.name) return;
    conceptAPI.find(name).then(this.setSelected);
  },

	unselect() {
		this.setSelected();
	},

	new() {
		this.setSelected({'isNew': true});
	},

	save(data) {
		data = _.pick(data, 'name', 'summary', 'reqs', 'tags', 'links');

		(this.selected.isNew ? this.create : this.update)(data);
	},

	create(data) {
		conceptAPI.create(data).then((serverData) => {
			ConceptActions.created(serverData);
			this.setSelected(serverData);
		});
	},

	update(data) {
		let oldName = this.selected.name;
		conceptAPI.update(oldName, data).then((serverData) => {
			ConceptActions.updated(serverData);
			this.setSelected(serverData);
		});
	},

	delete(name) {
		conceptAPI.delete(name).then(() => {
			ConceptActions.deleted(name);
			this.setSelected();
		});
	},

	setAll(concepts) {
		this.all = concepts;
		this.triggerAll();
	},

  setSelected(concept) {
	  this.selected = concept;
	  this.triggerAll();
  },

	triggerAll() {
		this.trigger({'all': this.all, 'selected': this.selected});
	}

});

export default conceptStore;
