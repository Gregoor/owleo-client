let React = require('react');
let {TextField} = require('material-ui');

let ConceptForm = React.createClass({

	render() {
		let concept = this.props.concept;
		return (
			<div>
				<div className="row">
					<div className="col-xs-12">
						<TextField floatingLabelText="Name" defaultValue={concept.name} />
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<TextField floatingLabelText="Summary" multiLine={true}
						           defaultValue={concept.summary} />
					</div>
				</div>
			</div>
		);
	}

});

export default ConceptForm;
