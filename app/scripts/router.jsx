let React = require('react');
let Router = require('react-router');
let Route = Router.Route;
let DefaultRoute = Router.DefaultRoute;

let Layout = require('./components/layout');
let GraphView = require('./components/graph-view');

let routes = (
	<Route handler={Layout}>
		<Route path=":conceptName" handler={GraphView}/>
		<DefaultRoute handler={GraphView} />
	</Route>
);

exports.start = () => {
  Router.run(routes, (Handler) => {
		React.render(<Handler />, document.getElementById('content'));
	});
};
