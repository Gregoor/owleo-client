let React = require('react');
let IconButton = require('material-ui').IconButton;

let ConceptActions = require('../../actions/concept-actions');

let ConceptView = React.createClass({

	render() {
		let concept = this.props.concept;

		let editActions;
		if (this.props.editMode) {
			editActions = [
				(
					<div className="col-xs-4">
						<IconButton iconClassName="icon icon-pencil" tooltip="Edit"
						            onClick={this.props.onEdit}/>
					</div>
				),
				(
					<div className="col-xs-4">
					<IconButton iconClassName="icon icon-bin" tooltip="Delete"
					            onClick={this.onDelete}/>
					</div>
				)
			];
		}

		let tags = concept.tags.map((tag) => (<span className="tag">{tag}</span>));

		let reqLinks = [];
		for (let req of concept.reqs) {
			reqLinks.push(
				<a href={`#/${req.id}`}>{req.name}</a>
			);
			reqLinks.push(', ');
		}
		reqLinks = reqLinks.slice(0, reqLinks.length - 1);
		if (reqLinks.length == 0) reqLinks.push(<em>None</em>)

		let linkRows = concept.links.map((link) => {
			let parser = document.createElement('a');
			parser.href = link.url;
			let paths = parser.pathname.split('/');
			let partial = `${parser.hostname}/../${paths[paths.length - 1]}`;
			return (
				<div className="row middle-xs">
					<div className="col-xs-8">
						<a className="link" target="_blank" href={link.url}>{partial}</a>
					</div>
					<div className="col-xs-4">
						{link.paywalled ? '$' : ''}
					</div>
				</div>
			);
		});

		return (
			<div>
				<div className="row">
					<div className="col-xs-8">
						<h1 title={concept.name}>{concept.name}</h1>
					</div>
					<div className="col-xs-4">
						<div className="row end-xs">
							<div className="col-xs-4">
								<IconButton iconClassName="icon icon-eye"
								            tooltip="Show in map"/>
							</div>
							{editActions}
						</div>
					</div>
				</div>
				<div className="scroll">
					<div className="row">
						<div className="col-xs-12" style={{'display': 'inline'}}>
							<h2>Container</h2>
							{concept.container.name}
						</div>
					</div>
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
					<br/>
					<div className="row">
						<div className="col-xs-12" style={{'display': 'inline'}}>
							<h2>Summary:</h2>
							{concept.summary}
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12" style={{'display': 'inline'}}>
							<h2>Source of summary:</h2>
							<a className="link" target="_blank" href={concept.summarySource}>{concept.summarySource}</a>
					</div>
						</div>
					{linkRows}
				</div>
			</div>
		);
	},

	onDelete() {
		if (!confirm('Ya sure?')) return;

		ConceptActions.delete(this.props.concept.id);
	}

});

export default ConceptView;
