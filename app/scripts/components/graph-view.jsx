let React = require('react');
let Router = require('react-router');
let Reflux = require('reflux');

let {FloatingActionButton} = require('material-ui');

let ConceptActions = require('../actions/concept-actions');
let Concepts = require('../stores/concepts');
let SelectedConcept = require('../stores/selected-concept');

let Graph = require('./graph');
let ConceptInfo = require('./concept-info/concept-info');

let GraphView = React.createClass({

  mixins: [
	  Reflux.ListenerMixin,
	  Router.State,
	  Router.Navigation
  ],

  getInitialState() {
    return {};
  },

  componentWillMount() {
	  this.onRoute();
	  Router.HashLocation.addChangeListener(this.onRoute);
	  this.listenTo(SelectedConcept, (concept) => {
		  this.transitionTo(concept ? '/' + encodeURIComponent(concept.name) : '/');
		  this.setState({'selectedConcept': concept});
	  });

	  ConceptActions.getAll();
	  this.listenTo(Concepts, (concepts) => this.setState({concepts}));
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
	      <FloatingActionButton className="add-concept" onClick={this.onNew}
	                            iconClassName="icon icon-plus"/>
      </div>);
  },

	onRoute() {
		let name = this.getParams().conceptName;
		if (name) ConceptActions.select(name);
		else ConceptActions.unselect();
	},

	onSelect(id) {
	  if (id !== undefined) ConceptActions.select(id);
	  else ConceptActions.unselect();
  },

	onNew() {
		ConceptActions.new();
	}

});

export default GraphView;
