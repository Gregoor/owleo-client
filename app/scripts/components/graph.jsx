let React = require('react');
let Reflux = require('reflux');

let vis = require('vis');
let _ = require('lodash');

let VIS_CONFIG = require('../configs/vis');

let Graph = React.createClass({

  getInitialState() {
    return {'connectMode': false};
  },

  componentDidMount() {
    var self = this;
    this.network = new vis.Network(this.getDOMNode(), {}, _.extend(VIS_CONFIG, {
      'onConnect': (data, callback) => {
        self.setState({'connectMode': false});
        self.props.onConnect(data);
        callback(data);
      },
      'onDelete': (data, callback) => {
        var id = data.nodes[0], edgeId = data.edges[0];

        if (!confirm('Ya sure?')) return;

        if (id) self.props.onDelete(id);
        else self.props.onDisconnect(network.edges[edgeId]);

        callback(data);
      }
    }));

    this.network.on('select', (selected) => {
      var id = selected.nodes[0];
      if (!self.state.connectMode) self.props.onSelect(id);
    });

    window.addEventListener('resize', () => { self.network.redraw(); });
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

      concept.reqs.forEach((req) => edges.push({'from': req, 'to': concept.id}));
    });

    this.network.setData({nodes, edges});
  },

  render() {
    return (<div className="vis-map"></div>);
  }
});

export default Graph;
