let React = require('react');

let {FloatingActionButton} = require('material-ui');

let MapFab = React.createClass({

	getDefaultProps() {
		return {'secondary': false};
	},

	render() {
		let {secondary, icon, onClick} = this.props;

		let secondaryProps = secondary ? {'secondary': true, 'mini': true} : {};

		return (
			<div className="center-xs">
				<FloatingActionButton onClick={onClick} {...secondaryProps}
				                      iconClassName={`icon icon-${icon}`}/>
			</div>
		);
	}

});

export default MapFab;
