import React from 'react';
import _ from 'lodash';
import {IconButton, TextField, Checkbox, FlatButton} from 'material-ui';

import ConceptActions from '../../actions/concept-actions';
import LinkActions from '../../actions/link-actions';
import nameAndContainer from '../helpers/nameAndContainer';

let ConceptView = React.createClass({

	render() {
		let {concept, editMode} = this.props;

		let editActions;
		if (editMode) editActions = [
			(
				<div className="col-xs-4">
					<IconButton key="edit" iconClassName="icon icon-pencil"
											tooltip="Edit" onClick={this.props.onEdit}/>
				</div>
			),
			(
				<div className="col-xs-4">
					<IconButton key="delete" iconClassName="icon icon-bin"
											tooltip="Delete" onClick={this.onDelete}/>
				</div>
			)
		];

		let containerRow;
		if (concept.container && concept.container.id) {
			containerRow = (
				<div className="row">
					<div className="col-xs-12" style={{'display': 'inline'}}>
						<h2>Container</h2>
						{nameAndContainer(concept.container)}
					</div>
				</div>
			);
		}

		let tags = concept.tags.map((tag) => {
			return (<span key={tag} className="tag">{tag}</span>)
		});

		let reqLinks = [];
		for (let req of concept.reqs) {
			reqLinks.push(
				<a key={req.id} href={`#/${req.id}`}>{nameAndContainer(req)}</a>
			);
			reqLinks.push(', ');
		}
		reqLinks = reqLinks.slice(0, reqLinks.length - 1);
		if (reqLinks.length == 0) reqLinks.push(<em>None</em>);

		let summarySourceRow;
		if (concept.summarySource) {
			summarySourceRow = (
				<div className="row">
					<div className="col-xs-12" style={{'display': 'inline'}}>
						<h2>Source:</h2>
						<a className="link" target="_blank" href={concept.summarySource}>
							{concept.summarySource}
						</a>
					</div>
				</div>
			);
		}

		let linkRows = _(concept.links).sortBy(l => l.votes * -1).map((link) => {
			let parser = document.createElement('a');
			parser.href = link.url;
			let paths = parser.pathname.split('/');
			let label = link.name ||
				`${parser.hostname}/../${paths[paths.length - 1]}`;
			return (
				<div key={link.url} className="row middle-xs">
					<div className="col-xs-2">
						<button type="button" onClick={() => this.onVoteLink(link)}>
							{link.votes}
						</button>
					</div>
					<div className="col-xs-8">
						<a className="link" target="_blank" href={link.url}>
							{label}
						</a>
					</div>
					<div className="col-xs-2">
						{link.paywalled ? '$' : ''}
					</div>
				</div>
			);
		}).value();

		return (
			<div>
				<div className="row">
					<div className="col-xs-8">
						<h1 title={concept.name} style={{
								'borderLeft': `5px solid ${concept.color}`
							}}>
							{concept.name}
						</h1>
					</div>
					<div className="col-xs-4">
						<div className="row end-xs">
							{editActions}
						</div>
					</div>
				</div>
				<div className="scroll">
					{containerRow}
					<div className="row">
						<div className="col-xs-12" style={{'display': 'inline'}}>
							{tags}
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12" style={{'display': 'inline'}}>
							<h2>Requirements:</h2>
							{reqLinks}
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12" style={{'display': 'inline'}}>
							<h2>Summary:</h2>
							{concept.summary}
						</div>
					</div>
					{summarySourceRow}
					<form onSubmit={this.onCreateLink}>
						<div className="row">
							<div className="col-xs-6">
								<TextField floatingLabelText="Name" ref="linkName"/>
							</div>
							<div className="col-xs-6">
								<Checkbox label="paywalled" ref="linkPaywalled"/>
							</div>
						</div>
						<div className="row">
							<div className="col-xs-8">
								<TextField floatingLabelText="URL" ref="linkUrl"/>
							</div>
							<div className="col-xs-4 center-xs">
								<FlatButton label="Create" secondary={true} type="submit"/>
							</div>
						</div>
					</form>
					{linkRows}
				</div>
			</div>
		);
	},

	onDelete() {
		if (!confirm('Ya sure?')) return;

		ConceptActions.delete(this.props.concept.id);
	},

	onCreateLink() {
		let {linkName, linkUrl, linkPaywalled} = this.refs;
		LinkActions.create({
			'name': linkName.getValue(),
			'url': linkUrl.getValue(),
			'paywalled': linkPaywalled.isChecked()
		});

	},

	onVoteLink(link) {
		if (link.hasVoted) LinkActions.unvote(link.id);
		else LinkActions.vote(link.id);
	}

});

export default ConceptView;
