/**
 * cakephp.js | CakePHP Plugin 1.0.2
 * @date 4.21.2012
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc, inflection.js
 * @description a extension for using CakePHP
 */

Orange.add('cakephp', function(O) {

	var CakeSource;
	
	var RestSource = __import('RestSource');
	
	CakeSource = RestSource.extend({

		supportsModels: function() {
			return true;
		},
		
		filterItem: function(type, data) {
			data = (typeof data == 'string') ? JSON.parse(data) : data;
			var name = (type.substr(0, 1).toUpperCase() + type.substr(1)).singularize();
			return data[name];
		},
		
		filterItems: function(type, data) {
			var data = JSON.parse(data);
			return data[type.pluralize()];
		},
		
		filterType: function(type) {
			return type.pluralize();
		}
	
	});

	O.namespace('CakePHP');

	O.CakePHP.CakeSource = CakeSource;

}, ['mvc'], '1.0');