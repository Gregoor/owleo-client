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
		  let path = '/';
		  if (concept) {
			  if (concept.isNew) path += 'new';
			  else path += encodeURIComponent(concept.name);
		  }
		  this.transitionTo(path);
		  this.setState({'selectedConcept': concept});
	  });

	  ConceptActions.getAll();
	  this.listenTo(Concepts, (concepts) => this.setState({concepts}));
  },

  render() {
    let conceptInfo = '';
    let selectedConcept = this.state.selectedConcept;
    if (selectedConcept) {
      conceptInfo = <ConceptInfo concept={selectedConcept}/>;
    }

    return (
      <div>
        <Graph concepts={this.state.concepts} onSelect={this.onSelect}/>
        <div className="info-container">
          {conceptInfo}
        </div>
	      <FloatingActionButton className="add-concept" onClick={this.onNew}
	                            iconClassName="icon icon-plus"/>
      </div>);
  },

	onRoute() {
		let name = this.getParams().conceptName;
		if (name) {
			if (name == 'new') ConceptActions.new();
			else ConceptActions.select(name);
		} else ConceptActions.unselect();
	},

	onSelect(name) {
	  if (name !== undefined) ConceptActions.select(name);
	  else ConceptActions.unselect();
  },

	onNew() {
		ConceptActions.new();
	}

});

export default GraphView;
