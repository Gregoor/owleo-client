let Reflux = require('reflux');

let ConceptActions = Reflux.createActions([
  'getAll',
  'select',
	'unselect',
	'new',
	'create',
	'update',
	'save'
]);

export default ConceptActions;
