import React from 'react';
import Router from 'react-router';
import Reflux from 'reflux';
import _ from 'lodash';
import {FlatButton} from 'material-ui';

import ConceptActions from '../../actions/concept-actions';
import ConceptView from './_view';
import ConceptForm from './_form';
import ConceptNeighbors from './_neighbors';
import ExplanationCard from './explanation-card';
import ExplainFormCard from './explain-form-card';

let ConceptInfo = React.createClass({

  getInitialState() {
    return {
      'edit': false,
      'isDirty': false
    };
  },

  componentWillMount() {
    window.addEventListener('keydown', this.onKeydown);
    Router.HashLocation.addChangeListener(this.resetState);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
    Router.HashLocation.removeChangeListener(this.resetState);
  },

  resetState() {
    this.setState({'relationType': null})
  },

  componentWillReceiveProps(props) {
    let oldConcept = this.props.concept;
    if (oldConcept && oldConcept.id != props.concept.id) {
      this.setState(this.getInitialState());
    }
  },

  render() {
    let {edit, relationType, expanded} = this.state;
    let {concept, user} = this.props;

    let comp;
    if (edit || concept.isNew) {
      comp = (
        <ConceptForm key="f" onDone={this.onShow} onChange={this.onChange}
          {...this.props}/>
      );
    } else if (relationType) {
      comp = (
        <ConceptNeighbors key="n" relationType={relationType} {...this.props} />
      )
    } else {
      comp = (
        <ConceptView key="v" onEdit={this.onEdit} onSearch={this.onSearch}
          {...this.props}/>
      );
    }

    let explanationsHTML = [];
    let expandLabel;
    let explanations = _(concept.explanations || [])
      .sortBy(explanation => -explanation.votes);
    let buildExplanationCard = explanation => (
      <ExplanationCard explanation={explanation} voteDisabled={!user.loggedIn}/>
    );

    if (expanded) {
      expandLabel = 'Collapse';
      explanationsHTML = explanations.map(buildExplanationCard).value();
      if (user && user.loggedIn) {
        explanationsHTML.unshift(<ExplainFormCard/>)
      }
    } else {
      expandLabel = 'Create your own explanation';
      let bestExplanation = explanations.first();
      if (bestExplanation) {
        explanationsHTML = buildExplanationCard(bestExplanation);
        let restCount = concept.explanations.length - 1;
        if (restCount > 0) expandLabel = `View ${restCount} more Explanations`
      }
    }

    return (
      <div className={expanded ? 'split-screen' : ''}>
        <div className={`concept-info ${!expanded ? 'card' :''}`}
             style={{'border': `8px solid ${concept.color}`}}>
          {comp}
        </div>
        <div className="scrollable">
          {explanationsHTML}
          <div className="card" style={{'padding': 0}}>
            <FlatButton label={expandLabel} style={{'width': '100%'}}
                        onClick={() => this.setState({'expanded': !expanded})}/>
          </div>
        </div>
      </div>
    );
  },

  onEdit() {
    this.setState({'edit': true});
  },

  onShow() {
    this.setState({
      'edit': false,
      'isDirty': false
    });
  },

  onChange() {
    this.state.isDirty = true;
  },

  onKeydown(e) {
    if (e.keyCode == 27/*ESC*/) {
      if (this.state.isDirty && !confirm('Do you really want to discard your changes?')) return;
      ConceptActions.unselect();
    }
  },

  onSearch(param) {
    this.setState({'relationType': param});
  }


});

export default ConceptInfo;
