/**
 * controller.js | OrangeUI Framework 0.1 | 12.21.2011 
 */


if (typeof Orange === 'undefined') {
    var Orange = {};
}

Orange.Controller = Class.create({

	initialize: function() {
	
		this.controllers = new Dictionary();
		this.datasources = new Dictionary();
		this.elements = {};
		
		this.setup();
	
	},
	
	setup: function() {
	
	}

});