import Reflux from 'reflux';
import _ from 'lodash';

import ConceptActions from '../actions/concept-actions';
import LinkActions from '../actions/link-actions';
import ConceptAPI from '../api/concept-api';
import LinkAPI from '../api/link-api';

let conceptStore = Reflux.createStore({

	listenables: [ConceptActions, LinkActions],

	setAll(concepts) {
		this.all = new Map(concepts);
		this.triggerAll();
	},

	setSelected(concept) {
		this.selected = concept;
		this.triggerAll();
	},

	triggerAll() {
		this.trigger({'all': this.all, 'selected': this.selected});
	},

	getAll() {
		ConceptAPI.all().then(this.setAll);
	},

	reposition() {
		ConceptAPI.reposition(Array.from(this.all.values())).then(this.setAll);
	},

  select(id) {
	  if (this.selected && id == this.selected.id) return;
    ConceptAPI.find(id).then(this.setSelected);
  },

	unselect() {
		this.setSelected();
	},

	new() {
		this.setSelected({'isNew': true});
	},

	save(data) {
		data = _.pick(data, 'name', 'summary','color','summarySource', 'reqs','container', 'tags', 'links');

		(this.selected.isNew ? this.create : this.update)(data);
	},

	create(data) {
		ConceptAPI.create(data).then((serverData) => {
			ConceptActions.created(serverData);
			this.setSelected(serverData);
		});
	},

	update(data) {
		ConceptAPI.update(this.selected.id, data).then((serverData) => {
			ConceptActions.updated(serverData);
			this.setSelected(serverData);
		});
	},

	delete(id) {
		ConceptAPI.delete(id).then(() => {
			ConceptActions.deleted(id);
			this.setSelected();
		});
	},

	vote(linkId) {
		LinkAPI.vote(this.selected.id, linkId)
			.then(this.handleVoteResponse(linkId, true));
	},

	unvote(linkId) {
		LinkAPI.unvote(this.selected.id, linkId)
			.then(this.handleVoteResponse(linkId, false));
	},

	handleVoteResponse(linkId, hasVoted) {
		return (resp) => {
			let {selected} = this;
			if (selected) {
				let link = _.find(selected.links, {'id': linkId});
				if (link) {
					_.assign(link, {'votes': resp.votes, hasVoted});
					this.triggerAll();
				}
			}
		}
	}

});

export default conceptStore;
