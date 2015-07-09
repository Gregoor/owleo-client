import React from 'react';
import _ from 'lodash';
import {IconButton, TextField, Checkbox, FlatButton} from 'material-ui';

import ConceptActions from '../../actions/concept-actions';
import nameAndContainer from '../helpers/nameAndContainer';
import shortenUrl from '../helpers/shorten-url';

let ConceptView = React.createClass({

  render() {
    let {concept, editMode} = this.props;

    let editActions;
    if (editMode) editActions = [
      (
        <div className="col-xs-1.5">
          <IconButton key="edit" iconClassName="icon icon-pencil"
                      tooltip="Edit" onClick={this.props.onEdit}/>
        </div>
      ),
      (
        <div className="col-xs-1.5">
          <IconButton key="delete" iconClassName="icon icon-bin"
                      tooltip="Delete" onClick={this.onDelete}/>
        </div>
      )
    ];

    let {fetching, container, summarySource} = concept;

    let containerHTML;
    if (container && container.id) containerHTML = (
      <div className="row">
        <div className="col-xs-1">
          in
        </div>
        <div className="col-xs-11">
          {container.name}
        </div>
      </div>
    );

    let summarySourceRow;
    if (summarySource) {
      summarySourceRow = (
        <div className="row">
          <div className="col-xs-12" style={{'display': 'inline'}}>
            <h2>Source:</h2>
            <a className="link" target="_blank" href={summarySource}>
              {shortenUrl(summarySource)}
            </a>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="row end-xs">
          {editActions} </div>

        <div className="scroll">
          <div className="row center-xs">
            <div className="col-xs-3">
              <IconButton iconClassName="icon icon-arrow-left"
                          style={{paddingBottom: 1}}
                          disabled={fetching || !concept.reqs.length}
                          onClick={this.onSearchFor('leadsTo')}/>
              <br/>
              <span className="center-xs" style={{fontSize: 9}}>
										REQUIREMENTS
									</span>
            </div>
            <div className="col-xs-6">
              <div style={{'font-size': '18px', 'font-weight': 'bold'}}>
                {concept.name}
              </div>
              {containerHTML}
            </div>
            <div className="col-xs-3">
              <IconButton iconClassName="icon icon-arrow-right"
                          disabled={!concept.followupCount}
                          style={{paddingBottom: 1}}
                          onClick={this.onSearchFor('reqBy')}/>
              <br/>
              <span className="center-xs" style={{fontSize: 9}}>
									FOLLOWUPS
							</span>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 summary"
                 style={{'display': 'inline', 'white-space': 'pre'}}>
              {fetching ? 'Loading...' : concept.summary}
            </div>
          </div>
          {summarySourceRow}
        </div>
      </div>
    );
  },

  onDelete() {
    if (!confirm('Ya sure?')) return;

    ConceptActions.delete(this.props.concept.id);
  },

  onSearchFor(param) {
    return () => this.props.onSearch(param);
  }

});

export default ConceptView;
