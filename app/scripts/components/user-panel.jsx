import React from 'react';
import {Toolbar, ToolbarGroup, RaisedButton} from 'material-ui';

import userStore from '../stores/user-store';

let UserPanel = React.createClass({

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
        <h5 className="name">{user.name}</h5>,
        <RaisedButton label="Logout" primary={true}
                      onClick={this.props.onLogout}/>
      ];
    } else {
      panelHTML = <RaisedButton label="Auth" primary={true}
                                className="extra-padding"
                                linkButton={true} href="#/login"/>;
    }

    return (
      <Toolbar className="user">
        <ToolbarGroup float="right">
          <a href="mailto:hello@owleo.com"
             style={{lineHeight: '57px', marginRight: '20px'}}>
            Contact us!
          </a>
          {panelHTML}
        </ToolbarGroup>
      </Toolbar>
    );
  }

});

export default UserPanel;
