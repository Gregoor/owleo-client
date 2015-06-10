import React from 'react';
import {IconButton} from 'material-ui';

import LinkActions from '../../actions/link-actions';
import shortenUrl from '../helpers/shorten-url';

let LinkRow = React.createClass({

  render() {
    let {link, voteDisabled} = this.props;
    console.log(shortenUrl);
    let label = link.name || shortenUrl(link.url);

    let votedClass = link.hasVoted ? 'voted' : '';

    return (
      <div className="link row" key={link.id}>
        <div className="col-xs-1">
          <IconButton iconClassName="icon icon-arrow-up" tooltip="Vote"
                      onClick={() => this.onVoteLink(link)}
                      disabled={voteDisabled}
                      className={`small ${votedClass}`}/>
        </div>
        <div className="col-xs-1">
          {link.votes}
        </div>
        <div className="col-xs-10">
          <a className="link and-so-on" target="_blank" href={link.url}>
            {label}
          </a>
        </div>
      </div>
    );
  },

  onVoteLink(link) {
    if (link.hasVoted) LinkActions.unvote(link.id);
    else LinkActions.vote(link.id);
  }

});

export default LinkRow;
