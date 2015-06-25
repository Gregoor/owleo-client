import React from 'react';
import {FlatButton, TextField, Checkbox} from 'material-ui';

import ExplanationActions from '../../actions/explanation-actions';
import shortenUrl from '../helpers/shorten-url';

let ExplainFormCard = React.createClass({

  render() {
      return (
        <form className="card" onSubmit={this.onCreate}>
          <div className="row middle-xs">
            <div className="col-xs-12">
              <TextField ref="content" floatingLabelText="Add an Explanation"
                         multiLine={true}/>
            </div>
          </div>
          <div className="row middle-xs">
            <div className="col-xs-10">
              <Checkbox ref="paywalled" label="paywalled"/>
            </div>
            <div className="col-xs-2">
              <FlatButton type="submit" label="Add" primary={true}/>
            </div>
          </div>
        </form>
      );
  },


  onCreate(event) {
    event.preventDefault();
    let {content, paywalled} = this.refs;
    ExplanationActions.create({
      'content': content.getValue(),
      'paywalled': paywalled.isChecked()
    });
    content.setValue('');
    paywalled.setChecked(false);
  }


});

export default ExplainFormCard;
