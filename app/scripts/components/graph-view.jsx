let React = require('react');
let Reflux = require('reflux');

let ConceptActions = require('../actions/concept-actions');
let Concepts = require('../stores/concepts');
let Concept = require('../stores/concept');

let Graph = require('./graph');
let ConceptInfo = require('./concept-info');

let GraphView = React.createClass({

  mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {};
  },

  componentWillMount() {
    ConceptActions.getAll();
    this.listenTo(Concepts, (concepts) => this.setState({concepts}));
    this.listenTo(Concept, (concept) => this.setState({
      'selectedConcept': concept
    }));
  },

  render() {
    let conceptInfo = '';
    let selectedConcept = this.state.selectedConcept;
    if (selectedConcept) {
      conceptInfo = <ConceptInfo concept={selectedConcept}/>;
    }

    return (
      <div>
        <Graph concepts={this.state.concepts}
               onSelect={this.onSelect}
               onConnect={alert}
               onDelete={alert}
               onDisconnect={alert}/>
        <div className="info-container">
          {conceptInfo}
        </div>
      </div>);
  },

  onSelect(id) {
    ConceptActions.find(id);
  }

});

export default GraphView;
