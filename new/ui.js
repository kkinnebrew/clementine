Orange.add('ui', function(O) {

	O.App = (function() {
	
		var Application = {};
		
		
		
		return Application;
	
	})();
	
	O.UI = (function() {
	
		var UIManager = {};
	
		UIManager.registerView = function() {
		
		
		};
	
		return UIManager;
	
	})();
	

	O.ViewController = O.Controller.extend({
	
		// instance methods
	
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
	O.ElementController = O.Controller.extend({
	
		// instance methods
		
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
	O.FormController = O.Controller.extend({
	
		// instance methods
		
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	

}, ['mvc'], '0.1');