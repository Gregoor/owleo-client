let React = require('react');

let _ = require('lodash');
let {TextField, FlatButton, Checkbox} = require('material-ui');
let Select = require('react-select');
let FormData = require('../../mixins/FormData');//require('react-form-data');
let qwest = require('qwest');

let ConceptActions = require('../../actions/concept-actions');
let {host} = require('../../configs/api');

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

		let linksCount = this.state.newLinksCount;
		if (!isNew) linksCount += concept.links.length;
		for (var i = 0; i < linksCount; i++) {
			let textFieldProps = {}, checkboxProps = {};
			if (i + 1 == linksCount) {
				textFieldProps.onChange = this.onChangeLastLink;
				checkboxProps.onClick= this.onChangeLastLink;
			}

			let link = isNew ? {} : concept.links[i] || {};
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
						<Select name="reqs" value={concept.reqs ? concept.reqs.map(this.conceptToOption) : undefined}
						        multi={true} autoload={false}
						        asyncOptions={this.onGetSelectOptions}/>
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

	onGetSelectOptions(q, cb) {
		qwest.get(`${host}/concepts/search`, {q}).then((data) => {
			cb(null, {
				'options': JSON.parse(data).map(this.conceptToOption),
				'complete': false
			});
		});
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
		data.reqs = this.getDOMNode()
			.querySelector('[name="reqs"]').value.split(',');
		ConceptActions.save(data);
		this.props.onDone();
	},

	conceptToOption(concept) {
		return {'label': concept.name, 'value': concept.id};
	}

});

export default ConceptForm;
