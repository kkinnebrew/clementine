/**
 * ios.js | OrangeUI iOS Module 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, ui, db, jquery-1.7.2
 * @description adds ios element controls
 */
 
Orange.add('ios', function(O) {

	O.namespace('iOS');

	/* base view controls */

	O.iOS.UINavigationView = O.define(O.View, {
		
		onLoad: function() {
		
		},
		
		popView: function() {
		
		},
		
		pushView: function(view) {
		
		},
		
		popToRootView: function() {
		
		},
		
		onUnload: function() {
		
		}
			
	});
	
	O.iOS.UIScrollView = O.extend(O.View, {
		
		onLoad: function() {
		
		},
		
		onUnload: function() {
		
		}
			
	});
	
	O.iOS.UITableView = O.extend(O.View, {
		
		onLoad: function() {
		
		},
		
		onRefresh: function() {
		
		},
		
		bindData: function(data) {
		
		},
		
		onUnload: function() {
		
		}
			
	});
	
	O.iOS.UIModalView = O.extend(O.View, {
		
		onLoad: function() {
		
		},
		
		activateModalView: function() {
		
		},
		
		dismissModalView: function() {
		
		},
		
		onUnload: function() {
		
		}
			
	});
	
	O.iOS.UIFlipView = O.extend(O.View, {
		
		onLoad: function() {
		
		},
		
		flipView: function() {
		
		},
		
		onUnload: function() {
		
		}
			
	});
	
	
	/* module management */
	
	O.iOS.ModuleManager = O.define({
	
		initialize: function() {
		
			// handle bar button events
			
			// handle segmented controls
			
			// handle form input defaults
		
		},
		
		destroy: function() {
		
		}
	
	});
	
	
	/* element controls */
	
	O.iOS.UISegmentedControl = O.extend(O.Element, {
	
		onLoad: function() {
		
		},
		
		onUnload: function() {
		
		}
	
	});
	
}, ['ui', 'db'], '0.1');