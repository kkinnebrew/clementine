/**
 * main-controller.js | OrangeUI Example App 0.1 | 12.21.2011 
 */

if (typeof App.Controllers === 'undefined') {
    App.Controllers = {};
}

App.Controllers.MainController = Class.extend(O.Controller, {

	setup: function() {

		// setup root element
		this.setRootEl(O.DOM.DIV('container'));

		// initialize elements
		this.setEl('nav-bar', new O.UI.IOS.UINavigationBar());
		this.setEl('table', new O.UI.IOS.UITableView());
		this.setEl('toolbar', new O.UI.IOS.UIToolbar());
		
		this.setEl('left-nav-btn', new O.UI.IOS.UIBarButtonItem());
		this.setEl('right-nav-btn', new O.UI.IOS.UIBarButtonItem());
		
		this.setEl('seg-ctrl', new O.UI.IOS.UISegmentedControl());
	
		// apply formatting
		this.getEl('nav-bar').setTitle('Welcome');
		
		this.getEl('left-nav-btn').setLabel('Back').setType('back');
		this.getEl('right-nav-btn').setLabel('Email');
		
		this.getEl('seg-ctrl').add(['One', 'Two', 'Three']);
		
		// setup structure
		this.getEl('nav-bar').setLeftBarButtonItem(this.getEl('left-nav-btn'));
		this.getEl('nav-bar').setRightBarButtonItem(this.getEl('right-nav-btn'));
		
		this.getEl('toolbar').setCenterView(this.getEl('seg-ctrl'));
		
		
		// setup sources
		this.setDS('customers', new App.DataSources.Customers());
		this.setDS('products', new App.DataSources.Products());
		
		
		// bind sources
		this.getEl('table').bindDS(this.getDS('customers'));
		
		// bind to root element
		this.getRootEl().append(this.getEl('nav-bar'));
		this.getRootEl().append(this.getEl('table'));
		this.getRootEl().append(this.getEl('toolbar'));
				
	},
	
	/* alternative */
	process: function() {
	
	
	}

});