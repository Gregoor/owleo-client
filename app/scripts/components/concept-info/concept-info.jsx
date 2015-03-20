let React = require('react');

let ConceptView = require('./_view');
let ConceptForm = require('./_form');

let ConceptInfo = React.createClass({

	getInitialState() {
		return {'edit': false};
	},

	componentWillReceiveProps(props) {
		let oldConcept = this.props.concept;
		if (oldConcept && oldConcept.id != props.concept.id) {
			this.setState({'edit': false});
		}
	},

	render() {
		let comp;

		if (this.state.edit || !this.props.concept.id) {
			comp = (<ConceptForm onDone={this.onShow} {...this.props}/>);
		} else {
			comp = (<ConceptView onEdit={this.onEdit} {...this.props}/>);
		}

		return (
			<div className="concept-info">{comp}</div>
		);
	},

	onEdit() {
		this.setState({'edit': true});
	},

	onShow() {
		this.setState({'edit': false});
	}

});

export default ConceptInfo;
