let React = require('react');

let searchAPI = require('../api/search-api');
let Select = require('./select');

let Search = React.createClass({

	render() {
		return (
			<Select placeholder="Search" autoload={false}
			        asyncOptions={this.onLoadOptions}
			        onChange={this.onChange}/>
		);
	},

	onLoadOptions(q, cb) {
		searchAPI({q, 'for': ['Concept']}).then(result => {
			let options = result.map(c => {
				let label = c.name;
				let containerName = c.container.name;
				if (containerName) label += ` in ${containerName}`;
				return {'value': c.id, label};
			});
			cb(null, {options, 'complete': options.length < 10});
		});
	},

	onChange(id) {
		this.props.onSelect(id || undefined);
	}

});

export default Search;
