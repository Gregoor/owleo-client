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
			'selected': undefined
		};
	},

	render() {
		return (
			<Select {...this.props} value={this.getValue()}
			                        onChange={this.onChange}
			                        asyncOptions={this.onGetOptions}/>
		);
	},

	getValue() {
		let {selected} = this.state;
		if (selected !== undefined && selected.length == 0) selected = [];
		return selected || this.props.defaultValue;
	},

	onChange(newValue, selected) {
		this.setState({selected});
		this.props.onChange.apply(this, arguments);
	},

	onGetOptions(filter, cb) {
		this.props.asyncOptions(filter, (err, obj) => {
			_.remove(obj.options, (o) => _.includes(this.props.exclude, o.label));
			cb(err, obj);
		});
	}

});
