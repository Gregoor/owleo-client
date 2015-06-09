import React from 'react';

import searchAPI from '../api/search-api';
import Select from './select';

import nameAndContainer from './helpers/nameAndContainer';

let Search = React.createClass({

  render() {
    return (
      <Select placeholder="Search the concepts in our graph" autoload={false}
              asyncOptions={this.onLoadOptions}
              onChange={this.onChange} {...this.props}/>
    );
  },

  onLoadOptions(query, callback) {
    searchAPI({'q': query, 'for': ['Concept']}).then(result => {
      let options = result.map(data => {
        let value, label;

        switch (data.type) {
          case 'Concept':
            value = data.id;
            label = nameAndContainer(data);
            break;
          case 'Tag':
            value = data.name;
            label = `tagged: ${data.name}`;
            break;
        }

        return {value, label, 'type': data.type};
      });
      callback(null, {options, 'complete': options.length < 10});
    });
  },

  onChange(value, selected) {
    this.props.onSelect(selected[0]);
  }

});

export default Search;
