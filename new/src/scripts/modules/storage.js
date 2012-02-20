/**
 * storage.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies log.js
 */

OrangeUI.add('storage', function(O) {

	/**
	 * allows the storage and retrieval of objects using the browser's 
	 * local storage cache. supports IE8+.
	 * @module Storage
	 * @uses Log 
	 */
	O.Storage = (function() {
	
		/**
		 * boolean of whether local storage is online or not. Used to check 
		 * if cache can be flushed.
		 * @private 
		 */
		var _isOnline = true,
		_localStorage = null,
		
		keyFilterRegex = /[^A-Za-z_]/g, // filters keys for special chars
		
		UNPACK_OBJ_ERR 	= 1, // when cache object cannot be read
		EXPIRE_OBJ_ERR 	= 2; // when cache object is expired
			
		return {
			
			/**
			 * boolean of whether local storage is supported. defaults to 
			 * false if storage is not initialized.
			 * @public
			 */
			isSupported: false,
		
			/**
			 * sets up the local storage module
			 * @method init
			 * @param object local		a reference to the local storage object
			 * @param bool offline		current connection status
			 * @return null
			 */
			init: function(isOnline) {
				
				if ("localStorage" in window) {
					try {
						window.localStorage.setItem('_test', 1); // attempt to set value
						this.isSupported = true;
						window.localStorage.removeItem('_test');
					} catch (e) {
						// iOS5 Private Browsing mode throws QUOTA_EXCEEDED_ERROR DOM Exception 22
						// via JStorage
					}
				}
				
				if (this.isSupported) {
					try {
						if(window.localStorage) {
						    _localStorage = window.localStorage;
						}
					} catch (e) {
						// Firefox local storage bug when cookies are disabled
						// via JStorage
					}
				}
				else if ("globalStorage" in window) {
					// http is not able to access the same localStorage obj as https
					// however when supported globalStorage can
					try {
						if(window.globalStorage) {
						    _localStorage = window.globalStorage[window.location.hostname];
						    this.isSupported = true;
						}
					} catch(e) {}
				} else {
					// TODO: add support for IE 6/7 userDataa
				}
				
				// check for native JSON parsing support
				if (typeof JSON === "undefined" || JSON.stringify == undefined) {
					this.isSupported = false;
				}
				
				// set connection status
				_isOnline = (isOnline != undefined) ? isOnline : true;
				
				if (this.isSupported) {
					O.Log.info("Local storage loaded in " + (_isOnline ? "online" : "offline") + " mode");
				}
				else {
					O.Log.warn("Local storage not supported");
				}
				
			},
			
			/**
			 * sets a value to the local storage cache
			 * @method set
			 * @param string key	key that maps object in dictionary
			 * @param object value	object to store in dictionary
			 * @param int ttl		time to live in milliseconds
			 * @return bool
			 */
			set: function(key, value, ttl) {
			
				if(!this.isSupported) return false; // don't do anything if not supported
				
				key = key.replace(keyFilterRegex); // filter key for special chars
				
				// null check
				if (value == undefined) {
					return false;
				}
				
				// build storage object
				var obj = {
					data: value,
					timestamp: (new Date()).getTime(),
					ttl: ttl ? ttl : (24 * 60 * 60 * 1000) // 24 hours
				};
				
				try {
					_localStorage.setItem(key, JSON.stringify(obj)); // store object
					O.Log.info("Set: Inserted object with key (" + key.toString() + ") into local storage");
					return true;
				} catch (e) {
					if (e == QUOTA_EXCEEDED_ERR) {
						O.Log.error("Storage quota has been exceeded", e);
					} else {
						O.Log.error("Could not insert item with key (" + key.toString() + ") into local storage");
					}
				}
				
				return false;
			},
			
			/**
			 * gets a value from the local storage cache
			 * @method get
			 * @param string key	key that maps object in dictionary
			 * @param object alt	default to return if key doesn't exist
			 * @return object
			 */
			get: function(key, alt) {
			
				if(!this.isSupported) return; // don't do anything if not supported
				
				try {
				
					var item = JSON.parse(_localStorage.getItem(key)); // get and parse object
					
					if (item != undefined && item.data != undefined) {
						
						if (_isOnline && item.ttl !== -1 && ((new Date()).getTime() - item.timestamp) > item.ttl) {
							_localStorage.removeItem(key); // remove from local storage
							throw EXPIRE_OBJ_ERR;
						}
						
						O.Log.info("Get: Retrieved object for key (" + key.toString() + ") from local storage");
											
						return item.data; // otherwise return data
						
					} else {
						throw UNPACK_OBJ_ERR;
					}
				} catch (e) {
				
					if (e === UNPACK_OBJ_ERR) {
						O.Log.error("Unpack Error: Could not read local storage object", e);
					} else if (e === EXPIRE_OBJ_ERR) {
						O.Log.debug("Removed expired object from local storage", e);
					} else {
						O.Log.error("Could not load local storage object");
					}
				
				}
				
				return alt; // if not object was found, return passed in default
			},
			
			/**
			 * removes a value from the local storage cache
			 * @method remove
			 * @param string key	key that maps object in dictionary
			 * @return bool
			 */
			remove: function(key) {
			
				if(!this.isSupported) return false; // don't do anything if not supported
				
				try {
				
					_localStorage.removeItem(key); // remove item from local storage array
					O.Log.info("Remove: Object (" + key + ") removed from local storage");
					
				} catch(e) {
					O.Log.error("Could not remove local storage object", e);
				}
			},
			
			/**
			 * flushes all expired data from the cache. if browser is 
			 * offline, you must add the force flag to flush expired data.
			 * @method flushExpired
			 * @param bool force	force flush even in offline mode
			 * @return null
			 */
			flushExpired: function(force) {
			
				if(!this.isSupported) return; // don't do anything if not supported
				
				// prevent clearing in offline mode unless force is enabled
				if(_isOnline === false && force !== true) return;
				
				for (var key in _localStorage) {
					this.Storage.get(key); // fetching data clears expired data
				}
			
			},
			
			/**
			 * flushes all data from the cache. if browser is offline, you 
			 * must add the force flag to flush data.
			 * @method flush
			 * @param bool force	force flush even in offline mode
			 * @return null
			 */
			flush: function(force) {
			
				if(!this.isSupported) return; // don't do anything if not supported
				
				// prevent clearing in offline mode unless force is enabled
				if(_isOnline === false && force !== true) return;
				
				try {
					localStorage.clear(); // clear all items
					O.Log.info("CLEAR: Local storage cleared");
				} catch (e) {
					O.Log.error("Local storage could not be cleared", e);
				} 
			},
			
			/**
			 * should be triggered when application goes online. flushes 
			 * all expired data.
			 * @method goOnline
			 * @return null
			 */
			goOnline: function() {
				_isOnline = true;
			},
			
			/**
			 * should be triggered when application goes offline. sets 
			 * private status to offline so the cache isn't cleared.
			 * @method goOffline
			 * @return null
			 */
			goOffline: function() {
				_isOnline = false;
			}
		
		};
	
	})();

}, ['log']);