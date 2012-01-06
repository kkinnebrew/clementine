/**
 * configuration.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

if (typeof O === 'undefined') {
    var O = {};
}


/* constants */
var RenderMode = {};

RenderMode.RENDER = 1;
RenderMode.PROCESS = 2;

var LogMode = {};

LogMode.INFO = 1;
LogMode.DEBUG = 2;
LogMode.WARN = 3;
LogMode.ERROR = 4;

O.Configuration = Class.create({

	/**
	 * sets up configuration object
	 */
	initialize: function() {
	
		this._loggingMode = null;
		this._renderingMode = null;
		this._rootEl = null;
	
	},
	
	/**
	 * sets logging modes INFO, WARN, DEBUG
	 */
	getLoggingMode: function() {
		return this._loggingMode;
	},
	
	setLoggingMode: function(mode) {
		this._loggingMode = mode;
	},
	
	/**
	 * sets rendering mode RENDER, PROCESS
	 */
	getRenderingMode: function() {
		return this._renderingMode;
	},
	
	setRenderingMode: function(mode) {
		this._renderingMode = mode;
	},
	
	/**
	 * sets the root element to either process or
	 * render elements into
	 */
	getRootElement: function() {
	 	return this._rootEl;
	},
	
	setRootElement: function(el) {
		this._rootEl = el;
	}

});