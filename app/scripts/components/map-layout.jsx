import React from 'react';
import Router from 'react-router';
import Reflux from 'reflux';

import searchAPI from '../api/search-api';
import ConceptActions from '../actions/concept-actions';
import conceptStore from '../stores/concept-store';
import userStore from '../stores/user-store';

import GraphMap from './graph-map';
import Search from './search';
import ConceptInfo from './concept-info/concept-info';
import MapFab from './map-fab';
import UserPanel from './user-panel';

let {RouteHandler} = Router;

let MapLayout = React.createClass({

  mixins: [
    Reflux.ListenerMixin,
    Reflux.connect(userStore, 'user'),
    Router.State,
    Router.Navigation
  ],

  getInitialState() {
    return {'isLocked': true, 'filter': {}, 'user': {}};
  },

  componentWillMount() {
    this.onRoute();
    Router.HashLocation.addChangeListener(this.onRoute);
    this.listenTo(conceptStore, concepts => {
      let selectedConcept = concepts.selected;
      if (this.getPath() != '/login') {
        let path = '/';
        if (selectedConcept) {
          if (selectedConcept.isNew) path += 'new';
          else path += selectedConcept.id;
        }
        this.transitionTo(path);
      }
      this.setState({selectedConcept, 'concepts': concepts.all});
    });

    ConceptActions.getAll();
  },

  render() {
    let conceptInfo;
    let {concepts, focusedConceptId, filter,
      isLocked, selectedConcept, user} = this.state;

    if (selectedConcept) {
      conceptInfo = <ConceptInfo concept={selectedConcept}
                                 user={user}
                                 editMode={user.admin}/>;
    }

    let actionsHTML;
    if (user.admin) actionsHTML = [
      <MapFab key="lock" title={isLocked ? 'Unlock' : 'Lock'}
              secondary={true} icon={isLocked ? 'unlocked' : 'lock'}
              onClick={isLocked ? this.onUnlock : this.onLock}/>,
      <MapFab key="add" title="Add Concept" icon="plus"
              onClick={this.onNew}/>
    ];

    return (
      <div>
        <RouteHandler/>
        <GraphMap concepts={concepts}
                  physical={!isLocked}
                  selectedConceptId={selectedConcept ? selectedConcept.id : ''}
                  focusedConceptId={focusedConceptId}
                  filter={filter}
                  onSelect={this.onSelect}/>

        <div className="info-container">
          <Search onSelect={this.onSearchSelect}
                  onFocus={this.onSelect.bind(this, undefined)}/>
          {conceptInfo}
        </div>
        <UserPanel className="uesr" user={user} onLogout={this.onLogout}/>

        <div className="map-actions">
          {actionsHTML}
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

  onSearchSelect(selected) {
    switch (selected.type) {
      case 'Concept':
        let id = selected.value;
        this.onSelect(id);
        this.setState({'focusedConceptId': id});
        break;
      case 'Tag':
        let tags = [selected.value];
        searchAPI({'for': ['Concept'], tags}).then(result => {
          this.setState({'filter': {'tags': result}});
        });
        break
    }
  },

  onLogout() {
    userStore.logout();
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
