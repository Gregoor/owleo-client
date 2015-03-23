let React = require('react');

let _ = require('lodash');
let Select = require('react-select');

export default React.createClass({

	getDefaultProps() {
		return {
			'exclude': []
		};
	},

	render() {
		return (
			<Select {...this.props} asyncOptions={this.onGetOptions}/>
		);
	},

	onGetOptions(filter, cb) {
		this.props.asyncOptions(filter, (err, obj) => {
			_.remove(obj.options, (o) => _.includes(this.props.exclude, o.label));
			cb(err, obj);
		});
	}

});
