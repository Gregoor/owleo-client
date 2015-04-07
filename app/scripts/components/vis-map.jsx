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
    let self = this,
	      node = this.getDOMNode();
    this.network = new vis.Network(node, {}, _.extend(VIS_CONFIG, {
      'onConnect': (data, callback) => {
        self.setState({'connectMode': false});
        self.props.onConnect(data);
        callback(data);
      },
      'onDelete': (a, b) => {}
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
				let id = selectedConcept.id;
				this.network.selectNodes(id ? [id] : []);
			}, 500);
		}
  },

	fillNetwork(concepts) {
		let nodes = [],
				edges = [];

		concepts.forEach((concept) => {
			let {id, name} = concept;
			if (!name) return;
			let label = _.reduce(name.split(' '), function(str, word) {
				let parts = str.split('\n'),
					  lastPart = parts[parts.length - 1];

				return str +
					(lastPart.length > 0 && lastPart.length + word.length > 20 ?
						'\n' :
						' '
					) +
					word;
			}, '');
			let node = _.extend({id, label}, {
				'x': concept.x || undefined,
				'y': concept.y || undefined,
				'color': {
					'background': concept.color || 'lightgrey'
				}
			});

			if (concept.edges !== undefined) _.extend(node, {
				'radius': 10 + .1 * concept.edges,
				'mass': 1 + .1 * concept.edges
			});

			nodes.push(node);
			concept.reqs.forEach((reqId) => {
				return edges.push({
					'id': this.reqEdgeIDFor(concept, reqId),
					'from': reqId,
					'to': id
				});
			});

			let containerId = concept.container;
			if (containerId) edges.push(this.containerEdgeFor(id, containerId));
		});

		this.network.setData({nodes, edges});
	},

	onCreated(concept) {
		this.network.nodesData.add(_.extend({
				'label': concept.name,
				'allowedToMoveX': true,
				'allowedToMoveY': true},
			concept,
			this.network.getCenterCoordinates()
		));

		this.addEdgesFor(concept);
	},

	onUpdated(concept) {
		let {id, reqs, container} = concept;

		this.network.nodesData.update({id, 'label': concept.name});

		let inReqs = findId => _.find(reqs, req => req.id == findId);

		for (let edge of this.network.edgesData.get()) {
			let shouldDelete = false;
			if (edge.id.indexOf('>') !== -1) {
				let [from, to] = edge.id.split('>');
				shouldDelete = to == id && !inReqs(from);
			} else {
				let [from, to] = edge.id.split(':');
				shouldDelete = to == id && (container && container.id == from);
			}
			if (shouldDelete) this.network.edgesData.remove(edge.id);
		}

		this.addEdgesFor(concept);
	},

	onDeleted(id) {
		this.network.nodesData.remove(id);
	},

	onGetPositions() {
		let nodes = _.map(this.network.getPositions(), (pos, id) => ({id, pos}));

		this.network.nodesData.update(nodes.map((n) => _.extend({
			'allowedToMoveX': false,
			'allowedToMoveY': false
		}, n)));
		MapActions.gotPositions(nodes);
	},

	onUnlock() {
		this.network.nodesData.update(this.network.nodesData.map(function(node) {
			node.allowedToMoveX = node.allowedToMoveY = true;
			return node;
		}));
	},

	addEdgesFor(concept) {
		let {id, container, reqs} = concept;

		if (container && container.id) this.network.edgesData.add(
			this.containerEdgeFor(id, container.id)
		);

		for (let req of reqs) {
			let edgeId = this.reqEdgeIDFor(concept, req.id);
			if (!this.network.edgesData.get(edgeId)) this.network.edgesData.add(
				{'id': edgeId, 'from': req.id, 'to': id}
			);
		}
	},

	containerEdgeFor(id, containerId) {
		return {
			'id': this.containEdgeIDFor(id, containerId),
			'from': containerId,
			'to': id,
			'color': '#f1c40f',
			'width': 1.5,
			'length': 50
		}
	},

	reqEdgeIDFor(concept, reqId) {
		return `${reqId}>${concept.id || concept}`;
	},

	containEdgeIDFor(concept, containerId) {
		return `${containerId}:${concept.id || concept}`;
	},

  render() {
    return (<div className="map"></div>);
  }

});

export default Graph;
