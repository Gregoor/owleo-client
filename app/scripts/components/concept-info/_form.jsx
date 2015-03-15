let React = require('react');

let _ = require('lodash');
let {TextField, FlatButton, Checkbox} = require('material-ui');
let FormData = require('../../mixins/FormData');//require('react-form-data');

let ConceptActions = require('../../actions/concept-actions');

let ConceptForm = React.createClass({

	mixins: [FormData],

	getInitialState() {
		return {'newLinksCount': 1};
	},

	getInitialFormData() {
		return _.merge({'links': [{'url': '', 'paywalled': false}]},
			_.pick(this.props.concept, 'name', 'summary', 'links'));
	},

	render() {
		let concept = this.props.concept;
		let isNew = !concept.id;
		let abortButton = '', linkRows = [];

		let linksCount = concept.links.length + this.state.newLinksCount;
		for (var i = 0; i < linksCount; i++) {
			let textFieldProps = {}, checkboxProps = {};
			if (i + 1 == linksCount) {
				textFieldProps.onChange = this.onChangeLastLink;
				checkboxProps.onClick= this.onChangeLastLink;
			}

			let link = concept.links[i] || {};
			linkRows.push(
				<div className="row middle-xs">
					<div className="col-xs-8">
						<TextField name={`links[url][${i}]`} floatingLabelText="URL"
							defaultValue={link.url} {...textFieldProps}/>
					</div>
					<div className="col-xs-4">
						<Checkbox name={`links[paywalled][${i}]`} label="paywalled"
						          defaultSwitched={link.paywalled} {...checkboxProps} />
					</div>
				</div>
			);
		}

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
				{linkRows}
				<div className="row end-xs">
					{abortButton}
					<div className="col-xs-3">
						<FlatButton label={isNew ? 'Create' : 'Save'} primary={true} />
					</div>
				</div>
			</form>
		);
	},

	onChangeLastLink() {
		this.formData.links.push({'url': '', 'paywalled': false});
		this.setState({'newLinksCount': this.state.newLinksCount + 1});
	},

	onAbort() {
		if (!confirm('Do you really want to discard your changes?')) return;

		this.props.onDone();
	},

	onSave(e) {
		e.preventDefault();

		let data = _.cloneDeep(this.formData);
		data.links = data.links.filter((l) => l.url);

		ConceptActions.save(data);
		this.props.onDone();
	}

});

export default ConceptForm;
