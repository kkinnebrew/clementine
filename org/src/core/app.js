/**
 * app.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

if (typeof O === 'undefined') {
    var O = {};
}

O.App = Class.create({

	/**
	 * sets up application and loads the MainController
	 */
	initialize: function() {
	
		// setup configuration
		this.Config = new Configuration(); 
		
		// setup main controller
		this._mainController = App.Controllers.MainController();
	
	},
	
	/**
	 * launches the application
	 */
	launch: function() {
	
		this.Config.getRootElement().append(this.mainController.render());
	
	},
	
	/**
	 * moves the application to offline mode
	 */
	goOffline: function() {
	
		this._mainController.goOffline();
	
	},
	
	/**
	 * returns the application to online mode
	 */
	goOnline: function() {
	
		this._mainController.goOnline();
	
	}

});

// setup app
var App = new O.App();