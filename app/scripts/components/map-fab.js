let React = require('react');

let _ = require('lodash');
let {FloatingActionButton} = require('material-ui');

let MapFab = React.createClass({

	getDefaultProps() {
		return {'secondary': false};
	},

	render() {
		let {secondary, icon} = this.props;
		let fabProps = _.pick(this.props, 'onClick', 'title');

		let secondaryProps = secondary ? {'secondary': true, 'mini': true} : {};

		return (
			<div className="center-xs">
				<FloatingActionButton {...fabProps} {...secondaryProps}
				                      iconClassName={`icon icon-${icon}`}/>
			</div>
		);
	}

});

export default MapFab;
