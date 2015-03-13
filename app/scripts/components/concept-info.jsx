let React = require('react');

let ConceptInfo = React.createClass({

  render() {
    let concept = this.props.concept;
    return (
      <div className="concept-info">
        <div className="row">
          <div className="col-xs-12"><h1>{concept.name}</h1></div>
        </div>
        <div className="row">
          <div className="col-xs-12">{concept.summary}</div>
        </div>
      </div>
    );
  }

});

export default ConceptInfo;
