let React = require('react');

let ConceptView = require('./_view');
let ConceptForm = require('./_form');

let ConceptInfo = React.createClass({

	getInitialState() {
		return {'edit': false};
	},

	render() {
		let comp;

		if (this.state.edit) {
			comp = (<ConceptForm {...this.props}/>);
		} else {
			comp = (<ConceptView onEdit={this.onEdit} {...this.props}/>);
		}

		return (
			<div className="concept-info">{comp}</div>
		);
	},

	onEdit() {
		this.setState({'edit': true});
	}

});

export default ConceptInfo;
