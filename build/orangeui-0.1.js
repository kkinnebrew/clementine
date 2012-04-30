(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.initialize )
        this.initialize.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();
(function (window, document) {

	/* Variable Definitions */

	var version = '0.1',
	
	OrangeUI = {},
	
	
	// global regular expressions
	modFilterRegex = /[^-A-Za-z_]/g,
	keyFilterRegex = /[^A-Za-z0-9_\[\]]/g; // filters keys for special chars
	
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
					OrangeUI.Log.info("Set: Inserted object with key '" + key.toString() + "' into local storage");
					return true;
				} catch (e) {
					if (e == QUOTA_EXCEEDED_ERR) {
						OrangeUI.Log.error("Storage quota has been exceeded", e);
					} else {
						OrangeUI.Log.error("Could not insert item with key '" + key.toString() + "' into local storage");
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
						OrangeUI.Log.info("Get: Retrieved object for key '" + key.toString() + "' from local storage");
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
					OrangeUI.Log.info("Remove: Object '" + key + "' removed from local storage");
					
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
/**
 * ui.js | OrangeUI 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2
 * @description base view and controllers
 */

Orange.add('ui', function(O) {

	/* view handling */

	O.View = (function() {
	
		var _views = {};
		
		return {
		
			define: function(def) {
				var c = O.extend(O.ViewController, def), type = def.type;
				c.prototype.typeList = 'ui-view ' + type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _views[type] = c;
			},
			
			extend: function(base, def) {
				var c = O.extend(base, def), type = def.type;
				c.prototype.typeList += ' ' + type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _views[type] = c;
			},
			
			load: function(name) {
				var view;
				if (name === 'ui-view') {
					return O.ViewController;
				}
				else if (typeof (view = _views[name]) !== 'undefined') {
					return view;
				} else throw "Error: View '" + name + "' not found";
			}
		
		};
	
	})();
	

	O.ViewController = O.define({
	
		type: 'ui-view',
	
		initialize: function(parent, target) {
				
			var that = this;
					
			this.target = $(target);
			this.name = this.target.attr('data-name');
			
			if (this.target.length === 0) throw 'Invalid view source';
			
			this._views = {};
			this._forms = {};
			this._elements = {};
			this._eventTarget = new O.EventTarget(parent, this);
			
			var viewList = [];
			
			this.target.find('[data-view]').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					parent = $(parent).parent().not(that.target);
					if ($(parent).not('[data-view]').length === 0) count++;
				}
				if (count === 0) viewList.push(this);
			});
						
			for(var i=0, len = viewList.length; i < len; i++) {
				var view = $(viewList[i]),
						name = view.attr('data-name'),
				 		type = view.attr('data-view'),
				 		isRemote = (typeof view.attr('data-template') !== 'undefined') ? view.attr('data-template').length > 0 : false,
				 		path = view.attr('data-template');
				 						
				if (isRemote) {
					var source = O.TemplateManager.load('app/views/' + path);
					view.html($(source).html());
					cloneAttributes(source, view);
					view.removeAttr('data-template');
				}
														 		
				var c = O.View.load(type);
				var child = new c(this, view);
				
				that._views[name] = child;
			}
			
			var formList = [];
					
			this.target.find('form').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					if ($(parent).not('[data-view]').length === 0) count++;
					parent = $(parent).parent().not(that.target);
				}
				if (count === 0) formList.push(this);
			});
						
			for(var i=0, len = formList.length; i < len; i++) {
				var form = $(formList[i]),
						name = form.attr('name'),
						child = new O.Form(form);
				this._forms[name] = child;
			}
			
			var elementList = [];
					
			this.target.find('[data-element]').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					if ($(parent).not('[data-view]').length === 0) count++;
					parent = $(parent).parent().not(that.target);
				}
				if (count === 0) elementList.push(this);
			});
						
			for(var i=0, len = elementList.length; i < len; i++) {
				var el = $(elementList[i]),
						name = el.attr('data-name'),
				 		type = el.attr('data-element'),
				 		isRemote = (typeof el.attr('data-template') !== 'undefined') ? el.attr('data-template').length > 0 : false,
				 		path = el.attr('data-template');
				 						
				if (isRemote) {
					var source = O.TemplateManager.load('app/elements/' + path);
					el.html($(source).html());
					cloneAttributes(source, el);
					el.removeAttr('data-template');
				}
														 		
				var c = O.Element.load(type);
				var child = new c(this, el);
				
				if (typeof name !== 'undefined') that._elements[name] = child;
				child.onLoad();
			}
						
			this.target.addClass(this.typeList);
						
			console.log("[INFO] View '" + this.name + "' of type '" + this.type + "' initialized");
		
		},
		
		getView: function(name) {
			if (typeof name === 'object') return name;
			else if (typeof this._views[name] !== 'undefined') return this._views[name];
			throw 'Error: View "' + name + '" not found';
		},
		
		getElement: function(name) {
			if (typeof this._elements[name] !== 'undefined') return this._elements[name];
			throw 'Error: Element "' + name + '" not found';
		},
		
		getForm: function(name) {
			if (this._forms[name] instanceof O.Form) return this._forms[name];
			throw 'Error: Form "' + name + '" not found';
		},
		
		on: function() {
			return this._eventTarget.on.apply(this._eventTarget, arguments);
		},
		
		detach: function() {
			return this._eventTarget.detach.apply(this._eventTarget, arguments);
		},
		
		fire: function() {
			return this._eventTarget.fire.apply(this._eventTarget, arguments);
		},
		
		find: function(selector) {
			return $(this.target).find(selector);
		},
		
		onLoad: function() {
			this.target.removeAttr('data-name');
			this.target.removeAttr('data-view');
			for (var name in this._views) {
				this._views[name].onLoad();
			}
			for (var name in this._elements) {
				this._elements[name].onLoad();
			}
		},
		
		onUnload: function() {
			for (var name in this._views) {
				this._views[name].onUnload();
			}
		},
		
		destroy: function() {
			for (var name in this._views) {
				this._views[name].destroy();
			}
			for (var name in this._forms) {
				this._forms[name].destroy();
			}
			for (var name in this._elements) {
				this._elements[name].destroy();
			}
		}
	
	});
	
	
	/* element handling */
	
	O.Element = (function() {
	
		var _elements = {};
		
		return {
		
			define: function(def) {
				var c = O.extend(O.ElementController, def), type = def.type;
				c.prototype.typeList = 'ui-element ' + type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _elements[type] = c;
			},
			
			extend: function(base, def) {
				var c = O.extend(base, def), type = def.type;
				c.prototype.typeList += ' ' + type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _elements[type] = c;
			},
			
			load: function(name) {
				var el;
				if (name === 'ui-element') {
					return O.ElementController;
				}
				else if (typeof (el = _elements[name]) !== 'undefined') {
					return el;
				} else throw "Error: Element '" + name + "' not found";
			}
		
		};
	
	})();
	
	O.ElementController = O.define({
	
		type: 'ui-element',
	
		initialize: function(parent, target) {
		
			var that = this;
			if(typeof target === 'undefined') {
				target = O.TemplateManager.load('src/elements/' + this.type + '.html');
			}
					
			this.source = (target.html) ? target.html() : target;
			this.data = {};
			this.target = $(target);
			this.parent = parent;
			this.name = this.target.attr('data-name');
			
			this.target.addClass(this.typeList);
			
			if (this.target.length === 0) throw 'Invalid view source';
		
		},
		
		onLoad: function() {
		
			//this.data = { name: 'Kevin', food: [{ name: "Apple" }, { name: "Orange" }] };
			this.processTemplate();
			this.target.removeAttr('data-element');
			this.target.removeAttr('data-name');
			
		},
		
		processTemplate: function() {
		
			// process source
			var source = this.source;
			template = new jsontemplate.Template(source);
			var output = '';
			try {
				output = template.expand(this.data);
			} catch(e) {
				output = source.replace(/{[^)]*}/, '[undefined]');
			}
			this.target.html(output);
			
		},
		
		setData: function(data) {
			this.data = data;
		},
		
		destroy: function() {
			this.data = null;
			this.source = null;
			this.target = null;
			this.name = null;
			delete this.data;
			delete this.source;
			delete this.target;
			delete this.name;
		}
	
	});
	
	
	/* form handling */

	O.Form = O.define({
	
		initialize: function(target) {
			
			var that = this;
			this._fields = {};
			this._target = target;
			
			var name = $(target).attr('name');

			$(target).find('input, select, textarea').each(function() {
				var fieldName = $(this).attr('name');
				that._fields[fieldName] = $(this);
			});
			
			console.log("[INFO] Form '" + name + "' initialized");
		},
		
		get: function(name) {
			if (typeof this._fields[name] !== 'undefined') {
				return this._fields[name];
			}
		},
		
		destroy: function() {
			for (var name in this._fields) {
				this._fields[name].detach();
			}
		}
		
	});
	
	
	/* template handling */
	
	O.TemplateManager = (function() {
		
		var _templates = {},
		
		_fetch = function(path) {
			return $.ajax({
				async: false,
		    contentType: "text/html; charset=utf-8",
		    dataType: "text",
		    timeout: 10000,
		    url: path,
		    success: function() {},
		    error: function() {
					throw "Error: template not found";
		    }
			}).responseText;
		};
		
		return {
		
			load: function(path) {
				if (typeof _templates[path] !== 'undefined') {
					return _templates[path];
				} else if (typeof path !== 'undefined' && path !== '') {
					return _fetch(path);
				}	else {
					throw 'Invalid template path';
				}
			}
		
		}
	
	})();
	
	
	/* browser detection via quirksmode */

	O.Browser = (function() {
	
		var BrowserDetect = {
		
			init: function () {
				this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
				this.version = this.searchVersion(navigator.userAgent)
					|| this.searchVersion(navigator.appVersion)
					|| "an unknown version";
				this.OS = this.searchString(this.dataOS) || "an unknown OS";
				
				// check if mobile
				var useragent = navigator.userAgent.toLowerCase();
				if( useragent.search("iphone") > 0)
				    this.isMobile = true; // iphone
				else if( useragent.search("ipod") > 0)
				    this.isMobile = true; // ipod
				else if( useragent.search("android") > 0)
				    this.isMobile = true; // android
				else this.isMobile = false;
				
			},
			
			searchString: function (data) {
				for (var i=0;i<data.length;i++)	{
					var dataString = data[i].string;
					var dataProp = data[i].prop;
					this.versionSearchString = data[i].versionSearch || data[i].identity;
					if (dataString) {
						if (dataString.indexOf(data[i].subString) != -1)
							return data[i].identity;
					}
					else if (dataProp)
						return data[i].identity;
				}
			},
			
			searchVersion: function (dataString) {
				var index = dataString.indexOf(this.versionSearchString);
				if (index == -1) return;
				return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
			},
			
			dataBrowser: [
				{
					string: navigator.userAgent,
					subString: "Chrome",
					identity: "Chrome"
				},
				{ 	string: navigator.userAgent,
					subString: "OmniWeb",
					versionSearch: "OmniWeb/",
					identity: "OmniWeb"
				},
				{
					string: navigator.vendor,
					subString: "Apple",
					identity: "Safari",
					versionSearch: "Version"
				},
				{
					prop: window.opera,
					identity: "Opera",
					versionSearch: "Version"
				},
				{
					string: navigator.vendor,
					subString: "iCab",
					identity: "iCab"
				},
				{
					string: navigator.vendor,
					subString: "KDE",
					identity: "Konqueror"
				},
				{
					string: navigator.userAgent,
					subString: "Firefox",
					identity: "Firefox"
				},
				{
					string: navigator.vendor,
					subString: "Camino",
					identity: "Camino"
				},
				{		// for newer Netscapes (6+)
					string: navigator.userAgent,
					subString: "Netscape",
					identity: "Netscape"
				},
				{
					string: navigator.userAgent,
					subString: "MSIE",
					identity: "Explorer",
					versionSearch: "MSIE"
				},
				{
					string: navigator.userAgent,
					subString: "Gecko",
					identity: "Mozilla",
					versionSearch: "rv"
				},
				{ 		// for older Netscapes (4-)
					string: navigator.userAgent,
					subString: "Mozilla",
					identity: "Netscape",
					versionSearch: "Mozilla"
				}
			],
			dataOS : [
				{
					string: navigator.platform,
					subString: "Win",
					identity: "Windows"
				},
				{
					string: navigator.platform,
					subString: "Mac",
					identity: "Mac"
				},
				{
					   string: navigator.userAgent,
					   subString: "iPhone",
					   identity: "iPhone/iPod"
			    },
				{
					string: navigator.platform,
					subString: "Linux",
					identity: "Linux"
				}
			]
		
		};
		
		BrowserDetect.init();
		
		return {
			browser: BrowserDetect.browser,
			version: BrowserDetect.version,
			os: BrowserDetect.OS,
			isMobile: BrowserDetect.isMobile
		}
	
	})();

}, ['db'], '0.1');
/**
 * db.js | OrangeUI DB 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons
 * @description handles data requests and persistence
 */
 
