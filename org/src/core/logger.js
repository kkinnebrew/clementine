/**
 * logger.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

if (typeof O === 'undefined') {
    var O = {};
}

O.Logger = Class.create({
	
	initialize: function(objectName) {
		
		this.className = typeof objectName;
	
	},
	
	/**
	 * logs a message with a given level
	 */
	log: function() {
	
	},
	
	
	/**
	 * logs an error message
	 */
	error: function() {
	
	},
	
	/**
	 * logs a warning message
	 */
	warn: function() {
	
	},
	
	/**
	 * logs a debug message
	 */
	debug: function() {
	
	},
	
	/**
	 * logs an info message
	 */
	info: function() {
	
	}
	
});