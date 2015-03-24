let Reflux = require('reflux');

let qwest = require('qwest');

let ConceptActions = require('../actions/concept-actions');
let host = require('../configs/api.custom').host;

let Concepts = Reflux.createStore({

  listenables: ConceptActions,

  onGetAll() {
    let store = this;
    qwest.get(`${host}/concepts`).then((data) => {
      store.setConcepts(JSON.parse(data));
    });
  },

  setConcepts(concepts) {
    this.trigger(this.concepts = concepts);
  }

});

export default Concepts;
