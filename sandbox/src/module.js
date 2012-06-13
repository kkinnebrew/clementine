(function() {

	/**
	 * modules come with built in event handler functionality,
	 * registration by type, and a passed config parameter.
	 * Individual modules can be loaded by type, and extended
	 */
	var Module = (function() {
	
		Module.__registry__ = {};
		Module.__config__ = { required: ['getType'] };
		Module.__parent__ = undefined;
		
		// loads a module class from the registry
		Module.load = function(type) {
		
			if (!__registry__.hasOwnProperty(name)) throw "Module '" + name + '" not found';
			return __registry__[name];
		
		};
		
		Module.extend = function(def, config) {
						
			// extend class
			var c = Class.extend.call(this, def);
			
			// pass static vars
			c.__config__ = this.constructor.__config__;
			
			// merge configs
			for (var attr in config.required) { c.__config__.required[attr] = config.required[attr]; }
			
			// get required
			var required = c.__config__.required;
			
			// check for required values
			for (var i = 0, len = required.length; i < len; i++) {
				if (!def.hasOwnProperty(required[i])) throw "Class missing '" + required[i] + "()' implementation";
				m[required[i]] = def[required[i]];
			}
			
			// get type
			var type = def.getType();
			
			// register module
			Module.__registry__[type] = c;
			
			return c;
		
		}; // must implement getType()
	
		function Module() {}
	
		Module.prototype.on = function() {
		
		};
		
		Module.prototype.fire = function() {};
		Module.prototype.detach = function() {};
	
	})();

	var Model = Module.extend({
	
		initialize: function() {
		
		},
		
		getType: function() {},
		
		getConfig: function() {}
	
	}, { required: ['getType'] });	

})();