let Reflux = require('reflux');

let ConceptActions = Reflux.createActions([
  'getAll',
  'select',
	'unselect',
	'new',
	'created',
	'updated',
	'save',
	'delete',
	'deleted',
	'reposition'
]);

export default ConceptActions;
