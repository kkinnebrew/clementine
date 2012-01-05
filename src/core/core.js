/**
 * request-ajax.js | OrangeUI Example App 0.1 | 12.21.2011 
 */

if (typeof Orange === 'undefined') {
    var Orange = {};
}

Orange.Core = Class.create({

	initialize: function(rootEl) {

		this.rootController = new App.Controller.MainController(rootEl);
		this.rootController.render();
	
	}

});


Orange.Initialize = function(rootEl) {

	this._singleton = new Orange.Core(rootEl);

}

Orange.getInstance = function() {

	return this._singleton;

}