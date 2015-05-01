import React from 'react';
import Reflux from 'reflux';

import ConceptActions from '../actions/concept-actions';
import conceptStore from '../stores/concept-store';

let NestedList = React.createClass({

	render() {
		let {concept} = this.props;

		let reqsHTML = [];
		for (let i = 0; i < concept.reqs.length; i++) {
			let id = concept.reqs[i];
			reqsHTML.push(<a href={`#${id}`}>{id.substr(0, 4)}</a>);
			if (i + 1 < concept.reqs.length) reqsHTML.push(', ');
		}

		let containeesHTML = concept.containees.map(c => (
			<NestedList concept={c}/>
		));

		return (
			<li className="concept">
				<div className="name">{concept.name}</div>
				<div className="req">{reqsHTML}</div>
				<div className="summary">{concept.summary}</div>
				<ul>{containeesHTML}</ul>
			</li>
		);
	}

});

let ListLayout = React.createClass({

	mixins: [Reflux.ListenerMixin],

	getInitialState() {
		return {'concepts': []};
	},

	componentWillMount() {
		this.listenTo(conceptStore, () => {
			this.setState({'concepts': conceptStore.getNested()});
		});
		ConceptActions.getAll();
	},

	render() {
		let rootConceptsHTML = this.state.concepts.map(c => (
			<NestedList concept={c}/>
		));

		return (
			<div className="nested-list">
				<div className="background">
					<ul className="page">{rootConceptsHTML}</ul>
				</div>
			</div>
		);
	}

});

export default ListLayout;
