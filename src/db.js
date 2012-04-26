/**
 * db.js | OrangeUI DB 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons
 * @description handles data requests and persistence
 */
 
Orange.add('db', function(O) {

	/* abstract data access */
	
	O.Model = O.define({
		
		initialize: function() {
		
		},
		
		refresh: function() {
		
			// refetch data
			
			// onSuccess, send event down the DOM
			// any viewcontroller can listen for changes
			
		},
				
		destroy: function() {
		
		}
			
	});


	/* data containers */

	O.Collection = O.define({
		
		model: null,
		
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
			
	});
		
	O.Item = O.define({
	
		model: null,
	
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
}, [], '0.1');