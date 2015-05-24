import Reflux from 'reflux';
import _ from 'lodash';

import LinkActions from '../actions/link-actions';
import LinkAPI from '../api/link-api';

let linkStore = Reflux.createStore({

	listenables: LinkActions,

	setLinks(links, conceptId) {
		this.links = links;
		this.conceptId = conceptId;
	},

	triggerAll() {
		this.trigger(this.links);
	},

	create(data) {
		LinkAPI.create(this.conceptId, data).then(link => {
			this.links.push(link);
			this.triggerAll();
		})
	},

	vote(linkId) {
		LinkAPI.vote(this.conceptId, linkId)
			.then(this.handleVoteResponse(linkId, true));
	},

	unvote(linkId) {
		LinkAPI.unvote(this.conceptId, linkId)
			.then(this.handleVoteResponse(linkId, false));
	},

	handleVoteResponse(linkId, hasVoted) {
		return (resp) => {
			let {links} = this;
			if (links) {
				let link = _.find(links, {'id': linkId});
				if (link) {
					_.assign(link, {'votes': resp.votes, hasVoted});
					this.triggerAll();
				}
			}
		}
	}


});

export default linkStore;
