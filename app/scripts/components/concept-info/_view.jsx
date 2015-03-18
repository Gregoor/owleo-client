let React = require('react');
let IconButton = require('material-ui').IconButton;

let ConceptActions = require('../../actions/concept-actions');

let ConceptView = React.createClass({

	render() {
		let concept = this.props.concept;
		let linkRows = [];

		for (let link of concept.links) {
			linkRows.push(
				<div className="row middle-xs">
					<div className="col-xs-8">
						<a href={link.url}>{link.url}</a>
					</div>
					<div className="col-xs-4">
						{link.paywalled ? '$' : ''}
					</div>
				</div>
			);
		}

		return (
			<div>
				<div className="row">
					<div className="col-xs-8">
						<h1 title={concept.name}>{concept.name}</h1>
					</div>
					<div className="col-xs-2">
						<IconButton iconClassName="icon icon-cog" tooltip="Edit"
						            onClick={this.props.onEdit}/>
					</div>
					<div className="col-xs-2">
						<IconButton iconClassName="icon icon-bin" tooltip="Delete"
						            onClick={this.onDelete}/>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">{concept.summary}</div>
				</div>
				{linkRows}
			</div>
		);
	},

	onDelete() {
		if (!confirm('Ya sure?')) return;

		ConceptActions.delete(this.props.concept.id);
	}

});

export default ConceptView;
