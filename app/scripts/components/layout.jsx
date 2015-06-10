import React from 'react';
import Router from 'react-router';
import {Dialog, FlatButton} from 'material-ui';

let {RouteHandler} = Router;

let Layout = React.createClass({

  componentDidMount() {
    if (window.innerWidth < 500 &&
        localStorage.getItem('sawMobileInfo') != 'true') {
      this.refs.mobileDialog.show();
    }
  },

  render() {
    return (
      <div className="App">
        <Dialog ref="mobileDialog" title="Not optimized for mobile yet">

          <div className="row">
            <div className="col-xs-12">
              This early version of owleo.com is not yet optimized for mobile usage.
              Correspondingly touch gestures don't work and the site is
              somewhat slow. We're already working on resolving these issues.
            </div>
          </div>
          <div className="row end-xs">
            <div className="col-xs-12">
              <FlatButton label="Alright, I forgive you" primary={true}
                          onClick={this.onHideDialog}/>
            </div>
          </div>
        </Dialog>
        <RouteHandler/>
      </div>
    );
  },

  onHideDialog() {
    localStorage.setItem('sawMobileInfo', true);
    this.refs.mobileDialog.dismiss();
  }

});

export default Layout;
