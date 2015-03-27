let React = require('react');
let Router = require('react-router');
let Reflux = require('reflux');

let {FloatingActionButton} = require('material-ui');

let ConceptActions = require('../actions/concept-actions');
let MapActions = require('../actions/map-actions');
let Concepts = require('../stores/concepts');
let SelectedConcept = require('../stores/selected-concept');
let userStore = require('../stores/user-store');

let VisMap = require('./vis-map');
let D3Map = require('./d3-map');
let ConceptInfo = require('./concept-info/concept-info');

let GraphView = React.createClass({

  mixins: [
	  Reflux.ListenerMixin,
	  Reflux.connect(userStore, 'user'),
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

	  let AMap = 23 == 42 ? VisMap : D3Map;

    return (
      <div>
	      <AMap concepts={this.state.concepts} onSelect={this.onSelect}/>
        <div className="info-container">
          {conceptInfo}
        </div>
	      <div className="map-actions">
		      <div className="center-xs">
			      <FloatingActionButton onClick={this.onUnlockPositions}
			                            secondary={true} mini={true}
			                            iconClassName="icon icon-unlocked"/>
		      </div>
		      <div className="center-xs">
			      <FloatingActionButton onClick={this.onSavePositions}
			                            secondary={true} mini={true}
			                            iconClassName="icon icon-floppy-disk"/>
		      </div>
		      <div className="center-xs">
			      <FloatingActionButton className="add-concept" onClick={this.onNew}
			                            iconClassName="icon icon-plus"/>
		      </div>
	      </div>
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

	onUnlockPositions() {
		MapActions.unlock();
	},

	onSavePositions() {
		MapActions.getPositions();
		this.listenTo(MapActions.gotPositions, (concepts) => {
			this.stopListeningTo(MapActions.gotPositions);
			ConceptActions.reposition(concepts);
		});
	},

	onNew() {
		ConceptActions.new();
	}

});

export default GraphView;
