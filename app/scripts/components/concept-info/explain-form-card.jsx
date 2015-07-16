import React from 'react';
import Radium from 'radium';
import {RaisedButton, Toolbar, ToolbarSeparator, Checkbox, IconButton}
  from 'material-ui';
import Quill from 'quill';

import ExplanationActions from '../../actions/explanation-actions';
import shortenUrl from '../helpers/shorten-url';

let editorBorder = '1px solid #ccc';

let ExplainFormCard = Radium(React.createClass({

  componentDidMount() {
    this.quill = new Quill(this.refs.editor.getDOMNode(), {
      'modules': {'toolbar': {'container': this.refs.toolbar.getDOMNode()}}
    });
  },

  render() {
      return (
        <form className="card" onSubmit={this.onCreate}>
          <div className="row middle-xs">
            <div className="col-xs-12">
              <div style={{'border': editorBorder}}>
                <div ref="toolbar" style={{'borderBottom': editorBorder}}>
                  <IconButton className="ql-bold"
                              iconClassName="icon icon-bold"/>
                  <IconButton className="ql-italic"
                              iconClassName="icon icon-italic"/>
                  <IconButton className="ql-underline"
                              iconClassName="icon icon-underline"/>
                  <IconButton className="ql-list"
                              iconClassName="icon icon-list-numbered"/>
                  <IconButton className="ql-bullet"
                              iconClassName="icon icon-list"/>
                </div>
                <div ref="editor"/>
              </div>
            </div>
          </div>
          <br/>
          <div className="row middle-xs">
            <div className="col-xs-10">
              <Checkbox ref="paywalled" label="paywalled"/>
            </div>
            <div className="col-xs-2">
              <RaisedButton type="submit" label="Add" primary={true}/>
            </div>
          </div>
        </form>
      );
  },


  onCreate(event) {
    event.preventDefault();
    let {paywalled} = this.refs;
    ExplanationActions.create({
      'content': this.quill.getHTML(),
      'paywalled': paywalled.isChecked()
    });
    this.quill.setText('');
    paywalled.setChecked(false);
  }


}));

export default ExplainFormCard;
