let React = require('react');
let Reflux = require('reflux');

let ConceptActions = require('../actions/concept-actions');
let Concepts = require('../stores/concepts');
let SelectedConcept = require('../stores/selected-concept');

let Graph = require('./graph');
let ConceptInfo = require('./concept-info/concept-info');

let GraphView = React.createClass({

  mixins: [Reflux.ListenerMixin],

  getInitialState() {
    return {};
  },

  componentWillMount() {
    ConceptActions.getAll();
    this.listenTo(Concepts, (concepts) => this.setState({concepts}));
    this.listenTo(SelectedConcept, (concept) => this.setState({
      'selectedConcept': concept
    }));
  },

  render() {
    let concept = '';
    let selectedConcept = this.state.selectedConcept;
    if (selectedConcept) {
      concept = <ConceptInfo concept={selectedConcept}/>;
    }

    return (
      <div>
        <Graph concepts={this.state.concepts}
               onSelect={this.onSelect}
               onConnect={alert}
               onDelete={alert}
               onDisconnect={alert}/>
        <div className="info-container">
          {concept}
        </div>
      </div>);
  },

  onSelect(id) {
	  if (id !== undefined) ConceptActions.select(id);
	  else ConceptActions.unselect();
  }

});

export default GraphView;
