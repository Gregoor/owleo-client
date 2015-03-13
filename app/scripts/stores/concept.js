let Reflux = require('reflux');

let qwest = require('qwest');

let ConceptActions = require('../actions/concept-actions');
let host = require('../configs/api').host;

let Concept = Reflux.createStore({

  listenables: ConceptActions,

  onFind(id) {
    let store = this;
    qwest.get(`${host}/concepts/${id}`).then((data) => {
      store.setConcept(JSON.parse(data));
    });
  },

  setConcept(concept) {
    this.trigger(this.concept = concept);
  }

});

export default Concept;
