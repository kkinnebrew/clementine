/**
 * element.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

if (typeof O === 'undefined') {
    var O = {};
}

if (typeof O.UI === 'undefined') {
    var O.UI = {};
}

O.UI.Element = Class.create({

	initialize: function() {
	
		this._events = {};
	
		this._el = if(this.getSource == undefined) ? document.createElement('div') : this.getSource();
		this._el.className = this.getClassName();
			
	},
	
	
	/** 
	 * sets up the element
	 */
	setup: function() {
	
		if(App.Config.getRenderingMode() == RenderMode.RENDER) {
		
			
		
		} else {
		
			
		
		}
	
	},
	
	/**
	 * renders returns the element
	 */
	render: function() {
	
		if(App.Config.getRenderingMode() != RenderMode.RENDER) {
			O.Log.error('Method render() called in non-rendered context');
			return false;
		}
		
	},
	
	/**
	 * processes DOM references and binds behaviors
	 */
	process: function() {
	
		if(App.Config.getRenderingMode() != RenderMode.PROCESS){
			O.Log.error('Method process() called in non-processed context');
			return false;
		}
		
	},
	
	/**
	 * returns the DOM source for rendered elements
	 */
	getSource: function() {
	
	},
	
	/**
	 * returns the class name for the element
	 */
	getClassName: function() {
		return 'ui-element';
	},
	
	
	/**
	 * gets the root element of the element
	 */
	getRootEl: function() {
		return this._el;
	},
	
	
	unbindEvents: function() {
		
		for(var i=0; i<this._elements.length; i++) {
			this._elements[i].unbind();
		}
		
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