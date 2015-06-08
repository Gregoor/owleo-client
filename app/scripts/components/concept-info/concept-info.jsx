import React from 'react';
import Router from 'react-router';
import _ from 'lodash';
import {IconButton, TextField, Checkbox} from 'material-ui';

import ConceptActions from '../../actions/concept-actions';
import LinkActions from '../../actions/link-actions';
import ConceptView from './_view';
import ConceptForm from './_form';
import ConceptNeighbors from './_neighbors';
import LinkRow from './link-row';

let ConceptInfo = React.createClass({

	getInitialState() {
		return {
			'edit': false,
			'isDirty': false,
			'expandLinkForm': false
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
		let {edit, relationType, expandLinkForm} = this.state;

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


		let linkFormClass = expandLinkForm ? 'expanded' : 'collapsed';
		return (
			<div>
				<div className="concept-info card"
						 style={{'border': `8px solid ${this.props.concept.color}`}}>
					{comp}
				</div>
				<div className="card">
					<form onSubmit={this.onCreateLink}>
						<div className="row middle-xs">
							<div className="col-xs-11">
								<TextField ref="linkUrl" floatingLabelText="Add a link"
													 onChange={this.onChangeLink}/>
							</div>
							<div className="col-xs-1">
								<IconButton iconClassName="icon icon-plus" tooltip="Add link"
														type="submit" className="small"/>
							</div>
						</div>
						<div className={`row middle-xs link-form ${linkFormClass}`}>
							<div className="col-xs-8">
								<TextField ref="linkName" floatingLabelText="Link name (optional)"/>
							</div>
							<div className="col-xs-4">
								<Checkbox ref="linkPaywalled" label="paywalled"/>
							</div>
						</div>
					</form>
					<hr/>
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
		this.state.isDirty = true;
	},

	onKeydown(e) {
		if (e.keyCode == 27/*ESC*/) {
			if (this.state.isDirty &&
				!confirm('Do you really want to discard your changes?')) return;
			ConceptActions.unselect();
		}
	},

	onSearch(param) {
		this.setState({'relationType': param});
	},

	onChangeLink(e) {
		this.setState({'expandLinkForm': e.target.value.length});
	},

	onCreateLink() {
		let {linkName, linkUrl, linkPaywalled} = this.refs;
		LinkActions.create({
			'name': linkName.getValue(),
			'url': linkUrl.getValue(),
			'paywalled': linkPaywalled.isChecked()
		});
		linkName.setValue('');
		linkUrl.setValue('');
		linkPaywalled.setChecked(false);
		this.setState({'expandLinkForm': false});
	}

});

export default ConceptInfo;
