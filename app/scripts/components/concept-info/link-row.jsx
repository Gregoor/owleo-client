import React from 'react';
import {IconButton} from 'material-ui';

import LinkActions from '../../actions/link-actions';

let LinkRow = React.createClass({

	render() {
		let {link} = this.props;
		let parser = document.createElement('a');
		parser.href = link.url;
		let path = parser.pathname.split('/');
		let label = link.name || `${parser.hostname}/../${path[path.length - 1]}`;

		let votedClass = link.hasVoted ? 'voted' : '';

		return (
			<div className="link row" key={link.id}>
				<div className="col-xs-1">
					<IconButton iconClassName="icon icon-arrow-up" tooltip="Vote"
											onClick={() => this.onVoteLink(link)}
											className={`small ${votedClass}`}/>
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
		);
	},

	onVoteLink(link) {
		if (link.hasVoted) LinkActions.unvote(link.id);
		else LinkActions.vote(link.id);
	}

});

export default LinkRow;
