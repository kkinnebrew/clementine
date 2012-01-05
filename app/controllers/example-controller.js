/**
 * example-controller.js | OrangeUI Example App 0.1 | 12.21.2011 
 */

if (typeof App === 'undefined') {
    var App = {};
}

if (typeof App.Controller === 'undefined') {
    App.Controller = {};
}

App.Controller.MainController = Class.extend(Orange.Controller, {

	setup: function() {
	
		this.rootEl = App.Config.getRootElement();
			
		// initialize other controllers
		this.controllers.add("table-controller", new App.Controller.TableController());
		
		// create elements
		this.elements.navigationBar = new Orange.UI.IOS.UINavigationBar();
		this.elements.table = new Orange.UI.IOS.UITableView();
		this.elements.toolbar = new Orange.UI.IOS.UIToolbar();
		var segmentedControl = new Orange.UI.IOS.UISegmentedControl();
		
		// setup data sources
		var ds = new Orange.DB.DataSource()
		ds.setNodeType("event");
		
		this.datasources.add("event-data-source", ds);
		
		// bind data source
		this.elements.table.bindDataSource(ds);
		
		// USE QUERIES HERE?
		
		// setup elements
		this.elements.navigationBar.setTitle("Event Feed");
		segmentedControl.add(["My Events", "All Events"]);
		this.elements.toolbar.setCenterView(segmentedControl);
	
	},

	render: function() {
	
		// append elements
		this.rootEl.appendChild(this.elements.navigationBar.render());
		this.rootEl.appendChild(this.elements.table.render());
		this.rootEl.appendChild(this.elements.toolbar.render());
	
	},
	
	toOffline: function() {
	
		this.datasources.get("event-data-source").pause();
	
	},
	
	toOnline: function() {
	
		this.datasources.get("event-data-source").resume();
		
	}

});