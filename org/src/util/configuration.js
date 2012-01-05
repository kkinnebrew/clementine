/**
 * configuration.js | OrangeUI Framework 0.1 | 12.21.2011 
 */


if (typeof Orange === 'undefined') {
    var Orange = {};
}

Orange.Configuration = Class.create({

	initialize: function() {
	
	
	},
	
	/**
	 * 1 - Processing
	 * 2 - Rendering
	 */
	setRenderingMode: function(mode) {
	
		this.renderingMode = mode;
	
	},
	
	getRenderingMode: function() {
	
	},
	
	setRootElement: function(element) {
	
		this._rootElement = element;
	
	},
	
	getRootElement: function() {
	
		return this._rootElement;
	
	}

});