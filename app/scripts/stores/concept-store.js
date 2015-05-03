let Reflux = require('reflux');

let _ = require('lodash');

let ConceptActions = require('../actions/concept-actions');
let ConceptAPI = require('../api/concept-api');

let conceptStore = Reflux.createStore({

  listenables: ConceptActions,

	getAll() {
		ConceptAPI.all().then(this.setAll);
	},

	reposition() {
		ConceptAPI.reposition(Array.from(this.all.values())).then(this.setAll);
	},

  select(id) {
	  if (this.selected && id == this.selected.id) return;
    ConceptAPI.find(id).then(this.setSelected);
  },

	unselect() {
		this.setSelected();
	},

	new() {
		this.setSelected({'isNew': true});
	},

	save(data) {
		data = _.pick(data, 'name', 'summary','color','summarySource', 'reqs','container', 'tags', 'links');

		(this.selected.isNew ? this.create : this.update)(data);
	},

	create(data) {
		ConceptAPI.create(data).then((serverData) => {
			ConceptActions.created(serverData);
			this.setSelected(serverData);
		});
	},

	update(data) {
		ConceptAPI.update(this.selected.id, data).then((serverData) => {
			ConceptActions.updated(serverData);
			this.setSelected(serverData);
		});
	},

	delete(id) {
		ConceptAPI.delete(id).then(() => {
			ConceptActions.deleted(id);
			this.setSelected();
		});
	},

	setAll(concepts) {
		this.all = new Map(concepts);
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
