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
		
		this.setup();

	},
	
	/**
	 * sets up all elements necessary for the controller
	 */
	setup: function() {
	
		this.setRootEl(O.DOM.DIV('container'));
	
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
	
	
	getDS: function(name) {
		return this._dataSources.get(name);
	},
	setDS: function(name, value) {
		this._dataSources.set(name, value);
	},
	
	getEl: function(name) {
		return this._elements.get(name);
	},
	setEl: function(name, value) {
		this._elements.set(name, value);
	},
	
	getCtrl: function(name) {
		return this._controllers.get(name);
	},
	setCtrl: function(name, value) {
		this._controllers.set(name, value);
	},
	
	
	/**
	 * handles automatic event binding
	 */
	bindEvents: function() {
	
		
	
	},
	
	unbindEvents: function() {
	
		for(var i=0; i<this._elements.length; i++) {
			this._elements[i].unbind();
		}
	
	},
	
	/**
	 * gets the root element of the controller
	 */
	getRootEl: function() {
		return this._rootEl;
	},
	setRootEl: function(el) {
		this._rootEl = el;
	}
	
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