let React = require('react');
let Router = require('react-router');
let Route = Router.Route;
let DefaultRoute = Router.DefaultRoute;

let Layout = require('./components/layout');
let MapLayout = require('./components/map-layout');

let routes = (
	<Route handler={Layout}>
		<Route path=":conceptId" handler={MapLayout}/>
		<DefaultRoute handler={MapLayout} />
	</Route>
);

exports.start = () => {
  Router.run(routes, (Handler) => {
		React.render(<Handler />, document.getElementById('content'));
	});
};
