import React from 'react';
import Router from 'react-router';

let {RouteHandler} = Router;

let Layout = React.createClass({
  render() {
    return (
      <div className="App">
        <RouteHandler/>
      </div>
    );
  }
});

export default Layout;
