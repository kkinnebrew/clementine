/**
 * ui-engine.js | OrangeUI Framework 0.1 | 12.21.2011 
 * 
 * the UI rendering engine that handles all DOM element generation
 * and event bindings
 * 
 */


if (typeof Orange === 'undefined') {
    var Orange = {};
}

if (typeof Orange.UI === 'undefined') {
    Orange.UI = {};
}

Orange.UI.Engine = Class.create({

	initialize: function() {
		
		this.el = $("#canvas");
	
	},
	
	getRootEl: function() {
	
		return this.el;
	
	},
	
	append: function(el) {
	
		this.el.append(el);
	
	},
	
	destroy: function() {
	
	
	}

});