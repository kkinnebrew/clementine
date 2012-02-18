/**
 * orangeui-0.1.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none
 */
 
 window.OrangeUI = (function (window, document, undefined) {

	var version = '0.1.0',
	
	OrangeUI = {},
	
	// tracks offline/online browsing
	isOnline = false,
	
	/**
	 * default module settings
	 */
	enableStorage 	= true,
	enableCache 	= false,
	enableLocation 	= false,
	
	/**
	 * global regular expressions
	 */
	modFilterRegex = /[^-A-Za-z_]/g;
	
	// stores application extension modules
	OrangeUI.modules = {};
	
	
	
	// internal classes
	
	OrangeUI.Loader = (function() {
			
		// stores module objects
		var modules = {};
		
		return {
		
			init: function() {
				return this;
			},
		
			addModule: function(name, fn, req) {
			
				name = name.replace(modFilterRegex); // clean up name
				
				var mod = {
					name: name,
					fn: fn,
					req: (req != undefined) ? req : []
				};
				
				modules[name] = mod;
			},
			
			loadModule: function(name) {
								
				if (OrangeUI.modules[name]) {
					return; // module already loaded
				}
			
				if(modules[name] != undefined) {
												
					// load dependencies
					for(var i = 0, len = modules[name].req.length; i < len; i++) {
						this.loadModule(modules[name].req[i]);
					}
				
					// load module
					modules[name].fn.call(window, OrangeUI); // execute with OrangeUI as context
					
					// set as loaded
					OrangeUI.modules[name] = true;
					
					console.log('[INFO] Module "' + name + '" loaded');
				}
			}
		}
		
	})();
	
		
	/**
	 * extends functionality to register custom
	 * modules
	 */
	OrangeUI.add = function() {
		
		var args = arguments,
			name = args[0],
			fn = ( typeof args[1] === 'function' ) ? args[1] : null,
			req = args[2];
				
		OrangeUI.Loader.addModule(name, fn, req);
	};
	
	OrangeUI.use = function() {
	
		var args = [].splice.call(arguments, 0),
			fn = args[args.length-1],
			req = clone(args).splice(0, args.length-1)
					
		// load modules
		for (var i = 0, len = req.length; i < len; i++) {
			OrangeUI.Loader.loadModule(req[i]);
		}
		
		fn.call(window, OrangeUI);
	}
	
	return OrangeUI;

})(this, this.document);