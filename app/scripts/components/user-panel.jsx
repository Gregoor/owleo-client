import React from 'react';
import Radium from 'radium';
import {Toolbar, ToolbarGroup, ToolbarSeparator, RaisedButton} from 'material-ui';

import userStore from '../stores/user-store';

let styles = {
  text: {float: 'left', paddingLeft: '15px'},
  link: {lineHeight: '57px', float: 'left'}
};

let UserPanel = Radium(React.createClass({

  propTypes: {
    'user': React.PropTypes.shape({
      'loggedIn': React.PropTypes.bool
    }).isRequired,
    'onLogout': React.PropTypes.func.isRequired
  },

  render() {
    let {user} = this.props;

    let panelHTML;
    if (user.loggedIn) {
      panelHTML = [
        <h5 style={[styles.text]}>{user.name}</h5>,
        <RaisedButton label="Logout" primary={true}
                      onClick={this.props.onLogout}/>
      ];
    } else {
      panelHTML = <RaisedButton label="Auth" primary={true}
                                labelStyle={{paddingLeft: '25px'}}
                                linkButton={true} href="#/login"/>;
    }

    return (
      <Toolbar>
        <ToolbarGroup float="left">
          <a href="mailto:hello@owleo.com" style={[styles.link]}>
            Contact us!
          </a>
        </ToolbarGroup>
        <ToolbarGroup float="right">
          <ToolbarSeparator />
          {panelHTML}
        </ToolbarGroup>
      </Toolbar>
    );
  }

}));

export default UserPanel;
