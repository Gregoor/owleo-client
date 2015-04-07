let React = require('react');
let Router = require('react-router');
let Reflux = require('reflux');

let ConceptActions = require('../actions/concept-actions');
let MapActions = require('../actions/map-actions');
let conceptStore = require('../stores/concept-store');
let userStore = require('../stores/user-store');

let VisMap = require('./vis-map');
let D3Map = require('./d3-map');
let Search = require('./search');
let ConceptInfo = require('./concept-info/concept-info');
let MapFab = require('./map-fab');

let MapLayout = React.createClass({

  mixins: [
	  Reflux.ListenerMixin,
	  Reflux.connect(userStore, 'user'),
	  Router.State,
	  Router.Navigation
  ],

  getInitialState() {
    return {'editMode': false, 'isLocked': true};
  },

  componentWillMount() {
	  this.onRoute();
	  Router.HashLocation.addChangeListener(this.onRoute);
	  this.listenTo(conceptStore, (concepts) => {
		  let path = '/';
		  let selectedConcept = concepts.selected;
		  if (selectedConcept) {
			  if (selectedConcept.isNew) path += 'new';
			  else path += selectedConcept.id;
		  }
		  this.transitionTo(path);
		  this.setState({selectedConcept, 'concepts': concepts.all});
	  });

	  ConceptActions.getAll();
  },

  render() {
    let conceptInfo;
    let selectedConcept = this.state.selectedConcept;
    if (selectedConcept) {
      conceptInfo = <ConceptInfo concept={selectedConcept}
                                 editMode={this.state.editMode}/>;
    }

	  let actions;
	  if (this.state.editMode) {
		  let {isLocked} = this.state;
		  actions = [
			  (
				  <MapFab title="Leave edit mode" secondary={true} icon="eye"
				          onClick={this.onSwitchEdit}/>
			  ),
			  (
				  <MapFab title={isLocked ? 'Unlock' : 'Lock'}
				          secondary={true} icon={isLocked ? 'unlocked' : 'lock'}
				          onClick={isLocked ? this.onUnlock : this.onLock}/>
			  ),
			  (<MapFab title="Add Concept" icon="plus" onClick={this.onNew}/>)
		  ];
	  } else {
		  actions = (
			  <MapFab title="Edit mode" icon="pencil" onClick={this.onSwitchEdit}/>
		  );
	  }

	  let AMap = this.state.editMode ? VisMap : D3Map;

    return (
      <div>
	      <AMap concepts={this.state.concepts}
	            selectedConcept={selectedConcept}
							focusedConceptId={this.state.focusedConceptId}
							onSelect={this.onSelect}/>
        <div className="info-container">
	        <Search onSelect={this.onSearchSelect}/>
          {conceptInfo}
        </div>
	      <div className="map-actions">
		      {actions}
	      </div>
      </div>);
  },

	onRoute() {
		let id = this.getParams().conceptId;
		if (id) {
			if (id == 'new') ConceptActions.new();
			else ConceptActions.select(id);
		} else ConceptActions.unselect();
	},

	onSwitchEdit() {
		this.setState({'editMode': !this.state.editMode});
	},

	onSelect(id) {
	  if (id !== undefined) ConceptActions.select(id);
	  else ConceptActions.unselect();
  },

	onSearchSelect(id) {
		this.onSelect(id);
		this.setState({'focusedConceptId': id});
	},

	onUnlock() {
		this.setState({'isLocked': false});
		MapActions.unlock();
	},

	onLock() {
		this.setState({'isLocked': true});
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

export default MapLayout;
