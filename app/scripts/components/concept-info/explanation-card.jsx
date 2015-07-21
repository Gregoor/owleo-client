import React from 'react';
import {IconButton} from 'material-ui';

import ExplanationActions from '../../actions/explanation-actions';
import shortenUrl from '../helpers/shorten-url';

let ExplanationCard = React.createClass({

  render() {
    let {explanation, voteDisabled} = this.props;
    let {content, createdAt} = explanation;

    createdAt = new Date(createdAt).toLocaleString();

    if (content && content.trim().startsWith('http')) content = (
      <a className="and-so-on" target="_blank" href={content.trim()}>
        {shortenUrl(content)}
      </a>
    );

    let arrowColor = explanation.hasVoted ? 'red' : 'black';

    return (
      <div className="explanation card" key={explanation.id}>
        <div className="row middle-xs">
          <div className="col-xs-1">
            <IconButton iconClassName="icon icon-arrow-up" tooltip="Vote"
                        onClick={() => this.onVoteExplanation(explanation)}
                        disabled={voteDisabled} iconStyle={{color: arrowColor}}
                        className={`small`}/>
          </div>
          <div className="col-xs-1">
            {explanation.votes}
          </div>
          <div className="col-xs-10" style={{'white-space': 'normal'}}
               dangerouslySetInnerHTML={{'__html': content}}/>
        </div>
        <div className="row end-xs">
          <div className="col-xs-6">
            <div className="row">
              <div className="col-xs-12">created at <i>{createdAt}</i></div>
              <div className="col-xs-12">
                by <em>{explanation.author.name}</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  onVoteExplanation(explanation) {
    let {id, hasVoted} = explanation;
    if (hasVoted) ExplanationActions.unvote(id);
    else ExplanationActions.vote(id);
  }

});

export default ExplanationCard;
