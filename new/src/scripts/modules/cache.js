/**
 * cache.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies log.js
 */

OrangeUI.add('cache', function(O) {

	/**
	 * handles the manangement of network status events
	 * and the cache manifest.
	 * @module Cache
	 * @uses Log 
	 */
	O.Cache = (function() {
		
		/**
		 * boolean of whether local storage is online or not. Used to check 
		 * if cache can be flushed.
		 * @private 
		 */
		var _activeProcess = null,
		_poll = false, // whether or not to poll
		_isOnline = false, // if the connection is live
		
		/**
		 * all events listening for network status changes
		 * should bind on to the public instance of this event
		 * @private 
		 */
		_EventTarget = { fire: function(event) { console.log("Fire: " + event) } }, // TEMPORARY, replace with event target object
		
		
		/**
		 * stops the execution of a status request
		 * @method _stop
		 * @return null
		 */
		_stop = function() {
			if(_activeProcess != null) {
				clearTimeout(_activeProcess); // kill a active process
				_activeProcess = null;
			}
		},
		
		/**
		 * submits a request to check the status of the network. attempts to
		 * first check browser onLine property, then proceeds to poll a remote
		 * connection to verify status.
		 * @method _statusCallback
		 * @return null
		 */
		_statusCallback = function() {
		
			// halt current process
			_stop();
						
			// store process id to prevent concurrent runs
			_activeProcess = setTimeout(function() {
			
				// preliminary check
				if (navigator.onLine) {
				  
				  // attempt to confirm connection by polling server
				  $.ajax({
				      async: true,
				      cache: false,
				      context: this,
				      dataType: "json",
				      error: function (req, status, ex) {
				      	if(_isOnline === true) _EventTarget.fire("offline"); // connection is not online
				      	_isOnline = false;
				      },
				      success: function (data, status, req) {
				      	if(_isOnline === false) _EventTarget.fire("online"); // connection is online
				      	_isOnline = true;
				      },
				      timeout: 3000,
				      type: "GET",
				      url: "js/ping.js"
				  });
				  
				  // TODO: we may need to handle edge cases where $.ajax fails sliently
				  
				} else {
					// give the browse time to override request
					setTimeout(function() {
						if(_isOnline === true) _EventTarget.fire("offline"); // fire offline event
						_isOnline = false;
					}, 100);
				}
			
				_activeProcess = null; // clear process and prepare for new execution
				
				// poll if we have set polling to active
				if(_poll) {
					setTimeout(_statusCallback, 10 * 1000);
				}
			
			}, 100);
		
		},
		
		/**
		 * when all cached assets have completed downloading
		 * @method _onCached
		 * @return null
		 */
		_onCached = function(e) {
			O.Log.info("Cache: All resources for this web app have now been downloaded. You can run this application while not connected to the internet");
		},
		
		/**
		 * when checking cache manifest file
		 * @method _onChecking
		 * @return null
		 */
		_onChecking = function() {
			O.Log.info("Cache: Checking for cache manifest");
		},
		
		/**
		 * beginning the download of cached assets
		 * @method _onDownloading
		 * @return null
		 */
		_onDownloading = function() {
			O.Log.info("Cache: Starting download of cached files");
		},
		
		/**
		 * if the cache manifest file is malformed or connection is offline
		 * @method _onError
		 * @return null
		 */
		_onError = function() {
			O.Log.warn("Cache: There was an error in the manifest, downloading cached files or you're offline");
		},
		
		/**
		 * no change from previous cache version
		 * @method _onNoUpdate
		 * @return null
		 */
		_onNoUpdate = function() {
			O.Log.info("Cache: There was no update needed");
		},
		
		/**
		 * called while downloading files
		 * @method _onProgress
		 * @return null
		 */
		_onProgress = function() {
			O.Log.info("Cache: Downloading cached files");
		},
		
		/**
		 * when objects from the cache are completed loading, the page
		 * is refreshed to use the new content
		 * @method _onUpdateReady
		 * @return null
		 */
		_onUpdateReady = function() {
				
			window.applicationCache.swapCache();
			O.Log.info("Cache: Updated cache has been loaded and is ready");
		
			// the new cache will not be used until the page refreshes
			window.location.reload(true);
		
		};
		
		return {
		
			/**
			 * public variable referencing the EventTarget on which
			 * online and offline events are fired
			 * @public
			 */
			EventTarget: _EventTarget,
			
			/**
			 * sets up the caching and offline mode module
			 * @method init
			 * @param bool poll		whether or not to poll
			 * @return null
			 */
			init: function (poll) {
			
				// set polling
				_poll = poll;
				
				// check for support
				if (!window.addEventListener) {
					
					// bind connection listeners
				    window.attachEvent("offline", 	_statusCallback);  
				    window.attachEvent("online", 	_statusCallback); 
				    
				    // bind cache manifest listeners
				    window.attachEvent("cached", 		_onCached); 
				    window.attachEvent("checking", 		_onChecking); 
				    window.attachEvent("downloading", 	_onDownloading); 
				    window.attachEvent("error", 		_onError); 
				    window.attachEvent("noupdate", 		_onNoUpdate); 
				    window.attachEvent("progress", 		_onProgress); 
				    window.attachEvent("updateready", 	_onUpdateReady);
				    
				}
				else {
					
					// bind connection listeners
				    window.addEventListener("offline", this.checkNetworkStatus, false);  
				    window.addEventListener("online", this.checkNetworkStatus, false);
				    
				    // bind cache manifest listeners
				    window.addEventListener("cached", 		_onCached); 
				    window.addEventListener("checking", 	_onChecking); 
				    window.addEventListener("downloading", 	_onDownloading); 
				    window.addEventListener("error", 		_onError); 
				    window.addEventListener("noupdate", 	_onNoUpdate); 
				    window.addEventListener("progress", 	_onProgress); 
				    window.addEventListener("updateready", 	_onUpdateReady);
				    
				}
			
			},
			
			/**
			 * executes a network status check, fires online/offline event if
			 * the status has changed
			 * @method checkNetworkStatus
			 * @return null
			 */
			checkNetworkStatus: function() {
				_statusCallback();
			}
		
		};
	
	})();

}, ['log']);