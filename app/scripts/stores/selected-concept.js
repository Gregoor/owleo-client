let Reflux = require('reflux');

let _ = require('lodash');
let qwest = require('qwest');

let ConceptActions = require('../actions/concept-actions');

let {host} = require('../configs/api');
let endpoint = `${host}/concepts`;
let ressource = (id) => `${endpoint}/${id}`;

let SelectedConcept = Reflux.createStore({

  listenables: ConceptActions,

  select(id) {
    qwest.get(ressource(id)).then(this.handleResponse);
  },

	unselect() {
		this.setConcept();
	},

	new() {
		this.setConcept({});
	},

	save(data) {
		let isNew = !this.concept.id;
		let route = isNew ? endpoint : ressource(this.concept.id);
		qwest.post(route , {'concept': data}, {'dataType': 'json'}).then((data) => {
			this.handleResponse(data);
			if (isNew) ConceptActions.created(this.concept);
			else ConceptActions.updated(this.concept);
		});
	},

	delete(id) {
		qwest.delete(ressource(id)).then(() => {
			this.handleResponse(null);
			ConceptActions.deleted(id);
		});
	},

	handleResponse(data) {
		this.setConcept(JSON.parse(data));
	},

  setConcept(concept) {
	  this.concept = (!concept || !this.concept || this.concept.id != concept.id ?
		  concept : _.merge({}, this.concept, concept));
    this.trigger(this.concept);
	  ConceptActions.selected(this.concept ? this.concept.id : undefined);
  }

});

export default SelectedConcept;
