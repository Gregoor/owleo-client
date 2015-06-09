import React from 'react';

import searchAPI from '../../api/search-api';

let asLink = concept => <a href={`/#${concept.id}`}>{concept.name}</a>;

let withContainer = concept => {
  let {container} = concept;
  if (container) return (<span>in {asLink(container)}</span>);
};

let ConceptNeighbors = React.createClass({

  propTypes: {
    concept: React.PropTypes.object.isRequired,
    relationType: React.PropTypes.string
  },

  getInitialState() {
    return {};
  },

  componentWillMount() {
    this.fetchNeighbors();
  },

  fetchNeighbors() {
    let {concept, relationType} = this.props;
    searchAPI({'for': ['Concept'], [relationType]: concept.id})
      .then(neighbors => this.setState({neighbors}));
  },

  render() {
    let {concept, relationType} = this.props;
    let {neighbors} = this.state;
    let neighborsHTML = neighbors ? neighbors.map(neighborConcept => {
      return (
        <div className="row">
          <div className="col-xs-6">
            {asLink(neighborConcept)}
          </div>
          <div className="col-xs-6">
            {withContainer(neighborConcept)}
          </div>
        </div>
      )
    }) : 'Loading...';

    return (
      <div className="neighbors">
        <div className="row">
          <div className="head">
            {relationType == 'reqBy' ? 'Followups for' : 'Requirements of'}
            {' '} {asLink(concept)} {' '}
            {withContainer(concept)}
          </div>
        </div>
        {neighborsHTML}
      </div>
    );
  }

});

export default ConceptNeighbors;
