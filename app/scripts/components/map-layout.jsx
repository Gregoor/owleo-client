let React = require('react');
let Router = require('react-router');
let Reflux = require('reflux');

let {FloatingActionButton} = require('material-ui');

let ConceptActions = require('../actions/concept-actions');
let MapActions = require('../actions/map-actions');
let conceptStore = require('../stores/concept-store');
let userStore = require('../stores/user-store');

let VisMap = require('./vis-map');
let D3Map = require('./d3-map');
let ConceptInfo = require('./concept-info/concept-info');

let MapLayout = React.createClass({

  mixins: [
	  Reflux.ListenerMixin,
	  Reflux.connect(userStore, 'user'),
	  Router.State,
	  Router.Navigation
  ],

  getInitialState() {
    return {editMode: false};
  },

  componentWillMount() {
	  this.onRoute();
	  Router.HashLocation.addChangeListener(this.onRoute);
	  this.listenTo(conceptStore, (concepts) => {
		  let path = '/';
		  let selectedConcept = concepts.selected;
		  if (selectedConcept) {
			  if (selectedConcept.isNew) path += 'new';
			  else path += encodeURIComponent(selectedConcept.name);
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
    let conceptInfo, conceptName;
    let selectedConcept = this.state.selectedConcept;
    if (selectedConcept) {
      conceptInfo = <ConceptInfo concept={selectedConcept}
                                 editMode={this.state.editMode}/>;
    }

	  let actions;
	  if (this.state.editMode) {
		  actions = [
			  (
				  <div className="center-xs">
					  <FloatingActionButton onClick={this.onSwitchEdit}
					                        secondary={true} mini={true}
					                        iconClassName="icon icon-eye"/>
				  </div>
			  ),
			  (
				  <div className="center-xs">
					  <FloatingActionButton onClick={this.onUnlockPositions}
					                        secondary={true} mini={true}
					                        iconClassName="icon icon-unlocked"/>
			    </div>
			  ),
			  (
				  <div className="center-xs">
				  <FloatingActionButton onClick={this.onSavePositions}
				                        secondary={true} mini={true}
				                        iconClassName="icon icon-floppy-disk"/>
				  </div>
			  ),
			  (
				  <div className="center-xs">
					  <FloatingActionButton className="add-concept" onClick={this.onNew}
					                        iconClassName="icon icon-plus"/>
				  </div>
			  )
		  ];
	  } else {
		  actions = (
			  <div className="center-xs">
				  <FloatingActionButton onClick={this.onSwitchEdit}
				                        iconClassName="icon icon-pencil"/>
			  </div>
		  );
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
		let name = this.getParams().conceptName;
		if (name) {
			if (name == 'new') ConceptActions.new();
			else ConceptActions.select(name);
		} else ConceptActions.unselect();
	},

	onSwitchEdit() {
		this.setState({'editMode': !this.state.editMode});
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

export default MapLayout;
