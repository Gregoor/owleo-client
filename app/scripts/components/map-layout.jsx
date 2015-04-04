let React = require('react');
let Router = require('react-router');
let Reflux = require('reflux');

let ConceptActions = require('../actions/concept-actions');
let MapActions = require('../actions/map-actions');
let conceptStore = require('../stores/concept-store');
let userStore = require('../stores/user-store');

let VisMap = require('./vis-map');
let D3Map = require('./d3-map');
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

	  window.addEventListener('keydown', (e) => {
		  if (e.keyCode == 27/*ESC*/) ConceptActions.unselect();
	  });
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
			  (<MapFab onClick={this.onSwitchEdit} secondary={true} icon="eye"/>),
			  (
				  <MapFab onClick={isLocked ? this.onUnlock : this.onLock}
				          secondary={true}
				          icon={isLocked ? 'unlocked' : 'lock'}/>
			  ),
			  (<MapFab onClick={this.onNew} icon="plus"/>)
		  ];
	  } else {
		  actions = (<MapFab onClick={this.onSwitchEdit} icon="pencil"/>)
	  }

	  let AMap = this.state.editMode ? VisMap : D3Map;

    return (
      <div>
	      <AMap concepts={this.state.concepts} onSelect={this.onSelect}
	            selectedConcept={selectedConcept}/>
        <div className="info-container">
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

	onSelect(name) {
	  if (name !== undefined) ConceptActions.select(name);
	  else ConceptActions.unselect();
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
