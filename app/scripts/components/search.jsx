let React = require('react');

let searchAPI = require('../api/search-api');
let Select = require('./select');

let nameAndContainer = require('./helpers/nameAndContainer');

let Search = React.createClass({

	render() {
		return (
			<Select placeholder="Search" autoload={false}
			        asyncOptions={this.onLoadOptions}
			        onChange={this.onChange} {...this.props}/>
		);
	},

	onLoadOptions(query, callback) {
		searchAPI({'q': query, 'for': ['Concept']}).then(result => {
			let options = result.map(concept => {
				return {'value': concept.id, 'label': nameAndContainer(concept)};
			});
			callback(null, {options, 'complete': options.length < 10});
		});
	},

	onChange(id) {
		this.props.onSelect(id || undefined);
	}

});

export default Search;
