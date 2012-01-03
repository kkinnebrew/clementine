/**
 * ios-elements.js | OrangeUI Framework 0.1 | 12.21.2011 
 * 
 * stores the base class and extensions of all ios element
 * renderers
 * 
 */

if (typeof Orange.UI.IOS === 'undefined') {
    Orange.UI.IOS = {};
}

Orange.UI.IOS.UIElement = Class.create({

	initialize: function() {
	
		this.name = this.getClassName(); // class name
		this.el = this.getSource === undefined ? $('<div class=' + this.name + '></div>') : this.getSource(); // setup DOM element
		this.el.data("control", this); // store reference
	
	},
	
	render: function() {
		return this.el;
	},
	
	destroy: function() {
	
		this.el.removeData();
	
	}

});

/* UINavigationBar */
Orange.UI.IOS.UINavigationBar = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-navigation-bar";
	}

});

/* UIToolbar */
Orange.UI.IOS.UIToolbar = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-toolbar";
	}

});

/* UIBarButtonItem */
Orange.UI.IOS.UIBarButtonItem = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-bar-button";
	}
	
});

/* UITableView */
Orange.UI.IOS.UITableView = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-table-view";
	}

});

/* UITableCell */
Orange.UI.IOS.UITableViewCell = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-table-view-cell";
	}

});