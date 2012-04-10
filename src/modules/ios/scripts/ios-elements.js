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
		
		_activeView: null,
		
		
		
		onLoad: function() {
		
			// call base
			this.prototype.onLoad();
		
			// push view with data-default="true" on the stack
			var name = this.target.find('[data-default="true"]').val();
			this.pushViewController(name);
		
		},
		
		pushViewController: function(view) {
		
			if(typeof view == 'string') {
				view = this.getView(view);
			}
			var name = 
			
			// push it
			
			// set it as active
			_activeView = 
		
		},
		
		popViewController: function() {
		
			
		
		}
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	
	
	O.iOS.UITableViewController = O.View.extend(O.ViewController, {
	
		name: 'ui-table-view',
	
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	
	
	O.iOS.UIModalViewController = O.View.extend(O.ViewController, {
	
		name: 'ui-modal-view',
	
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});


	O.iOS.UIFlipViewController = O.View.extend(O.ViewController, {
		
		name: 'ui-flip-view',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
		
	});
	
	O.iOS.UITabBarViewController = O.View.extend(O.ViewController, {
		
		name: 'ui-tab-bar-view',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
		
	});
	
	
	/* custom element controllers */
	O.iOS.UITableViewCellController = O.Element.extend(O.ElementController, {
	
		name; 'ui-table-view-cell',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	
	O.iOS.UINavigationBarController = O.Element.extend(O.ElementController, {
	
		name; 'ui-navigation-bar',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	
	O.iOS.UIToolbarController = O.Element.extend(O.ElementController, {
	
		name; 'ui-toolbar',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	
	O.iOS.UIBarButtonItemController = O.Element.extend(O.ElementController, {
	
		name; 'ui-bar-button-item',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	
	O.iOS.UIMapViewController = O.Element.extend(O.ElementController, {
	
		name; 'ui-map-view',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	
	O.iOS.UITabBarController = O.Element.extend(O.ElementController, {
	
		name; 'ui-tab-bar',
		
		initialize: function() {},
		
		onLoad: function() {},
		
		onUnload: function() {},
		
		destroy: function() {}
	
	});
	

}, ['ui'], '0.1');