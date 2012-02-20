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
				O.Storage.init(App.isOnline); 
			}
			
			// setup requests
			O.Request.init({
				baseUrl: config.baseUrl,
				timeout: config.timeout
			});
			
			O.Log.info("Application loaded in " + (O.App.isOnline ? "online" : "offline") + " mode");
			
			// trigger state event
			O.Handle = $('<div></div>');
			
			if(!O[config.namespace] || !O[config.namespace].RootController) {
				O.Log.error("Missing root view controller");
			} else {
				// setup root view controller
				O.RootViewController = new O[config.namespace].RootController();
			}
			
			if(O.App.isOnline) {
				O.Handle.trigger("online");
			} else {
				O.Handle.trigger("offline");
			}
						
		}
		
		App.goOnline = function() {
			this.isOnline = true;
			O.Log.info("Application went online");
			O.Storage.goOnline();
			if(O.Handle != undefined) O.Handle.trigger("online");
		},
		
		App.goOffline = function() {
			this.isOnline = false;
			O.Log.info("Application went offline");
			O.Storage.goOffline();
			if(O.Handle != undefined) O.Handle.trigger("offline");
		}
		
		return App;
	
	})();
	
}, ['cache', 'location', 'log', 'storage', 'request']);