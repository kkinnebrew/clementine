/**
 * app.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies storage.js, cache,js, log.js
 */

OrangeUI.add('app', function(O) {
	
	O.App = (function() {
	
		var App = {}
		
		App.isOnline = false;
	
		App.init = function(config) {
		
			// set logging
			O.Log.setLevel(config.log);
			
			// setup cache
			O.Cache.init();
			
			// setup location
			O.Location.init();
						
			// initialize storage
			if(config.useStorage) {
				O.Storage.init(); 
			}
			
			// setup requests
			O.Request.init({
				baseUrl: config.baseUrl,
				timeout: config.timeout
			});
			
			O.Log.info("Application loaded in " + (O.App.isOnline ? "online" : "offline") + " mode");
						
		}
		
		App.goOnline = function() {
			this.isOnline = true;
			O.Log.info("Application went online");
			O.Storage.goOnline();
		},
		
		App.goOffline = function() {
			this.isOnline = false;
			O.Log.info("Application went offline");
			O.Storage.goOffline();
		}
		
		return App;
	
	})();
	
}, ['cache', 'location', 'log', 'storage', 'request']);