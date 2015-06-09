import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import {Dialog, TextField, FlatButton} from 'material-ui';

import userStore from '../stores/user-store';
import userAPI from '../api/user-api';

let AuthDialog = React.createClass({

  mixins: [Reflux.ListenerMixin, Router.Navigation],

  getInitialState() {
    return {'exists': true, 'mismatch': false};
  },

  componentDidMount() {
    this.refs.dialog.show();
    if (userStore.user.loggedIn) this.onClose();
    this.listenTo(userStore, user => {
      if (user.loggedIn) this.onClose();
    })
  },

  render() {
    let {exists, mismatch} = this.state;

    return (
      <Dialog ref="dialog" title="Auth" className="auth"
              onDismiss={this.onDismiss}>
        <form onSubmit={this.onSubmit}>
          <div className="row">
            <div className="col-xs-12">
              <TextField ref="name" floatingLabelText="Name"
                         onChange={this.onNameChange}/>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <TextField ref="pw" floatingLabelText="Password" type="password"
                         onChange={this.onCheckSame}/>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <TextField ref="pwRepeat" floatingLabelText="Repeat password"
                         type="password" disabled={exists}
                         errorText={!exists && mismatch ? '!= password' : ''}
                         onChange={this.onCheckSame}/>
            </div>
          </div>
          <br/>

          <div className="row end-xs">
            <div className="col-xs-4">
              <FlatButton label="Cancel" secondary={true}
                          onClick={this.onClose}/>
            </div>
            <div className="col-xs-4">
              <FlatButton
                type="submit" label={exists ? 'Login' : 'Register'}
                primary={true} disabled={!exists && mismatch}/></div>
          </div>
        </form>
      </Dialog>
    );
  },

  onNameChange(e) {
    userAPI.exists(e.target.value).then(resp => {
      let {exists} = resp;
      this.setState({exists});
    });
  },

  onCheckSame() {
    let {pw, pwRepeat} = this.refs;
    let pwVal = pw.getValue(), pwRepeatVal = pwRepeat.getValue();
    this.setState({'mismatch': pwVal != pwRepeatVal && pwRepeatVal.length > 0});
  },

  onSubmit() {
    let {name, pw} = this.refs;
    let user = {'name': name.getValue(), 'password': pw.getValue()};
    userStore.auth(user, this.state.exists);
    this.onClose();
  },

  onClose() {
    this.refs.dialog.dismiss();
  },

  onDismiss() {
    setTimeout(() => this.transitionTo('/'), 300);
  }

});

export default AuthDialog;
