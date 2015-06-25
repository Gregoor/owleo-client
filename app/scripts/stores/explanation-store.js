import Reflux from 'reflux';
import _ from 'lodash';

import ExplanationActions from '../actions/explanation-actions';
import ExplanationAPI from '../api/explanation-api';

let explanationStore = Reflux.createStore({

  listenables: ExplanationActions,

  setExplanations(explanations, conceptId) {
    this.explanations = explanations;
    this.conceptId = conceptId;
  },

  triggerAll() {
    this.trigger(this.explanations);
  },

  create(data) {
    ExplanationAPI.create(this.conceptId, data).then(explanation => {
      this.explanations.push(explanation);
      this.triggerAll();
    })
  },

  vote(id) {
    let explanation = _.find(this.explanations, {id});
    if (explanation) {
      explanation.votes++;
      explanation.hasVoted = true;
    }
    ExplanationAPI.vote(this.conceptId, id)
      .then(this.handleVoteResponse(id, true));
  },

  unvote(id) {
    let explanation = _.find(this.explanations, {id});
    if (explanation) {
      explanation.votes--;
      explanation.hasVoted = false;
    }
    ExplanationAPI.unvote(this.conceptId, id)
      .then(this.handleVoteResponse(id, false));
  },

  handleVoteResponse(id, hasVoted) {
    return (resp) => {
      let {explanations} = this;
      if (explanations) {
        let explanation = _.find(explanations, {id});
        if (explanation) {
          _.assign(explanation, {'votes': resp.votes, hasVoted});
          this.triggerAll();
        }
      }
    }
  }


});

export default explanationStore;
