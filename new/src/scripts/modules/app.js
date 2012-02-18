/**
 * app.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies storage.js, cache,js, log.js
 */

OrangeUI.add('app', function(O) {
	
	O.App = (function() {
	
		var App = {}
		
	
		App.init = function(config) {
		
			// set logging
			O.Log.setLevel(config.log);
			
			// initialize storage
			if(config.useStorage) {
				O.Storage.init(); 
				O.Storage.goOnline();
			}
		}
		
		return App;
	
	})();
	
}, ['storage', 'cache', 'log']);