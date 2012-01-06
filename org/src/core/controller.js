/**
 * controller.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

if (typeof O === 'undefined') {
    var O = {};
}

O.Controller = Class.create({

	/**
	 * initializes the controller
	 */
	initialize: function() {

		this._events = {};
		this._rootEl;
		this._dataSources = new Dictionary();
		this._elements = new Dictionary();
		this._controllers = new Dictionary();

	},
	
	/**
	 * sets up all elements necessary for the controller
	 */
	setup: function() {
	
	},
	
	/**
	 * sets up the controller and begins execution
	 */
	load: function() {
	
	},
	
	
	/**
	 * handles preparation to move to offline mode
	 */
	toOffline: function() {
	
	},
	
	/**
	 * handles preparation to move to online mode
	 */
	toOnline: function() {
	
	},
	
	
	getDS: function() {},
	setDS: function() {},
	
	getEl: function() {},
	setEl: function() {},
	
	getCtrl: function() {},
	setCtrl: function() {},
	
	
	/**
	 * handles automatic event binding
	 */
	bindEvents: function() {
	
	},
	
	unbindEvents: function() {
	
	},
	
	/**
	 * gets the root element of the controller
	 */
	getRootEl: function() {
	
	},
	
	/**
	 * binds a managed event
	 */
	bindEvt: function() {
	
	},
	
	unbindEvt: function() {
	
	},
	
	/**
	 * disables an event
	 */
	disableEvt: function() {
	
	},
	
	/**
	 * enables an event
	 */
	enableEvt: function() {
	
	}

});