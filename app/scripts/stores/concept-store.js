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

  select(id) {
	  if (this.selected && id == this.selected.id) return;
    conceptAPI.find(id).then(this.setSelected);
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
		conceptAPI.create(data).then((serverData) => {
			ConceptActions.created(serverData);
			this.setSelected(serverData);
		});
	},

	update(data) {
		conceptAPI.update(this.selected.id, data).then((serverData) => {
			ConceptActions.updated(serverData);
			this.setSelected(serverData);
		});
	},

	delete(id) {
		conceptAPI.delete(id).then(() => {
			ConceptActions.deleted(id);
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
	},

	getNested() {
		if (!this.nested) {
			let containers = this.containers = new Map();
			for (let [id, concept] of this.all) {
				let {container} = concept;
				if (!containers.has(container)) containers.set(container, [concept]);
				else containers.get(container).push(concept);
			}
			this.nested = this.withContainees(null);
		}
		return this.nested;
	},

	withContainees(id) {
		let containees = this.containers.get(id);
		return containees === undefined ? [] : containees.map(c => {
			c.containees = this.withContainees(c.id);
			return c;
		})
	}

});

export default conceptStore;
