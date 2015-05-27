import React from 'react';

import searchAPI from '../../api/search-api';

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
		searchAPI({'type': ['Concept'], [relationType]: concept.id})
			.then(neighbors => this.setState({neighbors}));
	},

	render() {
		let {concept, relationType} = this.props;
		let {neighbors} = this.state;
		let neighborsHTML = neighbors ? neighbors.map(neighborConcept => {
			return (
				<div className="row">
					<div className="col-xs-12">
						<a href={`/#${neighborConcept.id}`}>{neighborConcept.name}</a>
					</div>
				</div>
			)
		}) : 'Loading...';

		return (
			<div className="neighbors">
				<div className="row">
					<div className="head">
						{relationType == 'reqBy' ? 'Followups for' : 'Requirements of'}
						{' '}
						<a href={`/#${concept.id}`}>{concept.name}</a>
					</div>
				</div>
				{neighborsHTML}
			</div>
		);
	}

});

export default ConceptNeighbors;
