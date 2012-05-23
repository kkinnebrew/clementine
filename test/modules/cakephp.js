Orange.add('cakephp', function(O) {

	// module imports
	var RestSource = __import('RestSource');

	// module declarations
	var CakeSource;

	// module definitions
	CakeSource = RestSource.extend({
		
		filterItem: function(type, data) {
			data = (typeof data == 'string') ? JSON.parse(data) : data;
			var name = (type.substr(0, 1).toUpperCase() + type.substr(1)).singularize();
			return data[name];
		},
		
		filterItems: function(type, data) {
			var data = JSON.parse(data);
			return data[type];
		}
		
	});

	// module exports
	__export('CakeSource', CakeSource);

}, [], '1.0');