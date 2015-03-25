let React = require('react');

let _ = require('lodash');
let Select = require('react-select');

export default React.createClass({

	getDefaultProps() {
		return {
			'exclude': [],
			'defaultValue': null,
			'onChange': _.noop
		};
	},

	getInitialState() {
		return {
			'value': null
		};
	},

	render() {
		return (
			<Select {...this.props} value={this.state.value || this.props.defaultValue}
			                        onChange={this.onChange}
			                        asyncOptions={this.onGetOptions}/>
		);
	},

	onChange(value) {
		this.setState({value});
		this.props.onChange.apply(this, arguments);
	},

	onGetOptions(filter, cb) {
		this.props.asyncOptions(filter, (err, obj) => {
			_.remove(obj.options, (o) => _.includes(this.props.exclude, o.label));
			cb(err, obj);
		});
	}

});
