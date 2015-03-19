let React = require('react');
let Reflux = require('reflux');

let vis = require('vis');
let _ = require('lodash');

let VIS_CONFIG = require('../configs/vis');
let ConceptActions = require('../actions/concept-actions');

let Graph = React.createClass({

	mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {'connectMode': false};
  },

  componentDidMount() {
    let self = this, node = this.getDOMNode();
    let nw = this.network = new vis.Network(node, {}, _.extend(VIS_CONFIG, {
      'onConnect': (data, callback) => {
        self.setState({'connectMode': false});
        self.props.onConnect(data);
        callback(data);
      },
      'onDelete': (data, callback) => {
        var id = data.nodes[0], edgeId = data.edges[0];

        if (!confirm('Ya sure?')) return;

        if (id) ConceptActions.delete(id);
        else self.props.onDisconnect(network.edges[edgeId]);

        callback(data);
      }
    }));

    nw.on('select', (selected) => {
      var id = selected.nodes[0];
      if (!self.state.connectMode) self.props.onSelect(id);
    });

    window.addEventListener('resize', () => { self.network.redraw(); });

	  let addEdgesFor = (concept) => {
		  for (let req of concept.reqs) {
			  let id = `${req}-${concept.id}`;
			  if (!nw.edgesData.get(id)) {
				  nw.edgesData.add({id, 'from': req, 'to': concept.id});
			  }
		  }
	  };

	  this.listenTo(ConceptActions.created, (concept) => {
		  nw.nodesData.add(_.extend(
			  {'label': concept.name, 'allowedToMoveX': true, 'allowedToMoveY': true},
			  concept,
			  nw.getCenterCoordinates()
		  ));
		  nw.moving = true;
		  nw.start();

		  addEdgesFor(concept);
	  });

	  this.listenTo(ConceptActions.selected, (id) => {
		   nw.selectNodes(id ? [id] : []);
	  });

	  this.listenTo(ConceptActions.updated, (concept) => {
		  nw.nodesData.update({'id': concept.id, 'label': concept.name})
		  for (let edge of nw.edgesData.get()) {
			  let [from, to] = edge.id.split('-');
			  if (to == concept.id && !_.includes(concept.reqs, from)) {
				  nw.edgesData.remove(edge.id);
			  }
		  }

		  addEdgesFor(concept);
	  });

	  this.listenTo(ConceptActions.deleted, (id) => {
		  nw.nodesData.remove(id);
		  nw.moving = true;
		  nw.start();
	  });
  },

  componentWillUpdate(props) {
    if (this.props.concepts || !this.network || !props.concepts) return;

    let nodes = [], edges = [];

    props.concepts.forEach((concept) => {
      if (!concept.name) return;
      let label = _.reduce(concept.name.split(' '), function(str, word) {
        let parts = str.split('\n'), lastPart = parts[parts.length - 1];

        return str +
          (lastPart.length > 0 && lastPart.length + word.length > 20 ?
            '\n' :
            ' '
          ) +
          word;
      }, '');
      let node = {'id': concept.id, label};

      if (concept.edges !== undefined) _.extend(node, {
        'radius': 10 + .1 * concept.edges,
        'mass': 1 + .1 * concept.edges
      });

      nodes.push(node);

	    let id = concept.id;
      concept.reqs.forEach((req) => {
	      return edges.push({'id': `${req}-${id}`,'from': req, 'to': id});
      });
    });

    this.network.setData({nodes, edges});
  },

  render() {
    return (<div className="vis-map"></div>);
  }
});

export default Graph;
