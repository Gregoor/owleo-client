import React from 'react';
import Router from 'react-router';
import _ from 'lodash';
import {IconButton} from 'material-ui';

import ConceptView from './_view';
import ConceptForm from './_form';
import ConceptNeighbors from './_neighbors';
import ConceptActions from '../../actions/concept-actions';
import LinkActions from '../../actions/link-actions';

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

		let linksHTML = _(this.props.concept.links || [])
			.sortBy(link => -link.votes)
			.map(link => {
				let parser = document.createElement('a');
				parser.href = link.url;
				let paths = parser.pathname.split('/');
				let label = link.name ||
					`${parser.hostname}/../${paths[paths.length - 1]}`;

				let votedClass = link.hasVoted ? 'voted' : '';

				return (
					<div className="card link" key={link.url}>
						<div className="row">
							<div className="col-xs-1">
								<IconButton iconClassName="icon icon-arrow-up" tooltip="Vote"
														onClick={() => this.onVoteLink(link)}
														className={votedClass}
														style={{fontSize: 9, padding: 0}}/>
							</div>
							<div className="col-xs-1">
								{link.votes}
							</div>
							<div className="col-xs-10">
								<a className="link and-so-on" target="_blank" href={link.url}>
									{label}
								</a>
							</div>
						</div>
					</div>
				);
			})
			.value();

		return (
			<div>
				<div className="concept-info card"
						 style={{'border': `8px solid ${this.props.concept.color}`}}>
					{comp}
				</div>
				{linksHTML}
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
	},

	onVoteLink(link) {
		if (link.hasVoted) LinkActions.unvote(link.id);
		else LinkActions.vote(link.id);
	}

});

export default ConceptInfo;
