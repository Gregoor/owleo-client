import Reflux from 'reflux';
import _ from 'lodash';

import ConceptActions from '../actions/concept-actions';
import ConceptAPI from '../api/concept-api';
import explanationStore from './explanation-store';

let conceptStore = Reflux.createStore({

  listenables: ConceptActions,

  init() {
    this.listenTo(explanationStore, explanations => {
      this.selected.explanations = explanations;
      this.triggerAll();
    })
  },

  setAll(concepts) {
    for (let [, concept] of concepts) {
      concept.x = Math.floor(concept.x);
      concept.y = Math.floor(concept.y);
    }
    this.all = new Map(concepts);
    this.triggerAll();
  },

  setSelected(concept) {
    this.selected = concept;
    if (concept) {
      explanationStore.setExplanations(concept.explanations, concept.id);
    }
    this.triggerAll();
  },

  triggerAll() {
    this.trigger({'all': this.all, 'selected': this.selected});
  },

  getAll() {
    ConceptAPI.all().then(this.setAll);
  },

  getAllNested() {
    ConceptAPI.allNested().then(concepts => {
      this.all = concepts;
      this.triggerAll();
    });
  },

  reposition() {
    ConceptAPI.reposition(Array.from(this.all.values())).then(this.setAll);
  },

  select(id) {
    if (this.selected && id == this.selected.id) return;
    if (this.all && this.all instanceof Map && this.all.has(id)) {
      this.setSelected(_.assign({'fetching': true}, this.all.get(id)));
    }
    ConceptAPI.find(id).then(this.setSelected);
  },

  unselect() {
    this.setSelected();
  },

  new() {
    this.setSelected({'isNew': true});
  },

  save(data) {
    data = _.pick(data, 'name', 'summary', 'color', 'summarySource', 'reqs',
      'container', 'tags', 'explanations');

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
  }

});

export default conceptStore;
