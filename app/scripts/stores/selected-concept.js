let Reflux = require('reflux');

let qwest = require('qwest');

let ConceptActions = require('../actions/concept-actions');
let host = require('../configs/api').host;

let SelectedConcept = Reflux.createStore({

  listenables: ConceptActions,

  select(id) {
    let store = this;
    qwest.get(`${host}/concepts/${id}`).then((data) => {
      store.setConcept(JSON.parse(data));
    });
  },

	unselect() {
		this.setConcept(undefined);
	},

  setConcept(concept) {
    this.trigger(this.concept = concept);
  }

});

export default SelectedConcept;
