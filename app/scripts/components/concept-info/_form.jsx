let React = require('react');

let _ = require('lodash');
let {TextField, FlatButton} = require('material-ui');
let FormData = require('react-form-data');

let ConceptActions = require('../../actions/concept-actions');

let ConceptForm = React.createClass({

	mixins: [FormData],

	getInitialFormData() {
		return _.pick(this.props.concept, 'name', 'summary');
	},

	render() {
		let concept = this.props.concept;
		let isNew = !concept.id;
		let abortButton = '';
		if (!isNew) {
			abortButton = (
				<div className="col-xs-3">
					<FlatButton label="Abort" type="button" onClick={this.onAbort} />
				</div>
			);
		}
		return (
			<form onChange={this.updateFormData} onSubmit={this.onSave}>
				<div className="row">
					<div className="col-xs-12">
						<TextField floatingLabelText="Name" name="name"
						           defaultValue={concept.name} />
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<TextField floatingLabelText="Summary" multiLine={true}
						           name="summary" defaultValue={concept.summary} />
					</div>
				</div>
				<div className="row end-xs">
					{abortButton}
					<div className="col-xs-3">
						<FlatButton label={isNew ? 'Create' : 'Save'} primary={true} />
					</div>
				</div>
			</form>
		);
	},

	onAbort() {
		if (!confirm('Do you really want to discard your changes?')) return;

		this.props.onDone();
	},

	onSave(e) {
		e.preventDefault();

		ConceptActions.save(this.formData);
		this.props.onDone();
	}

});

export default ConceptForm;
