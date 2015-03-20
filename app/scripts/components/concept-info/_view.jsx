let React = require('react');
let IconButton = require('material-ui').IconButton;

let ConceptActions = require('../../actions/concept-actions');

let ConceptView = React.createClass({

	render() {
		let concept = this.props.concept;

		let reqLinks = [];
		for (let req of concept.reqs) {
			reqLinks.push(
				<a href={`#/${encodeURIComponent(req.name)}`}>{req.name}</a>
			);
			reqLinks.push(', ');
		}
		reqLinks = reqLinks.slice(0, reqLinks.length - 1);

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
					<div className="col-xs-4">
						<div className="row">
							<div className="col-xs-4">
								<IconButton iconClassName="icon icon-eye" tooltip="Show in map"
								            onClick={this.props.onEdit}/>
							</div>
							<div className="col-xs-4">
								<IconButton iconClassName="icon icon-pencil" tooltip="Edit"
								            onClick={this.props.onEdit}/>
							</div>
							<div className="col-xs-4">
								<IconButton iconClassName="icon icon-bin" tooltip="Delete"
								            onClick={this.onDelete}/>
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12" style={{'display': 'inline'}}>
						{reqLinks}
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
