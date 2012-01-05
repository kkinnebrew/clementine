/**
 * example-table-controller.js | OrangeUI Example App 0.1 | 12.21.2011 
 */

if (typeof App === 'undefined') {
    var App = {};
}

if (typeof App.Controller === 'undefined') {
    App.Controller = {};
}

App.Controller.TableController = Class.extend(Orange.Controller, {

	setup: function() {
	
		
	
	},
	
	toOffline: function() {
	
		this.datasources.get("event-data-source").pause();
	
	},
	
	toOnline: function() {
	
		this.datasources.get("event-data-source").resume();
		
	}

});