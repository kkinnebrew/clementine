/**
 * orange-ios.js | OrangeUI iOS Plugin 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-ui-0.1, jquery-1.7.2, iscroll
 * @description adds ios behavior and controls
 */

OrangeUI.add('orange-ios', function(O) {

	O.namespace("iOS");
	
	/* custom view controllers */
	O.iOS.UINavigationController = O.View.extend(O.ViewController, {
	
		name: 'ui-navigation-view',
						
		onLoad: function() {
			this.self.onLoad();
		},
		
		pushViewController: function() {},
		
		popViewController: function() {},
		
		onUnload: function() {
			this.self.onUnload();
		}
			
	});
	
	
	O.iOS.UITableViewController = O.View.extend(O.ViewController, {
	
		name: 'ui-table-view',
			
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {
			this.super.onUnload();		
		}
			
	});
	
	
	O.iOS.UIModalViewController = O.View.extend(O.ViewController, {
	
		name: 'ui-modal-view',
			
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
	
	});


	O.iOS.UIFlipViewController = O.View.extend(O.ViewController, {
		
		name: 'ui-flip-view',
				
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
		
	});
	
	O.iOS.UITabBarViewController = O.View.extend(O.ViewController, {
		
		name: 'ui-tab-bar-view',
				
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
		
	});
		

}, ['ui'], '0.1');