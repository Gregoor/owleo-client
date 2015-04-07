let React = require('react');
let _ = require('lodash');
let {TextField, FlatButton, Checkbox} = require('material-ui');
let Select = require('../select');
let FormData = require('../mixins/FormData');//require('react-form-data');
let ColorPicker = require('react-color-picker');
let ConceptActions = require('../../actions/concept-actions');
let searchAPI = require('../../api/search-api');
let IconButton = require('material-ui').IconButton;
let nameAndContainer = require('../helpers/nameAndContainer');


let ConceptForm = React.createClass({

	mixins: [FormData],

	getInitialState() {
		return {'newLinksCount': 1, 'deletedLinks': []}
	},

	getInitialFormData() {
		return _.merge({'links': [{'url': '', 'paywalled': false}]},
			_.pick(this.props.concept, 'name','color', 'summary','summarySource', 'links')
		);
	},

	render() {
		let concept = this.props.concept,
				abortButton = '',
				linkRows = [],
				deletedLinks = this.state.deletedLinks,
				linksCount = this.state.newLinksCount;

		if (!concept.isNew) linksCount += concept.links.length;
		for (var i = 0; i < linksCount; i++) {
			let textFieldProps = {},
					checkboxProps = {};
			if (_.includes(deletedLinks, i)) {
				continue;
			}
			if (i + 1 == linksCount) {
				textFieldProps.onChange = this.onChangeLastLink;
				checkboxProps.onClick = this.onChangeLastLink;
			}

			let link = concept.isNew ? {} : concept.links[i] || {};
			linkRows.push(
				<div key={`link-${i}`} className="row middle-xs">
					<div className="col-xs-7">
						<TextField name={`links[url][${i}]`}
											 floatingLabelText="URL"
											 defaultValue={link.url} {...textFieldProps}/>
					</div>
					<div className="col-xs-3">
						<Checkbox name={`links[paywalled][${i}]`}
											label="paywalled"
						          defaultSwitched={link.paywalled} {...checkboxProps} />
					</div>
					<div className="col-xs-2">
						<IconButton type="button"
												iconClassName="icon icon-bin"
												tooltip="Delete"
												onClick={this.onDeleteLink.bind(this, i)}/>
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
			<form onChange={this.onChange} onSubmit={this.onSave}>
				<div className="row">
					<div className="col-xs-12">
						<TextField floatingLabelText="Name"
											 name="name"
						           defaultValue={concept.name} />
					</div>
				</div>
				<div className="scroll">
					{/*
					<div className="row">
						<div className="col-xs-12">
							<h2>Tags</h2>
							<Select name="tags"
											placeholder="Tags"
							        defaultValue={concept.tags}
							        multi={true}
											autoload={false}
							        asyncOptions={this.onGetOptionsOf('Tag')}
							        createable={true}/>
						</div>
					</div>
						*/}
					<div className="row">
						<div className="col-xs-8">
							<ColorPicker floatingLabelText="Concept color"
										 defaultValue={concept.color}
										 onChange={this.onChangeColor}
										 saturationHeight={50}
										 saturationWidth={100}/>
							</div>
						<div className="col-xs-4">
							<div className="colorbox" style={{'background-color': concept.color}}></div>
						</div>
						<div className="col-xs-12">
							<h2>Contained by</h2>
							<Select name="container"
											placeholder="Container"
											defaultValue={concept.container ? this.nameObjToOption(concept.container) : undefined}
											autoload={false}
											asyncOptions={this.onGetOptionsOf('Concept')}/>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<h2>Requirements</h2>
							<Select name="reqs"
											placeholder="Requirements"
							        defaultValue={concept.reqs ? concept.reqs.map(this.nameObjToOption) : undefined}
							        multi={true}
										  autoload={false}
							        asyncOptions={this.onGetOptionsOf('Concept')}/>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<TextField floatingLabelText="Summary"
												 multiLine={true}
							           name="summary"
												 defaultValue={concept.summary} />
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<TextField floatingLabelText="Source of summary"
												 multiline={false}
								         name="summarySource"
												 defaultValue={concept.summarySource} />
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

	onChange(e) {
		this.updateFormData(e);
		this.props.onChange();
	},

	onSave(e) {
		let getValueOfName = (name) => this.getDOMNode().querySelector(`[name="${name}"]`).value;
		let splitValueOfName = (name) => _.compact(getValueOfName(name).split(','));
		e.preventDefault();

		let data = _.cloneDeep(this.formData);
		data.links = data.links.filter((l) => l.url);
		data.reqs = splitValueOfName('reqs');
		data.container = getValueOfName('container');
		// data.tags = splitValueOfName('tags');
		ConceptActions.save(data);
		this.props.onDone();
	},

	nameObjToOption(obj) {
		let value = obj.id || obj.name;
		let label = obj.container ? nameAndContainer(obj) : obj.name;
		return {value, label};
	},

	onDeleteLink(i) {
		let deletedLinks = _.clone(this.state.deletedLinks);
		deletedLinks.push(i);
		this.setState({deletedLinks});
		this.formData.links.splice(i, 1);
	},

	onChangeColor(color) {
		this.formData.color = color;
	}

});

export default ConceptForm;
