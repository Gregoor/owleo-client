let Reflux = require('reflux');

let _ = require('lodash');
let qwest = require('qwest');

let ConceptActions = require('../actions/concept-actions');

let {host} = require('../configs/api.custom');
let endpoint = `${host}/concepts`;
let ressource = (name) => `${endpoint}/${name}`;

let SelectedConcept = Reflux.createStore({

  listenables: ConceptActions,

  select(name) {
    qwest.get(ressource(name)).then(this.handleResponse);
  },

	unselect() {
		this.setConcept();
	},

	new() {
		this.setConcept({'isNew': true});
	},

	save(data) {
		let route = this.concept.isNew ? endpoint : ressource(this.concept.name);
		let concept = _.pick(data, 'name', 'summary', 'reqs', 'tags', 'links');
		let wasNew = this.concept.isNew;
		qwest.post(route , {concept}, {'dataType': 'json'}).then((serverData) => {
			this.handleResponse(serverData);
			if (wasNew) ConceptActions.created(this.concept);
			else ConceptActions.updated(this.concept);
		});
	},

	delete(name) {
		qwest.delete(ressource(name)).then(() => {
			this.handleResponse(null);
			ConceptActions.deleted(name);
		});
	},

	handleResponse(data) {
		this.setConcept(JSON.parse(data));
	},

  setConcept(concept) {
	  this.concept = concept;
	  this.trigger(this.concept);
	  ConceptActions.selected(this.concept ? this.concept.name : undefined);
  }

});

export default SelectedConcept;
