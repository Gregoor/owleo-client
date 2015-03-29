let React = require('react');
let Reflux = require('reflux');

let vis = require('vis');
let _ = require('lodash');

let VIS_CONFIG = require('../configs/vis');
let ConceptActions = require('../actions/concept-actions');
let MapActions = require('../actions/map-actions');

let Graph = React.createClass({

	mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {'connectMode': false};
  },

  componentDidMount() {
    let self = this, node = this.getDOMNode();
    this.network = new vis.Network(node, {}, _.extend(VIS_CONFIG, {
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

	  this.network.on('select', (selected) => {
      var id = selected.nodes[0];
      if (!self.state.connectMode) self.props.onSelect(id);
    });

    window.addEventListener('resize', () => { self.network.redraw(); });

	  this.listenToMany(ConceptActions);
	  this.listenToMany(MapActions);

	  let concepts = this.props.concepts;
	  if (concepts) this.fillNetwork(concepts);
  },

  componentWillReceiveProps(props) {
	  let {concepts, selectedConcept} = props;

	  if (!this.props.concepts && this.network && concepts) {
		  this.fillNetwork(concepts);
	  }

		if (selectedConcept && this.network.nodesData.length) {
			setTimeout(() => {
				let name = selectedConcept.name;
				this.network.selectNodes(name ? [name] : []);
			}, 500);
		}
  },

	fillNetwork(concepts) {
		let nodes = [], edges = [];

		concepts.forEach((concept) => {
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
			let node = _.extend({'id': name, label}, {
				'x': concept.x || undefined,
				'y': concept.y || undefined
			});

			if (concept.edges !== undefined) _.extend(node, {
				'radius': 10 + .1 * concept.edges,
				'mass': 1 + .1 * concept.edges
			});

			nodes.push(node);
			concept.reqs.forEach((req) => {
				return edges.push({
					'id': this.edgeIDFor(name, req),
					'from': req,
					'to': name
				});
			});
		});

		this.network.setData({nodes, edges});
	},

	onCreated(concept) {
		this.network.nodesData.add(_.extend({
				'id': concept.name,
				'label': concept.name,
				'allowedToMoveX': true,
				'allowedToMoveY': true},
			concept,
			this.network.getCenterCoordinates()
		));

		this.addEdgesFor(concept);
		console.log('nuandready');
	},

	onUpdated(concept) {
		for (let edge of this.network.edgesData.get()) {
			let [from, to] = edge.id.split('>');
			if (decodeURIComponent(to) == concept.name && !_.find(concept.reqs, (req) => {
					return req == decodeURIComponent(from);
				})) {
				this.network.edgesData.remove(edge.id);
			}
		}

		this.addEdgesFor(concept);
	},

	onDeleted(name) {
		this.network.nodesData.remove(name);
	},

	onGetPositions() {
		let nodes = _.map(this.network.getPositions(), (pos, name) => {
			return _.extend(pos, {
				'id': name,
				'allowedToMoveX': false,
				'allowedToMoveY': false
			});
		});
		this.network.nodesData.update(nodes);
		MapActions.gotPositions(nodes);
	},

	onUnlock() {
		this.network.nodesData.update(this.network.nodesData.map(function(node) {
			node.allowedToMoveX = node.allowedToMoveY = true;
			return node;
		}));
	},

	addEdgesFor(concept) {
		for (let req of concept.reqs) {
			let id = this.edgeIDFor(concept.name, req);
			if (!this.network.edgesData.get(id)) {
				this.network.edgesData.add({id, 'from': req, 'to': concept.name});
			}
		}
	},

	edgeIDFor(name, reqName) {
		let encName = encodeURIComponent(name);
		let encReq = encodeURIComponent(reqName);
		return `${encReq}>${encName}`;
	},

  render() {
    return (<div className="map"></div>);
  }

});

export default Graph;
