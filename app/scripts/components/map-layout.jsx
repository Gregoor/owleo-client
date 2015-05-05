let React = require('react');
let Router = require('react-router');
let Reflux = require('reflux');

let ConceptActions = require('../actions/concept-actions');
let conceptStore = require('../stores/concept-store');
let userStore = require('../stores/user-store');

let GraphMap = require('./graph-map');
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
		return {'isLocked': true};
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
		let {isLocked, selectedConcept} = this.state;

		if (selectedConcept) {
			conceptInfo = <ConceptInfo concept={selectedConcept}/>;
		}

		return (
			<div>
				<GraphMap concepts={this.state.concepts}
									physical={!isLocked}
									selectedConceptId={selectedConcept ? selectedConcept.id : ''}
									focusedConceptId={this.state.focusedConceptId}
									onSelect={this.onSelect}/>

				<div className="info-container">
					<Search onSelect={this.onSearchSelect}/>
					{conceptInfo}
				</div>
				<div className="map-actions">
					<MapFab key="lock" title={isLocked ? 'Unlock' : 'Lock'}
									secondary={true} icon={isLocked ? 'unlocked' : 'lock'}
									onClick={isLocked ? this.onUnlock : this.onLock}/>
					<MapFab key="add" title="Add Concept" icon="plus"
									onClick={this.onNew}/>
				</div>
			</div>);
	},

	onRoute(e) {
		let id = this.getParams().conceptId;
		if (id) {
			if (id == 'new') ConceptActions.new();
			else ConceptActions.select(id);

			if (!e || e.type != 'push') this.setState({'focusedConceptId': id});

		} else ConceptActions.unselect();
	},

	onSelect(id) {
		if (id !== undefined) ConceptActions.select(id);
		else {
			ConceptActions.unselect();
			this.setState({'focusedConceptId': null});
		}
	},

	onSearchSelect(id) {
		this.onSelect(id);
		this.setState({'focusedConceptId': id});
	},

	onUnlock() {
		this.setState({'isLocked': false});
	},

	onLock() {
		this.setState({'isLocked': true});
		ConceptActions.reposition();
	},

	onNew() {
		ConceptActions.new();
	}

});

export default MapLayout;
