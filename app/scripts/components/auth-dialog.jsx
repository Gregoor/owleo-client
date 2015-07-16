import React from 'react';
import Reflux from 'reflux';
import Router from 'react-router';
import {Dialog, TextField, FlatButton} from 'material-ui';

import userStore from '../stores/user-store';
import userAPI from '../api/user-api';

let AuthDialog = React.createClass({

  mixins: [Reflux.ListenerMixin, Router.Navigation],

  getInitialState() {
    return {'exists': false, 'mismatch': false};
  },

  componentDidMount() {
    this.refs.dialog.show();
    if (userStore.user.loggedIn) this.onClose();
    this.listenTo(userStore, user => {
      if (user.loggedIn) this.onClose();
    });
  },

  render() {
    let {exists, mismatch, invalidPw, checking} = this.state;

    return (
      <Dialog ref="dialog" title="Auth" onDismiss={this.onDismiss}
              contentStyle={{maxWidth: '310px'}}>
        <form onSubmit={this.onSubmit}>
          <div className="row">
            <div className="col-xs-12">
              Login with your existing user or enter a new user name.
            </div>
            <div className="col-xs-12">
              <TextField ref="name" floatingLabelText="Name"
                         errorText={exists ? 'User exists' : ''}
                         onChange={this.onNameChange}/>
            </div>
            <div className="col-xs-12">
              <TextField ref="pw" floatingLabelText="Password" type="password"
                         errorText={invalidPw ? 'Invalid password': ''}
                         onChange={this.onCheckSame}/>
            </div>
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
              <FlatButton type="button" label="Cancel" secondary={true}
                          disabled={checking}
                          onClick={this.onClose}/>
            </div>
            <div className="col-xs-4">
              <FlatButton type="submit"
                          disabled={checking || invalidPw || !exists && mismatch}
                          label={checking ? 'Checking' :
                            (exists ? 'Login' : 'Register')}
                          primary={true}/>
            </div>
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
    this.setState({
      'invalidPw': false,
      'mismatch': pwVal != pwRepeatVal && pwRepeatVal.length > 0
    });
  },

  onSubmit(event) {
    event.preventDefault();
    let {name, pw} = this.refs;
    let user = {'name': name.getValue(), 'password': pw.getValue()};
    this.setState({'checking': true});
    userStore.auth(user, this.state.exists)
      .catch(() => this.setState({'invalidPw': true, 'checking': false}));
  },

  onClose() {
    this.refs.dialog.dismiss();
  },

  onDismiss() {
    setTimeout(() => this.transitionTo('/'), 300);
  }

});

export default AuthDialog;
