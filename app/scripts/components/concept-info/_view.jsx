import React from 'react';
import _ from 'lodash';
import {IconButton, TextField, Checkbox, FlatButton} from 'material-ui';

import ConceptActions from '../../actions/concept-actions';
import nameAndContainer from '../helpers/nameAndContainer';

let ConceptView = React.createClass({

	render() {
		let {concept, editMode} = this.props;

		let editActions;
		if (editMode) editActions = [
			(
				<div className="col-xs-1.5">
					<IconButton key="edit" iconClassName="icon icon-pencil"
											tooltip="Edit" onClick={this.props.onEdit}/>
				</div>
			),
			(
				<div className="col-xs-1.5">
					<IconButton key="delete" iconClassName="icon icon-bin"
											tooltip="Delete" onClick={this.onDelete}/>
				</div>
			)
		];

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

		let {fetching} = concept;
		return (
			<div>
						<div className="row end-xs">
							{editActions} </div>

				<div className="scroll">
					<div className="row">
						<div className="col-xs-3">
									<IconButton iconClassName="icon icon-arrow-left"
															style={{paddingBottom: 1}}
															disabled={fetching || !concept.reqs.length}
															onClick={this.onSearchFor('leadsTo')}/>
									<span className="center-xs" style={{fontSize: 9}}>
										REQUIREMENTS
									</span>
						</div>
						<div className="col-xs-6">
							<div style={{'font-size': '18px', 'font-weight': 'bold'}}>
								{concept.name}
							</div>
							<div className="row">
								<div className="col-xs-1">
									in
								</div>
								<div className="col-xs-11">
									{concept.container.name}
								</div>
							</div>
						</div>
						<div className="col-xs-3">
							<IconButton iconClassName="icon icon-arrow-right"
													disabled={!concept.followupCount}
													style={{paddingBottom: 1}}
													onClick={this.onSearchFor('reqBy')}/>
							<span className="center-xs" style={{fontSize: 9}}>
									FOLLOWUPS
							</span>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12" style={{'display': 'inline'}}>
							{fetching ? 'Loading...' : concept.summary}
						</div>
					</div>
					{summarySourceRow}
				</div>
			</div>
		);
	},

	onDelete() {
		if (!confirm('Ya sure?')) return;

		ConceptActions.delete(this.props.concept.id);
	},

	onSearchFor(param) {
		return () => this.props.onSearch(param);
	}

});

export default ConceptView;
