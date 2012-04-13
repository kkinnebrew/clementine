/**
 * orange-ios.js | OrangeUI iOS Plugin 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-ui-0.1, jquery-1.7.2, iscroll
 * @description adds ios behavior and controls
 */

OrangeUI.add('orange-ios', function(O) {

	O.namespace("iOS");
	
	/* custom element controllers */
	O.iOS.UITableViewCellController = O.Element.extend(O.ElementController, {
	
		name; 'ui-table-view-cell',
		
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
	
	});
	
	O.iOS.UINavigationBarController = O.Element.extend(O.ElementController, {
	
		name; 'ui-navigation-bar',
		
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
	
	});
	
	O.iOS.UIToolbarController = O.Element.extend(O.ElementController, {
	
		name; 'ui-toolbar',
		
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
	
	});
	
	O.iOS.UIBarButtonItemController = O.Element.extend(O.ElementController, {
	
		name; 'ui-bar-button-item',
		
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
	
	});
	
	O.iOS.UIMapViewController = O.Element.extend(O.ElementController, {
	
		name; 'ui-map-view',
		
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
	
	});
	
	O.iOS.UITabBarController = O.Element.extend(O.ElementController, {
	
		name; 'ui-tab-bar',
		
		onLoad: function() {
			this.super.onLoad();		
		},
		
		onUnload: function() {		
			this.super.onUnload();		
		}
	
	});
	

}, ['ui'], '0.1');