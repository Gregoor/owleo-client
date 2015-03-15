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

	new() {
		this.setConcept({});
	},

	save(data) {
		let isNew = !this.concept.id;
		let route = isNew ? endpoint : ressource(this.concept.id);
		qwest.post(route, {'concept': data}, {'dataType': 'json'}).then((data) => {
			this.handleResponse(data);
			if (isNew) ConceptActions.create(this.concept);
			else ConceptActions.update(this.concept);
		});
	},

	handleResponse(data) {
		this.setConcept(JSON.parse(data));
	},

	unselect() {
		this.setConcept();
	},

  setConcept(concept) {
	  this.concept = (!concept || !this.concept || this.concept.id != concept.id ?
		  concept : _.merge({}, this.concept, concept));
    this.trigger(this.concept);
  }

});

export default SelectedConcept;
