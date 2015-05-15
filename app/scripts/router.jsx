import React from 'react';
import Router from 'react-router';

import Layout from './components/layout';
import MapLayout from './components/map-layout';
import AuthDialog from './components/auth-dialog';

let {Route, DefaultRoute} = Router;

let routes = (
	<Route handler={Layout}>
		<Route path="/" handler={MapLayout}>
			<Route path="login" handler={AuthDialog}/>
			<Route path=":conceptId"/>
		</Route>
	</Route>
);

exports.start = () => {
  Router.run(routes, Handler => {
		React.render(<Handler/>, document.getElementById('content'));
	});
};
