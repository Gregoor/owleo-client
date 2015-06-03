import React from 'react';
import Router from 'react-router';
import _ from 'lodash';
import {IconButton} from 'material-ui';

import ConceptActions from '../../actions/concept-actions';
import ConceptView from './_view';
import ConceptForm from './_form';
import ConceptNeighbors from './_neighbors';
import LinkRow from './link-row';

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
			this.setState({'edit': false});
		}
	},

	render() {
		let {edit, relationType} = this.state;

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

		let linksHTML = [];
		_.sortBy(this.props.concept.links || [], link => -link.votes)
			.forEach(link => {
				linksHTML.push(<LinkRow link={link}/>, <hr/>);
			});

		return (
			<div>
				<div className="concept-info card"
						 style={{'border': `8px solid ${this.props.concept.color}`}}>
					{comp}
				</div>
				<div className="card">
					{linksHTML}
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
