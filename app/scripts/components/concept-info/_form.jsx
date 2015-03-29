let React = require('react');

let _ = require('lodash');
let {TextField, FlatButton, Checkbox} = require('material-ui');
let Select = require('./select');
let FormData = require('../../mixins/FormData');//require('react-form-data');

let ConceptActions = require('../../actions/concept-actions');
let searchAPI = require('../../api/search-api');

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
		let abortButton = '', linkRows = [];

		let linksCount = this.state.newLinksCount;
		if (!concept.isNew) linksCount += concept.links.length;
		for (var i = 0; i < linksCount; i++) {
			let textFieldProps = {}, checkboxProps = {};
			if (i + 1 == linksCount) {
				textFieldProps.onChange = this.onChangeLastLink;
				checkboxProps.onClick= this.onChangeLastLink;
			}

			let link = concept.isNew ? {} : concept.links[i] || {};
			linkRows.push(
				<div key={`link-${i}`} className="row middle-xs">
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

		if (!concept.isNew) {
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
				<div className="scroll">
					<div className="row">
						<div className="col-xs-12">
							<h2>Tags</h2>
							<Select name="tags" placeholder="Tags"
							        defaultValue={concept.tags}
							        multi={true} autoload={false}
							        asyncOptions={this.onGetOptionsOf('Tag')}
							        createable={true}/>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<h2>Requirements</h2>
							<Select name="reqs" placeholder="Requirements"
							        defaultValue={concept.reqs ? concept.reqs.map(this.nameObjToOption) : undefined}
							        multi={true} autoload={false}
							        asyncOptions={this.onGetOptionsOf('Concept')}
											exclude={[concept.name]}/>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<TextField floatingLabelText="Summary" multiLine={true}
							           name="summary" defaultValue={concept.summary} />
						</div>
					</div>
					{linkRows}
				</div>
				<div className="row end-xs">
					{abortButton}
					<div className="col-xs-3">
						<FlatButton label={concept.isNew ? 'Create' : 'Save'}
						            primary={true} />
					</div>
				</div>
			</form>
		);
	},


	onGetOptionsOf(type) {
		return (q, cb) => searchAPI({q, 'for': [type]}).then((result) => {
			let options = result.map(this.nameObjToOption);
			cb(null, {options, 'complete': options.length < 10});
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
		let splitValueOfName = (name) => _.compact(this.getDOMNode()
			.querySelector(`[name="${name}"]`).value.split(','));
		e.preventDefault();

		let data = _.cloneDeep(this.formData);
		data.links = data.links.filter((l) => l.url);
		data.reqs = splitValueOfName('reqs');
		data.tags = splitValueOfName('tags');
		ConceptActions.save(data);
		this.props.onDone();
	},

	nameObjToOption(name) {
		if (name.name) name = name.name;
		return {'label': name, 'value': name};
	}

});

export default ConceptForm;
