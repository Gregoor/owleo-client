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
		let route = this.concept.id ? ressource(this.concept.id) : endpoint;
		qwest.post(route, {'concept': data}, {'dataType': 'json'})
			.then(this.handleResponse);
	},

	handleResponse(data) {
		this.setConcept(JSON.parse(data));
	},

	unselect() {
		this.setConcept();
	},

  setConcept(concept) {
	  this.concept = (!concept ? undefined : _.merge({}, this.concept, concept));
    this.trigger(this.concept);
  }

});

export default SelectedConcept;
