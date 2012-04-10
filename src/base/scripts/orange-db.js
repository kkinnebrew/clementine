/**
 * orange-db-0.1.js | OrangeUI DB Plugin 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-ui-0.1, jquery-1.7.2
 * @description adds custom datasources and control binding support
 */

Orange.add('db', function(O) {
	
	O.DB = (function() {
	
		return {
		
		
		};
	
	})();
	
	O.DataSource = O.define({
	
		initialize: function() {
		
		},
		
		getCollection: function() {
		
		},
		
		getItem: function(id) {
		
		},
		
		destroy: function() {
				
		}
	
	});

	O.Collection = O.define({
	
		initialize: function() {
		
		},
		
		filter: function(filter) {
		
		},
		
		clearFilter: function(attr) {
		
		},
		
		clearFilters: function() {
		
		},
		
		destroy: function() {
				
		}
	
	});

});