let React = require('react');

let ConceptView = require('./_view');
let ConceptForm = require('./_form');
let ConceptActions = require('../../actions/concept-actions');

let ConceptInfo = React.createClass({

	getInitialState() {
		return {
			'edit': false,
			'isDirty': false
		};
	},

	componentWillMount() {
		window.addEventListener('keydown', this.onKeydown);
	},

	componentWillUnmount() {
		window.removeEventListener('keydown', this.onKeydown);
	},

	componentWillReceiveProps(props) {
		let oldConcept = this.props.concept;
		if (oldConcept && oldConcept.id != props.concept.id) {
			this.setState({'edit': false});
		}
	},

	render() {
		let comp;

		if (this.state.edit || this.props.concept.isNew) {
			comp = (<ConceptForm onDone={this.onShow} onChange={this.onChange} {...this.props}/>);
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
		this.setState({
			'edit': false,
			'isDirty': false
		});
	},

	onChange() {
		this.setState({'isDirty': true});
	},

	onKeydown(e) {
		if (e.keyCode == 27/*ESC*/) {
			// abort and esc have duplicate confirm msgs,
			// but are different scenarios imo.
			if (this.state.isDirty &&
				!confirm('Do you really want to discard your changes?')) return;
			ConceptActions.unselect();
		}
	}

});

export default ConceptInfo;
