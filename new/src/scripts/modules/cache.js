/**
 * cache.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies log.js, 
 */

OrangeUI.add('cache', function(O) {

	O.Cache = (function() {
	
		var Cache = {},
		
		// stores the cache object
		_cache = $(window.applicationCache);
		
				
		Cache.init = function () {
		
			// bind events
			_cache.on("cached", 		$.proxy(this.onCached, this));
			_cache.on("checking", 		$.proxy(this.onChecking, this));
			_cache.on("downloading", 	$.proxy(this.onDownloading, this));
			_cache.on("error", 			$.proxy(this.onError, this));
			_cache.on("noupdate", 		$.proxy(this.onNoUpdate, this));
			_cache.on("progress", 		$.proxy(this.onProgress, this));
			_cache.on("updateready", 	$.proxy(this.onUpdateReady, this));
			
			// bind network events
			window.addEventListener("offline", $.proxy(this.checkNetworkStatus, this), false);  
			window.addEventListener("online", $.proxy(this.checkNetworkStatus, this), false); 
			
			Cache.checkNetworkStatusRepeat();
			
			if(O.App.isOnline) O.Log.info("Cache manager loaded in " + (O.App.isOnline ? "online" : "offline") + " mode");
		
		};
		
		Cache.checkNetworkStatus = function(repeat) {
			
			O.Log.info("Checking connection...");
					
			// repeat on an interval
			//if(repeat) setTimeout($.proxy(this.checkNetworkStatusRepeat, this), 60 * 1000);
			
			// if the browser things we're online
			if (navigator.onLine) {
			
			    $.ajaxSetup({
			        async: true,
			        cache: false,
			        context: this,
			        dataType: "json",
			        error: function (req, status, ex) {
			        	if(O.App.isOnline) O.App.goOffline();
			        	return false;
			        },
			        success: function (data, status, req) {
			        	if(!O.App.isOnline) O.App.goOnline();
			        	return true;
			        },
			        timeout: 5000,
			        type: "GET",
			        url: "js/ping.js"
			    });
			    $.ajax();
			    if(!O.App.isOnline) O.App.goOnline();
			    return true;
			}
			else {
				if(O.App.isOnline) O.App.goOffline();
			    return false;
			}
			if(O.App.isOnline) O.App.goOffline();
			return false;
			
		};
		
		Cache.checkNetworkStatusRepeat = function() {
			this.checkNetworkStatus(true);
		};
		
		
		/* event handlers */
		
		Cache.onCached = function(e) {
			O.Log.info("Cache: All resources for this web app have now been downloaded. You can run this application while not connected to the internet");
		},
		
		Cache.onChecking = function() {
			O.Log.info("Cache: Checking manifest");
		},
		
		Cache.onDownloading = function() {
			O.Log.info("Cache: Starting download of cached files");
		},
		
		Cache.onError = function() {
			O.Log.warn("Cache: There was an error in the manifest, downloading cached files or you're offline");
		},
		
		Cache.onNoUpdate = function() {
			O.Log.info("Cache: There was no update needed");
		},
		
		Cache.onProgress = function() {
			O.Log.info("Cache: Downloading cached files");
		},
		
		Cache.onUpdateReady = function() {
				
			window.applicationCache.swapCache();
			O.Log.info("Cache: Updated cache is ready");
		
			// the new cache will not be used until the page refreshes
			window.location.reload(true);
		
		}
		
		return Cache;
	
	})();

}, ['log', 'app']);