/**
 * storage.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies log.js, Modernizr 2.0.6
 */

OrangeUI.add('storage', function(O) {

	O.Storage = (function () {
	
		var Storage = {}
	
	
		/* private constants */
		
		var UNPACK_OBJ_ERR 	= 1; // when cache object cannot be read
		var EXPIRE_OBJ_ERR 	= 2; // when cache object is expired
		
		var EXPIRE_NONE = -1; // denotes persistent object
		
		
		/* private variables */
		
		var keyFilterRegex 	= /[^A-Za-z_]/g;
		
		var isSupported 	= false; // if local storage is supported
		var isOnline 		= false; // if connection is live
	
		
		/* private methods */
		
		var flushExpiredData = function() {
			
			for (var key in localStorage) {
				Storage.get(key); // fetching data clears expired data
			}
				
		};
		
		/* constructors */
			
		Storage.init = function () {
								
			isSupported = true; // default to true
			
			// check if local storage supported		
			if (!Modernizr.localstorage) {
							
				isSupported = false; // mark as unsupported
				
				O.Log.warn("Local storage not supported in your browser");
			}
			
			// check if native JSON supported
			if (JSON == undefined || JSON.stringify == undefined) {
			
				isSupported = false; // mark as unsupported
				
				O.Log.warn("Native JSON is not supported in your browser");
			}
					
			if (!isSupported) O.Log.warn("Local storage could not be initialized");
			else O.Log.info("Local storage loaded in " + (O.App.isOnline ? "online" : "offline") + " mode");
		};
			
			
		/* data accessors */
			
		Storage.set = function (key, value, ttl) {
			
			if (!isSupported) return; // don't set items if unsupported
		
			name = name.replace(keyFilterRegex); // filter name for special chars
			
			// check for null objects
			if (value == undefined) {
				O.Log.warn("Could not store null object with key (" + key + ")");
				return;
			}
		
			// build storage item
			var obj = {
				data: value,
				timestamp: (new Date()).getTime(),
				ttl: ttl ? ttl : (24 * 60 * 60 * 1000) // 6 hours
			};
		
			try {
				
				localStorage.setItem(key, JSON.stringify(obj)); // store item into local storage
			
			} catch (e) {
			
				if (e == QUOTA_EXCEEDED_ERR) {
					O.Log.error("Storage quota has been exceeded", e);
				} else {
					O.Log.error("Could not insert item with key (" + key.toString() + ") into local storage");
				}
			
			} finally {
				O.Log.info("SET: Inserted object with key (" + key.toString() + ") into local storage");
			}
		
		};
			
		Storage.get = function (key, alt) {
		
			if (!isSupported) return; // don't return items if unsupported
			
			try {
				
				var item = JSON.parse(localStorage.getItem(key)); // get and parse local storage item
				
				if (item != undefined && item.data != undefined) {
				
					// remove expired items
					if (isOnline && item.ttl !== -1 && ((new Date()).getTime() - item.timestamp) > item.ttl) {
																	
						this.remove(key); // remove from local storage
	
						throw EXPIRE_OBJ_ERR; // throw expire exception
					}
					
					O.Log.info("GET: Retrieved object for key (" + key.toString() + ") from local storage");
										
					return item.data; // otherwise return data
									
				} else {
					throw UNPACK_OBJ_ERR; // throw unpack exception
				}
				
			} catch (e) {
			
				if (e === UNPACK_OBJ_ERR) {
					O.Log.error("Unpack Error: Could not read local storage object", e);
				} else if (e === EXPIRE_OBJ_ERR) {
					O.Log.debug("Removed expired object from local storage");
				} else {
					O.Log.error("Could not load local storage object");
				}
			
			}
			
			return alt; // if not object was found, return passed in default
		
		};
			
		Storage.remove = function(key, force) {
		
			if(!isOnline || force) return; // don't clear items if offline
		
			try {
				localStorage.removeItem(key); // remove item from local storage array
			} catch(e) {
				O.Log.error("Could not remove local storage object", e);
			} finally {
				O.Log.info("REMOVE: Object (" + key + ") removed from local storage");
			}
		
		};
			
		Storage.flush = function (force) {
		
			try {
				localStorage.clear(); // clear all items
			} catch (e) {
				O.Log.error("Local storage could not be cleared", e);
			} finally {
				O.Log.info("CLEAR: Local storage cleared");
			}
		
		};
		
		
		/* state properties */
		
		Storage.isSupported = function() {
			return isSupported;
		}
			
		Storage.isOnline = function () {
			return isOnline;
		};
			
		Storage.isOffline = function () {
			return !isOnline;
		};
			
		Storage.goOffline = function () {
			isOnline = false; // set flag
		};
			
		Storage.goOnline = function () {
		
			isOnline = true; // set flag
						
			flushExpiredData(); // clears expired data from cache
		};
		
		return Storage;
	
	})();

}, ['log']);

