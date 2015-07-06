import React from 'react';
import {IconButton} from 'material-ui';

import ExplanationActions from '../../actions/explanation-actions';
import shortenUrl from '../helpers/shorten-url';

let ExplanationCard = React.createClass({

  render() {
    let {explanation, voteDisabled} = this.props;
    let {content} = explanation;

    if (content && content.trim().startsWith('http')) content = (
      <a className="and-so-on" target="_blank" href={content.trim()}>
        {shortenUrl(content)}
      </a>
    );

    let votedClass = explanation.hasVoted ? 'voted' : '';

    return (
      <div className="explanation card" key={explanation.id}>
        <div className="row">
          <div className="col-xs-1">
            <IconButton iconClassName="icon icon-arrow-up" tooltip="Vote"
                        onClick={() => this.onVoteExplanation(explanation)}
                        disabled={voteDisabled}
                        className={`small ${votedClass}`}/>
          </div>
          <div className="col-xs-1">
            {explanation.votes}
          </div>
          <div className="col-xs-10" style={{'white-space': 'pre'}}>
            {content}
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
