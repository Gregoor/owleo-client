import React from 'react';
import {Toolbar, ToolbarGroup, RaisedButton} from 'material-ui';

let UserPanel = React.createClass({

	propTypes: {
		'user': React.PropTypes.shape({
			'loggedIn': React.PropTypes.bool
		}).isRequired
	},

	render() {
		let {user} = this.props;

		let panelHTML;
		if (user.loggedIn) {
			panelHTML = (
				<a href="/logout">Logout</a>
			);
		} else {
			panelHTML = (
				<a href="/login">Login</a>
			);
		}

		return (
			<Toolbar className="user">
				<ToolbarGroup float="right">
					<RaisedButton label="Auth" primary={true}
												linkButton={true} href="#/login" />
				</ToolbarGroup>
			</Toolbar>
		);
	}

});

export default UserPanel;