Orange.add('db', function(O) {


	/* abstract data access */
	
	O.ModelDefinition = O.define({
	
		type: 'model',
	
		initialize: function(config) {
		
			this.id = config.id;
			this.name = config.name;
			this.fields = config.fields;
			this.path = config.path;
			this.mapItem = config.mapItem;
			this.mapItems = config.mapItems;
			
			// setup event target
			this._eventTarget = new O.EventTarget(null, this);
		
		},
		
		get: function() {
				
			var args = arguments,
					id = (typeof args[0] !== 'function') ? args[0] : null,
					success = (!id) ? args[0] : args[1],
					failure = (!id) ? args[1] : args[2];
			
			// call map function if it exists
			var successItemFunc = function(data) {
			
				// process return data
				data = this._processData($.parseJSON(data));
				
				// call success function
				success.call(this, new O.Item(this, data));
				
				// fire changed event
				this.fire('get', {
					action: action,
					ids: [id],
					data: data
				});
				
			};
			
			// call map function if it exists
			var successItemsFunc = function(data) {
										
				// process return data
				data = this._processItems($.parseJSON(data));
							
				// call success function
				success.call(this, new O.Collection(this, data));
				
				// fire changed event
				this.fire('datachange', {
					action: 'get',
					ids: data.ids,
					data: {}
				});
				
			};
						
			// fetch data
			$.ajax({
			  url: (!id) ? this.path : this.path + id,
			  contentType: 'text/json',
			  type: 'GET',
			  success: (!id) ? $.proxy(successItemsFunc, this) : $.proxy(successItemFunc, this),
			  error: failure
			});
		
		},
		
		save: function(object, success, failure) {
		
			// calculation action
			var action = (object[this.id ? this.id : 'id'] !== null) ? 'update' : 'create';
		
			// call map function if it exists
			var successFunc = function(data) {
			
				// process data
				data = this._processData($.parseJSON(data));
				
				// call success function
				success.call(this, data);
				
				// get id
				var id = data[this.id ? this.id : 'id'];
				
				// fire changed event
				this.fire('datachange', {
					action: action,
					id: id,
					data: data
				});
				
			};
			
			// check if object has been saved
			if (action === 'update') {
			
				$.ajax({
				  url: (!id) ? this.path : this.path + id,
				  contentType: 'text/json',
				  type: 'PUT',
				  data: object,
			  	success: $.proxy(successFunc, this),
				  error: failure
				});
			
			} else {
			
				$.ajax({
				  url: this.path,
				  contentType: 'text/json',
				  type: 'POST',
				  data: object,
				  success: $.proxy(successFunc, this),
				  error: failure
				});

			}
		
		},
		
		delete: function(object, success, failure) {
		
			var key = data[this.id ? this.id : 'id'],
					id = (typeof object === 'object') ? object[key] : object;
			
			// call map function if it exists
			var successFunc = function(data) {
				
				// parse response
				data = $.parseJSON(data);
				
				// clear from local storage
				O.Storage.remove(this.name + '[' + id + ']');
				
				// call success function
				success.call(this, data);
				
				// fire changed event
				this.fire('datachange', {
					action: 'delete',
					id: id,
					data: {}
				});
				
			};
			
			$.ajax({
			  url: (!id) ? this.path : this.path + id,
			  contentType: 'text/json',
			  type: 'DELETE',
			  data: object,
				success: $.proxy(successFunc, this),
			  error: failure
			});
		
		},
		
		_processItems: function(data) {
		
			// map the data if applicable
			if (typeof this.mapItems === 'function') data = this.mapItems(data);
						
			// setup output
			var models = [];
			var ids = [];
			
			// get the id field
			var id = this.id ? this.id : 'id';
						
			// map individual items			
			for (var i = 0, len = data.length; i < len; i++) {
				var model = this._processData(data[i]);
				if (typeof model === 'object') {
					ids.push(model[id]);
					models.push(model);
				}
			}
		
			// return models
			return {
				ids: ids,
				models: models
			};
			
		},
		
		validate: function(data) {
		
			// compare data to our model
			for(var field in this.fields) {
			
				// get source field name
				var source = this.fields[field].name;
				var nullable = (typeof this.fields[field].nullable !== undefined) ? this.fields[field].nullable : true;
				var isNull = (typeof data[source] === 'undefined' || data[source] === '');
			
				// continue if field is not defined
				if (isNull && !nullable) return false;
			} 
		
		},
		
		_processData: function(data) {
		
			// map the data if applicable
			if (typeof this.mapItem === 'function') data = this.mapItem(data);
			
			// create output object
			var model = {};
												
			// map to our model
			for(var field in this.fields) {
			
				// get source field name
				var source = this.fields[field].name;
				var value = (typeof data[source] !== 'undefined') ? data[source] : undefined;
			
				// continue if field is not defined
				if (value === undefined) {
					console.warn("[WARN] Could not parse JSON field '" + field + "' for " + this.name);
					continue;
				}
			
				// set field on output
				model[field] = value;
			}
									
			// get the id of the return
			var id = data[this.id];
			if(id === undefined) throw 'Invalid ID field for ' + this.name;
									
			// push to local storage
			O.Storage.set(this.name + '[' + id + ']', model);
			
			// return model
			return model;
		
		},
		
		on: function() {
			return this._eventTarget.on.apply(this._eventTarget, arguments);
		},
		
		detach: function() {
			return this._eventTarget.detach.apply(this._eventTarget, arguments);
		},
		
		fire: function() {
			return this._eventTarget.fire.apply(this._eventTarget, arguments);
		},
	
	});
	
	O.Model = (function() {
	
		var _models = {};
				
		return {
		
			define: function(def) {
				var c = O.extend(O.ModelDefinition, def), type = def.type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _views[type] = c;
			},
		
			register: function(config) {
				if (typeof config === 'undefined' || typeof config.name === 'undefined') throw "Error: Model definition invalid";
				if (typeof config.type !== 'undefined' && typeof (model = _models[config.type]) !== 'undefined') {
					var c = new model(config);
				}
				else var c = new O.ModelDefinition(config);
				return _models[config.name] = c;
			},
			
			get: function(name) {
				var model;
				if (typeof (model = _models[name]) !== 'undefined') {
					return model;
				} else throw "Error: Model '" + name + "' not found";
			}
		
		};
	
	})();


	/* data containers */

	O.Collection = O.define({
		
		model: null,
		data: [],
		
		initialize: function(model, data) {
		
			// set attributes
			this.model = model;
			this.data = data.models;
			this.ids = data.ids;
			this._data = {};
			
			// get key
			var key = '';
			for(var name in this.model.fields) {
				if (this.model.fields[name].name == this.model.id) {
					key = name;
					break;
				}
			}
						
			// setup data
			for(var i=0; i<data.models.length; i++) {
				this._data[data.models[i][key]] = data.models[i];
			}
					
		},
		
		get: function(id) {
			return (typeof this._data[id] != undefined) ? this._data[id] : null;
		},
		
		intersect: function(array) {
			var int = _.intersection(this.ids, array);
			return int.length;
		},
		
		destroy: function() {
		
		}
			
	});
		
	O.Item = O.define({
	
		model: null,
		item: {},
	
		initialize: function(model, data) {
		
			// set attributes
			this.model = model;
			this.item = data;
		
		},
		
		destroy: function() {
		
		}
	
	});
	
}, [], '0.1');