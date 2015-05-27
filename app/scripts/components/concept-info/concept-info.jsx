import React from 'react';
import Router from 'react-router';

import ConceptView from './_view';
import ConceptForm from './_form';
import ConceptNeighbors from './_neighbors';
import ConceptActions from '../../actions/concept-actions';

let ConceptInfo = React.createClass({

	getInitialState() {
		return {
			'edit': false,
			'isDirty': false
		};
	},

	componentWillMount() {
		window.addEventListener('keydown', this.onKeydown);
		Router.HashLocation.addChangeListener(() => {
			this.setState({'relationType': null})
		});
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
		let {edit, relationType, neighbors} = this.state;

		let comp;
		if (edit || this.props.concept.isNew) {
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
		this.isDirty = true;
	},

	onKeydown(e) {
		if (e.keyCode == 27/*ESC*/) {
			if (this.isDirty &&
				!confirm('Do you really want to discard your changes?')) return;
			ConceptActions.unselect();
		}
	},

	onSearch(param) {
		this.setState({'relationType': param});
	}

});

export default ConceptInfo;
