let Reflux = require('reflux');

let ConceptActions = Reflux.createActions([
  'getAll',
  'select',
	'unselect',
	'new',
	'save'
]);

export default ConceptActions;
