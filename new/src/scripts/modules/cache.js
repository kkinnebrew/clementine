/**
 * cache.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies log.js
 */

OrangeUI.add('cache', function(O) {

	O.Cache = (function() {
	
		var _activeProcess = null, // process id for current request
		
		_poll = false, // configuration for polling
		
		_isOnline = false,
		
		Cache = {}, // setup empty cache object
		
		_EventTarget = { fire: function(event) { console.log("Fire: " + event) } },
	
		/**
		 * halts the execution of a status request, before executing another
		 */
		_stop = function() {
			if(_activeProcess != null) {
				clearTimeout(_activeProcess); // kill a active process
				_activeProcess = null;
			}
		},
		
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
				
				
				if(_poll) {
					setTimeout(_statusCallback, 10 * 1000);
				}
			
			}, 100);
			
		},
	
		Cache = {
	
			// reference to the private event target object
			EventTarget: _EventTarget,
		
			/**
			 * binds event listeners for offline mode and cache events
			 */
			init: function(poll) {
						
				// set polling
				_poll = poll;
				
				// check for support
				if (!window.addEventListener) {
				    window.attachEvent("offline", this.checkNetworkStatus);  
				    window.attachEvent("online", this.checkNetworkStatus); 
				}
				else {
				    window.addEventListener("offline", this.checkNetworkStatus, false);  
				    window.addEventListener("online", this.checkNetworkStatus, false); 
				}
			},
			
			/**
			 * checks the current browser's network status
			 */
			checkNetworkStatus: function() {
				_statusCallback();
			}
		
		};
		
		return Cache;
	
	})();

}, ['log']);