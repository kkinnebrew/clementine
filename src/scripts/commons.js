/**
 * commons.js | OrangeUI Commons 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none
 * @description commons for adding module support and HTML5 extentions
 */
 
(function (window, document) {

	/* Variable Definitions */

	var version = '0.1',
	
	OrangeUI = {},
	
	
	// global regular expressions
	modFilterRegex = /[^-A-Za-z_]/g,
	keyFilterRegex = /[^A-Za-z_]/g; // filters keys for special chars
	
	OrangeUI._modules = {}; // stores application extension modules
	OrangeUI._apps = {}; // stores application settings
	
	OrangeUI._config = {}; // current configuration
	
	
	/* Common Methods */
	
	if (typeof(console) == "undefined") {
	  console = { log: function() { }, dir: function() { } };
	}
	
	function noop() {}
	
	function clone(o) {
		var newObj = (o instanceof Array) ? [] : {};
		for (i in o) {
		  if (i == 'clone') continue;
		  if (o[i] && typeof o[i] == "object") {
		    newObj[i] = clone(o[i]);
		  } else newObj[i] = o[i];
		} return newObj;
	}
	
	window.cloneAttributes = function(source, destination) {
		var destination = $(destination).eq(0);
    var source = $(source)[0];
    for (i = 0; i < source.attributes.length; i++) {
        var a = source.attributes[i];
        destination.attr(a.name, a.value);
    }
	}
	
	/* OOP */
		
	OrangeUI.define = function(def) {
		return Class.extend(def);
	};
	
	OrangeUI.extend = function(base, def) {
		return base.extend(def);
	};

	
	/* Logging */
	
	OrangeUI.Log = (function() {
	
		var LOG_DEBUG = 1;
		var	LOG_INFO 	= 2;
		var	LOG_ERROR = 3;
	
		var _log = [],
		_logLevel = LOG_DEBUG,
		
		_writeLog = function(level, message, ex) {
		
			// build log entry
			var entry = {
				message: message,
				ex: ex != undefined ? ex : null,
				level: level,
				timestamp: (new Date()).getTime()
			};
					
			// write message
			if(level >= _logLevel) {
					
				switch(level) {
					case LOG_DEBUG:
						console.log("[DEBUG] " + message.toString());
						break;
					case LOG_INFO:
						console.log("[INFO] " + message.toString());
						break;
					case LOG_ERROR:
						console.log("[ERROR] " + message.toString());
						break;
				}
			}
			
			// push on log list
			_log.push(entry);
		
		};
		
		return {
	
			info: function(message, ex) {
				_writeLog(LOG_INFO, message, ex);
			},
		
			debug: function(message, ex) {
				_writeLog(LOG_DEBUG, message, ex);
			},
			
			error: function(message, ex) {
				_writeLog(LOG_ERROR, message, ex);
			}
	
		}
	
	})();
	
	
	/* Event Handling */
	
	OrangeUI.Event = OrangeUI.define({
	
		initialize: function(type, currentTarget, target, data) {
			this.bubbles = true;
			this.type = type;
			this.currentTarget = currentTarget;
			this.target = target;
			this.data = data;
		},
		
		stopPropagation: function() {
		this.bubbles = false;
		}
	
	});
	
	OrangeUI.EventTarget = OrangeUI.define({
	
		initialize: function(parent, self) {
			this._listeners = {};
			this._parent = parent;
			this._self = self;
		},
		
		on: function(ev, call) {
				
			if (typeof this._listeners[ev] === 'undefined'){
				this._listeners[ev] = [];
			}
			this._listeners[ev].push(call);
		
		},
		
		fire: function(ev, data) {
			
			var parent = this._parent;

			if (typeof ev === 'string') ev = new OrangeUI.Event(ev, this._self, this._self, data);
			if (typeof ev.type !== 'string') throw "Error: Invalid 'type' when firing event";
			
			if (this._listeners[ev.type] instanceof Array) {
				var listeners = this._listeners[ev.type];
				for (var i = 0, len = listeners.length; i < len; i++) listeners[i].call(this, ev);
			}
			if (parent != null && parent._eventTarget instanceof OrangeUI.EventTarget && ev.bubbles) {
				ev.currentTarget = this._parent;
				parent._eventTarget.fire.call(parent._eventTarget, ev, data);
			}
		
		},
		
		detach: function(ev, call) {
			
			if (this._listeners[ev] instanceof Array) {
				var listeners = this._listeners[ev];
				for (var i = 0, len = listeners.length; i < len; i++) {
					if (typeof call !== 'undefined' && listeners[i] === call) {
						listeners.splice(i, 1);
						break;
					} else listeners.splice(i, 1);
				}
			} else if (typeof ev === 'undefined') {
				this._listeners = {};
			}
			
		}
	
	});
	
	
	OrangeUI._eventTarget = new OrangeUI.EventTarget(null, OrangeUI)
		
	var _bindEvent = function(obj, evt, fn) {
	
		if(obj.addEventListener) {
			obj.addEventListener(evt, fn, false);
		} else if(obj.attachEvent) {
			obj.attachEvent('on'+evt,fn);
		}
		
	};
	
	var _unbindEvent = function() {
	
		if(obj.removeEventListener) {
			obj.removeEventListener(evt, fn, false);
		} else if(obj.detachEvent) {
			obj.detachEvent('on'+evt,fn);
		}
	
	};
	
	
	/* Module Loaders */
	
	OrangeUI.Loader = (function() {
	
		var _modules = {};
		
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
				
				_modules[name] = mod;
				
			},
			
			loadModule: function(name) {
								
				if (typeof OrangeUI._modules[name] !== 'undefined') {
					return; // module already loaded
				}
			
				if(_modules[name] != undefined) {
					
					// set as loaded
					OrangeUI._modules[name] = true;
												
					// load dependencies
					for(var i = 0, len = _modules[name].req.length; i < len; i++) {
						if(_modules[name].req[i] === name) continue;
						this.loadModule(_modules[name].req[i]);
					}
				
					// load module
					_modules[name].fn.call(window, OrangeUI); // execute with OrangeUI as context
					
					OrangeUI.Log.info('Module "' + name + '" loaded');
				}
				
			}
		
		};
	
	})();
	
	
	/* Module Handlers */
	
	OrangeUI.add = function() {
	
		var args = arguments,
			name = args[0],
			fn = ( typeof args[1] === 'function' ) ? args[1] : null,
			req = args[2];
														
		OrangeUI.Loader.addModule(name, fn, req);
	
	};
	
	OrangeUI.use = function() {
	
		var args = Array.prototype.slice.call(arguments),
			fn = args[args.length-1],
			req = clone(args).splice(0, args.length-1)
										
		// load modules
		if(typeof req[0] != 'function') { 
			for (var i = 0, len = req.length; i < len; i++) {
				OrangeUI.Loader.loadModule(req[i]);
			}
		}
		
		fn.call(window, OrangeUI);
	
	};
	
	OrangeUI.namespace = function(name) {
	
		if(OrangeUI[name] == undefined) {
			OrangeUI[name] = {};
		}
	
	};
	
	OrangeUI.app = function(name, config) {
		var name = name.replace(keyFilterRegex);
		OrangeUI._apps[name] = config;
		OrangeUI.Log.info('Added application ' + name);
	};
	
	OrangeUI.init = function(name) {
	
		var config = {}, name = name.replace(keyFilterRegex);
	
		if(OrangeUI._apps[name] != null) {
			config = OrangeUI._apps[name];
		}
		
		// load module
		for(var i = 0, len = config.required.length; i < len; i++) {
			OrangeUI.Loader.loadModule(config.required[i]);
		}
	
		// bind event listeners
		OrangeUI.Cache.on('statusChange', function(e) {
			if(e.data == 1) {
				OrangeUI.Location.goOnline();
				OrangeUI.Storage.goOnline();
				if(config.location) OrangeUI.Location.getLocation(function() {});
				OrangeUI.Log.info("Application went online");
			} else {
				OrangeUI.Log.info("Application went offline");
				OrangeUI.Location.goOffline();
				OrangeUI.Storage.goOffline();
			}
		});
		
		// start modules
		OrangeUI.Cache.init(config.poll);
		OrangeUI.Storage.init();
				
		// call root function
		var root = $('[data-root="true"]'),
		type = root.attr('data-view');
		root.removeAttr('data-root');
		var c = OrangeUI.View.load(type);
		var controller = new c(null, root);
		controller.onLoad();
	
	};
	
	
	/* Request Handlers */
	var _request = (function() {
	
		var XMLHttpRequests = [
			function() { return new XMLHttpRequest() },
			function() { return new ActiveXObject('Msxml2.XMLHTTP') },
			function() { return new ActiveXObject('Msxml3.XMLHTTP') },
			function() { return new ActiveXObject('Microsoft.XMLHTTP') }
		],
		
		createXMLHttpObject = function() {
			var obj = false;
			for(var i = 0, length = XMLHttpRequests.length; i < length; i++) {
				try {
					obj = XMLHttpRequests[i]();
				} catch(e) {
					continue;
				}
			}
			return obj;	// TO DO: reuse instantiated XmlHttpRequest objects 
		};
	
		return {
		
			sendRequest: function(url, method, data, success, error) {
				
				var req = createXMLHttpObject();
				if(!req) return;
								
				req.open(method, url, true);
				req.setRequestHeader('Cache-Control', 'no-cache');
				req.timeout = 3000;
				req.ontimeout = function () { error(req); }
								
				req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
				req.onreadystatechange = function () {
					if(req.readyState != 4) return;
					if(req.status != 200 && req.status != 304) {
						error(req);
					}
					success(req);
				}
				
				if (req.readyState == 4) {
					success(req); return;
				}
				
				req.send(data);
			}
		
		};
	
	})();
	
	
	/* Application Cache */		
	OrangeUI.Cache = (function() {
		
		var _activeProcess = null,
		_poll = false, // whether or not to poll
		_isOnline = false, // if the connection is live
		_isLoaded = false,
						
		_stop = function() {
			if(_activeProcess != null) {
				clearTimeout(_activeProcess); // kill a active process
				_activeProcess = null;
			}
		},
		
		_statusCallback = function() {
			
			if(navigator.onLine && !_isLoaded) {
				_isOnline = true;
				_isLoaded = true;
				_target.fire("statusChange", 1); // connection is online
				return;
			}
			
			_stop();
												
			_activeProcess = setTimeout(function() {
								
				// preliminary check
				if(navigator.onLine && !_isLoaded) {
					_isOnline = true;
					_isLoaded = true;
					_target.fire("statusChange", 1); // connection is online
				}
				else if (navigator.onLine) {
				  				  				  				  
				  // attempt to confirm connection by polling server
				  _request.sendRequest('ping.js', "GET", null, 
					  function(req) {
					  	if(_isOnline === false) _target.fire("statusChange", 1); // connection is online
					  	_isOnline = true;
					  },
					  function(req) {
					  	if(_isOnline === true) _target.fire("statusChange", 0); // connection is not online
					  	_isOnline = false;
					  }
				  );
				  
				  // TODO: we may need to handle edge cases where $.ajax fails sliently
				  
				} else {

					setTimeout(function() {
						if(_isOnline === true) _target.fire("statusChange", 0); // fire offline event
						_isOnline = false;
					}, 100);
				}
			
				_activeProcess = null; // clear process and prepare for new execution
				
				// poll if we have set polling to active
				if(_poll) {
					setTimeout(_statusCallback, 10 * 1000);
				}
			
			}, (_isLoaded ? 100 : 0));
		
		},
		
		_onCached = function(e) {
			OrangeUI.Log.info("Cache: All resources for this web app have now been downloaded. You can run this application while not connected to the internet");
		},
		
		_onChecking = function() {
			OrangeUI.Log.info("Cache: Checking for cache manifest");
		},

		_onDownloading = function() {
			OrangeUI.Log.info("Cache: Starting download of cached files");
		},
		
		_onError = function() {
			OrangeUI.Log.debug("Cache: There was an error in the manifest, downloading cached files or you're offline");
		},
		
		_onNoUpdate = function() {
			OrangeUI.Log.info("Cache: There was no update needed");
		},
		
		_onProgress = function() {
			OrangeUI.Log.info("Cache: Downloading cached files");
		},
		
		_onUpdateReady = function() {
			window.applicationCache.swapCache();
			OrangeUI.Log.info("Cache: Updated cache has been loaded and is ready");
			window.location.reload(true);
		},
						
		_target = new OrangeUI.EventTarget(null, Cache),
				
		Cache = {
			
			init: function (poll) {
				
				_poll = poll; // set polling

				// bind event listeners
				_bindEvent(window, "offline", _statusCallback);
				_bindEvent(window, "online", _statusCallback);
				_bindEvent(window, "cached", _statusCallback);
				_bindEvent(window, "checking", _statusCallback);
				_bindEvent(window, "downloading", _statusCallback);
				_bindEvent(window, "error", _statusCallback);
				_bindEvent(window, "noupdate", _statusCallback);
				_bindEvent(window, "progress", _statusCallback);
				_bindEvent(window, "updateready", _statusCallback);
								
				// get status
				_statusCallback();
				
			},
			
			updateNetworkStatus: function() {
				_statusCallback();
			},
			
			on: function(event, callback) {
				_target.on(event, callback);
			},
			
			detach: function(event, callback) {
				_target.detach(event, callback);
			},
			
			isOnline: function() {
				return _isOnline;
			}
		
		};
		
		return Cache;
	
	})();
		
	
	/* Local Storage */
	OrangeUI.Storage = (function() {
	
		var _isOnline = false,
		_localStorage = null,
				
		UNPACK_OBJ_ERR 	= 1, // when cache object cannot be read
		EXPIRE_OBJ_ERR 	= 2; // when cache object is expired
			
		return {
			
			isSupported: false,
		
			init: function() {
								
				if ("localStorage" in window) {
					try {
						window.localStorage.setItem('_test', 1); // attempt to set value
						this.isSupported = true;
						window.localStorage.removeItem('_test');
					} catch (e) {} // iOS5 Private Browsing mode throws QUOTA_EXCEEDED_ERROR DOM Exception 22 via JStorage
				}
				
				if (this.isSupported) {
					try {
						if(window.localStorage) {
						    _localStorage = window.localStorage;
						}
					} catch (e) {} // Firefox local storage bug when cookies are disabled via JStorage
				}
				else if ("globalStorage" in window) {
					try {
						if(window.globalStorage) {
						    _localStorage = window.globalStorage[window.location.hostname];
						    this.isSupported = true;
						}
					} catch(e) {}
				} else {} // TODO: add support for IE 6/7 userData
				
				// check for native JSON parsing support
				if (typeof JSON === "undefined" || JSON.stringify == undefined) {
					this.isSupported = false;
				}

				if (this.isSupported) {
					OrangeUI.Log.info("Local storage loaded");
				}
				else {
					OrangeUI.Log.debug("Local storage not supported");
				}
				
			},
			
			set: function(key, value, ttl) {
			
				if(!this.isSupported) return false; // don't do anything if not supported
				key = key.replace(keyFilterRegex); // filter key for special chars
				
				if (value == undefined) {
					return false;
				}
				
				var obj = {
					data: value,
					timestamp: (new Date()).getTime(),
					ttl: ttl ? ttl : (24 * 60 * 60 * 1000) // 24 hours
				};
				
				try {
					_localStorage.setItem(key, JSON.stringify(obj)); // store object
					OrangeUI.Log.info("Set: Inserted object with key (" + key.toString() + ") into local storage");
					return true;
				} catch (e) {
					if (e == QUOTA_EXCEEDED_ERR) {
						OrangeUI.Log.error("Storage quota has been exceeded", e);
					} else {
						OrangeUI.Log.error("Could not insert item with key (" + key.toString() + ") into local storage");
					}
				}
				return false;
			},
			
			get: function(key, alt) {
			
				if(!this.isSupported) return; // don't do anything if not supported
				
				try {
					var item = JSON.parse(_localStorage.getItem(key)); // get and parse object
					if (item != undefined && item.data != undefined) {
						if (_isOnline && item.ttl !== -1 && ((new Date()).getTime() - item.timestamp) > item.ttl) {
							_localStorage.removeItem(key); // remove from local storage
							throw EXPIRE_OBJ_ERR;
						}
						OrangeUI.Log.info("Get: Retrieved object for key (" + key.toString() + ") from local storage");
						return item.data; // otherwise return data
					} else {
						throw UNPACK_OBJ_ERR;
					}
				} catch (e) {
					if (e === UNPACK_OBJ_ERR) {
						OrangeUI.Log.error("Unpack Error: Could not read local storage object", e);
					} else if (e === EXPIRE_OBJ_ERR) {
						OrangeUI.Log.debug("Removed expired object from local storage", e);
					} else {
						OrangeUI.Log.error("Could not load local storage object");
					}
				}
				
				return alt; // if not object was found, return passed in default
			},

			remove: function(key) {
			
				if(!this.isSupported) return false; // don't do anything if not supported
				
				try {
					_localStorage.removeItem(key); // remove item from local storage array
					OrangeUI.Log.info("Remove: Object (" + key + ") removed from local storage");
					
				} catch(e) {
					OrangeUI.Log.error("Could not remove local storage object", e);
				}
			},
			
			flushExpired: function(force) {
			
				if(!this.isSupported) return; // don't do anything if not supported
				
				// prevent clearing in offline mode unless force is enabled
				if(_isOnline === false && force !== true) return;
				
				for (var key in _localStorage) {
					this.Storage.get(key); // fetching data clears expired data
				}
			
			},
			
			flush: function(force) {
			
				if(!this.isSupported) return; // don't do anything if not supported
				if(_isOnline === false && force !== true) return; // prevent clearing in offline mode unless force is enabled
				
				try {
					localStorage.clear(); // clear all items
					OrangeUI.Log.info("Clear: Local storage cleared");
				} catch (e) {
					OrangeUI.Log.error("Local storage could not be cleared", e);
				} 
			},
			
			goOnline: function() {
				_isOnline = true;
			},

			goOffline: function() {
				_isOnline = false;
			}
		
		};
	
	})();
	
	
	/* Geolocation */
	OrangeUI.Location = (function() {
	
		var _location = null, // stores most recent location
		_timestamp = null, // the last time the location was fetched
		_expire = 60 * 60 * 1000, // location expiration
		_isOnline = false,
		
		_fetchLocation = function(success, failure) {
				
			if(!_isExpired()) { // if location already fetched and not expired, return cache location
				if(typeof success !== 'undefined') success(_location);
			} 
			else if(_isOnline) { // if location is expired or not fetched, and we're online fetch it
				
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(position) {
						_timestamp = (new Date().getTime());
						_location = position.coords;
						OrangeUI.Log.info('Location retrieved');
						success(position.coords);
					},
					function(error) {
						switch (error.code) 
						{
							case error.TIMEOUT:
								OrangeUI.Log.error('Location services timeout');
								break;
							case error.POSITION_UNAVAILABLE:
								OrangeUI.Log.error('Position unavailable');
								break;
							case error.PERMISSION_DENIED:
								OrangeUI.Log.error('Please Enable Location Services');
								break;
							default:
								OrangeUI.Log.error('Unknown location services error');
								break;
						}
						if(typeof failure === 'function') failure();
					});
				}
			} 
			else {
				if(typeof failure === 'function') {
					OrangeUI.Log.info('Could not retrieve location');
					failure();
				}
			}
			
		},
		
		_isExpired = function() {
			return ((new Date()).getTime() - _timestamp) > _expire;
		}
		
		return {
		
			getLocation: function(success, failure) {
				_fetchLocation(success, (typeof failure === 'function' ? failure : null));
			},
		
			goOnline: function() {
				_isLoaded = true;
				_isOnline = true;
			},
			
			goOffline: function() {
				_isOnline = false;
			}
		
		};
	
	})();	
	
	
	window.Orange = OrangeUI;	

})(this, this.document);