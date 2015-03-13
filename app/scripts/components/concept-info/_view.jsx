let React = require('react');
let IconButton = require('material-ui').IconButton;

let ConceptView = React.createClass({

	render() {
		let concept = this.props.concept;
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
						<IconButton iconClassName="icon icon-bin" tooltip="Delete"/>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">{concept.summary}</div>
				</div>
			</div>
		);
	}

});

export default ConceptView;
