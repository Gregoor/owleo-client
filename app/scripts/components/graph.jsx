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
        else return;

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
			  let id = this.edgeIDFor(concept.name, req);
			  if (!nw.edgesData.get(id)) {
				  nw.edgesData.add({id, 'from': req, 'to': concept.name});
			  }
		  }
	  };

	  this.listenTo(ConceptActions.created, (concept) => {
		  nw.nodesData.add(_.extend({
			  'id': concept.name,
			  'label': concept.name,
			  'allowedToMoveX': true,
			  'allowedToMoveY': true},
			  concept,
			  nw.getCenterCoordinates()
		  ));
		  nw.moving = true;
		  nw.start();

		  addEdgesFor(concept);
	  });

	  this.listenTo(ConceptActions.selected, (name) => {
		   nw.selectNodes(name ? [name] : []);
	  });

	  this.listenTo(ConceptActions.updated, (concept) => {
		  let id, label;
		  id = label = concept.name;
		  nw.nodesData.update({id, label})
		  for (let edge of nw.edgesData.get()) {
			  let [from, to] = edge.id.split('>');
			  if (decodeURIComponent(to) == concept.name && !_.find(concept.reqs, (req) => {
				  return req == decodeURIComponent(from);
			  })) {
				  nw.edgesData.remove(edge.id);
			  }
		  }

		  addEdgesFor(concept);
	  });

	  this.listenTo(ConceptActions.deleted, (name) => {
		  nw.nodesData.remove(name);
		  nw.moving = true;
		  nw.start();
	  });
  },

  componentWillUpdate(props) {
    if (this.props.concepts || !this.network || !props.concepts) return;
	  let self = this;

    let nodes = [], edges = [];

    props.concepts.forEach((concept) => {
      if (!concept.name) return;
	    let name = concept.name;
      let label = _.reduce(name.split(' '), function(str, word) {
        let parts = str.split('\n'), lastPart = parts[parts.length - 1];

        return str +
          (lastPart.length > 0 && lastPart.length + word.length > 20 ?
            '\n' :
            ' '
          ) +
          word;
      }, '');
      let node = {'id': name, label};

      if (concept.edges !== undefined) _.extend(node, {
        'radius': 10 + .1 * concept.edges,
        'mass': 1 + .1 * concept.edges
      });

      nodes.push(node);
      concept.reqs.forEach((req) => {
	      return edges.push({
		      'id': self.edgeIDFor(name, req),
		      'from': req,
		      'to': name
	      });
      });
    });

    this.network.setData({nodes, edges});
  },

	edgeIDFor(name, reqName) {
		let encName = encodeURIComponent(name);
		let encReq = encodeURIComponent(reqName);
		return `${encReq}>${encName}`;
	},

  render() {
    return (<div className="vis-map"></div>);
  }
});

export default Graph;
