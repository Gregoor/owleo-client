let Reflux = require('reflux');

let qwest = require('qwest');

let ConceptActions = require('../actions/concept-actions');
let host = require('../configs/api.custom').host;

let Concepts = Reflux.createStore({

  listenables: ConceptActions,

  getAll() {
    let store = this;
    qwest.get(`${host}/concepts`).then((data) => {
      store.setConcepts(JSON.parse(data));
    });
  },

	reposition(concepts) {
		qwest.post(`${host}/concepts/position`, {concepts}, {'dataType': 'json'});
	},

  setConcepts(concepts) {
    this.trigger(this.concepts = concepts);
  }

});

export default Concepts;
