import React from 'react';
import Router from 'react-router';
import {Dialog, TextField, FlatButton} from 'material-ui';

let AuthDialog = React.createClass({

	mixins: [Router.Navigation],

	componentDidMount() {
		this.refs.dialog.show();
	},

	render() {
		let actions = [
			<FlatButton
				label="Cancel"
				secondary={true}
				onClick={this.onClose}/>,
			<FlatButton
				label="Authme"
				primary={true}
				disabled={true}
				onTouchTap={this._handleCustomDialogSubmit}/>
		];

		return (
			<Dialog ref="dialog" title="Auth" className="auth"
							actions={actions} onDismiss={this.onDismiss}>
				<div className="row">
					<div className="col-xs-12">
						<TextField floatingLabelText="Name"/>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12">
						<TextField floatingLabelText="Password" type="password"/>
					</div>
				</div>
				<div className="row" style={{display: 'none'}}>
					<div className="col-xs-12">
						<TextField floatingLabelText="Repeat password" type="password"/>
					</div>
				</div>
			</Dialog>
		);
	},

	onClose() {
		this.refs.dialog.dismiss();
	},

	onDismiss() {
		setTimeout(() => this.transitionTo('/'), 300);
	}

});

export default AuthDialog;
