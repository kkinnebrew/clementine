(function() {

	var Orange, Ajax, AjaxSource, Application, Cache, Class, Collection, Events, EventTarget, Item, Loader, 
			LocalStorageSource, Location, Log, Model, Node, Source, Storage,
			
			__import = function(name) { return Orange[name]; },
			__export = function(name, object) { Orange[name] = object; },
			__keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g;
	
	Class = (function() {
		
	 	var initializing = false, fnTest = /xyz/.test(function() {xyz;}) ? /\b_super\b/ : /.*/;
		
		Class.extend = function(def) {
		
			var _super = this.prototype;		
			var _static = this;
			
	    initializing = true;
	    var prototype = new this();
	    initializing = false;
	    
	    for (var name in def) {
	      prototype[name] = typeof def[name] == "function" && typeof _super[name] == "function" && fnTest.test(def[name]) ? (function(name, fn) {
	        return function() {
	          var tmp = this._super;
	          this._super = _super[name];
	          var ret = fn.apply(this, arguments);        
	          this._super = tmp;
	          return ret;
	        };
	      })(name, def[name]) : def[name];
	    }
	    
	    function Class() {
				if (!initializing && this.initialize) {
					this.initialize.apply(this, arguments);
				}
	    }
	    
	    Class.prototype = prototype;
	    Class.prototype.constructor = Class;
	    Class.extend = arguments.callee;
	    
	    return Class;
		
		};
		
		Class.proxy = function(func, context) {
			var _this = context;
			return function() {
				return func.apply(_this, arguments);
			}
		};
		
		function Class() {}
		
		return Class;
		
	})();
	

	Application = Class.extend({
		
		initialize: function(name, config) {
			this.name = name.replace(__keyFilterRegex);;
			this.config = config;
			this.isOnline = false;
		},
		
		launch: function() {
		
			for (var i = 0, len = this.config.required.length; i < len; i++) {
				Loader.loadModule(this.config.required[i]);
			}
		
			Cache.on('statusChange', Class.proxy(function(e) {
				if (e.data == 1) {
					Storage.goOnline();
					if (this.config.location) Location.fetch();
					Log.info('Application "' + this.name + '" online');
				} else {
					Log.info('Application "' + this.name + '" online');
					Storage.goOffline();
				}
			}, this));
			
			Cache.init(this.config.poll);
			Storage.init();
		},
		
		goOnline: function() {
			this.isOnline = true;
		},
		
		goOffline: function() {
			this.isOnline = false;
		},
		
		isOnline: function() {
			return this.isOnline;
		}
	
	});
	
	
	EventTarget = (function() {	
	
		function EventTarget(type, currentTarget, target, data) {
			this.bubbles = true;
			this.type = type;
			this.currentTarget = currentTarget;
			this.target = target;
			this.data = data;
		}
		
		EventTarget.prototype.stopPropagation = function() {
			this.bubbles = false;
		};
	
		return EventTarget;
	
	})();
	
	
	Events = Class.extend({
		
		initialize: function(parent, self) {
			this._listeners = {};
			this._parent = parent;
			this._self = self;
		},
		
		on: function(ev, call) {
			if (typeof this._listeners[ev] === 'undefined') {
				this._listeners[ev] = [];
			}
			this._listeners[ev].push(call);	
		},
		
		fire: function(ev, data) {
			
			var parent = this._parent;
	
			if (typeof ev === 'string') ev = new EventTarget(ev, this._self, this._self, data);
			if (typeof ev.type !== 'string') throw "Error: Invalid 'type' when firing event";
			
			if (this._listeners[ev.type] instanceof Array) {
				var listeners = this._listeners[ev.type];
				for (var i = 0, len = listeners.length; i < len; i++) listeners[i].call(this, ev);
			}
			if (parent != null && parent._eventTarget instanceof EventTarget && ev.bubbles) {
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
			
		},
		
		destroy: function() {	
			for(var listener in this._listeners) {
				listener.detach();
			}
			delete this._parent;
			delete this._self;
		}
	
	});
	
	
	Storage = (function() {
	
		var _localStorage = window.localStorage,
				_isSupported = false, _isOnline = false;
	
		Storage.init = function() {

			if ("localStorage" in window) {
				try {
					window.localStorage.setItem('_test', 1);
					_isSupported = true;
					window.localStorage.removeItem('_test');
				} catch (e) {} // iOS5 Private Browsing mode throws QUOTA_EXCEEDED_ERROR DOM Exception 22 via JStorage
			}
			
			if (_isSupported) {
				try {
					if (window.localStorage) {
						_localStorage = window.localStorage;
					}
				} catch (e) {} // Firefox local storage bug when cookies are disabled via JStorage
			}
			else if ("globalStorage" in window) {
				try {
					if (window.globalStorage) {
				    _localStorage = window.globalStorage[window.location.hostname];
				    _isSupported = true;
					}
				} catch(e) {}
			} else {} // TODO: add support for IE 6/7 userData
			
			if (typeof JSON === "undefined" || JSON.stringify == undefined) {
				_isSupported = false;
			}

			if (_isSupported) Log.info("LocalStorage loaded");
			else Log.debug("LocalStorage not supported");	
				
		};
	
		Storage.get = function(key, alt) {
			
			if (!_isSupported) return;
			try {
				var item = JSON.parse(_localStorage.getItem(key));
				if (item != undefined && item.data != undefined) {
					if (_isOnline && item.ttl !== -1 && ((new Date()).getTime() - item.timestamp) > item.ttl) {
						_localStorage.removeItem(key);
					}
					return item.data; 
				}
			} catch(e) {
				Log.error("Error saving object to localStorage");
			}
			return alt;
			
		};
		
		Storage.set = function(key, value, ttl) {
					
			if (!_isSupported) return false;
			key = key.replace(__keyFilterRegex, '');
			if (typeof value === 'undefined') return false;
			
			var obj = {
				data: value,
				timestamp: (new Date()).getTime(),
				ttl: ttl ? ttl : (24 * 60 * 60 * 1000) // 24 hours
			};
			
			try {
				_localStorage.setItem(key, JSON.stringify(obj)); // store object
				return true;
			} catch (e) {
				if (e == QUOTA_EXCEEDED_ERR) {
					Log.error("Storage quota has been exceeded", e);
				}
			}
			return false;
		}
		
		Storage.remove = function(key) {
			if (!_isSupported) return false;
			_localStorage.removeItem(key);
		};
		
		Storage.flushExpired = function(force) {
			if (!_isSupported) return;			
			if (_isOnline === false && force !== true) return;
			for (var key in _localStorage) {
				Storage.get(key);
			}
		};
		
		Storage.flush = function(force) {
			if (!_isSupported) return;
			if (_isOnline === false && force !== true) return;
			_localStorage.clear();
			Log.info("Clear: Local storage cleared");
		};
		
		Storage.isSupported = function() {
			return _isSupported;
		};
	
		Storage.goOnline = function() {
			_isOnline = true;
		};
		
		Storage.goOffline = function() {
			_isOnline = false;
		};
	
		function Storage() {}
	
		return Storage;
	
	})();
	
	
	Ajax = (function() {
		
		var XMLHttpRequests = [
			function() { return new XMLHttpRequest() },
			function() { return new ActiveXObject('Msxml2.XMLHTTP') },
			function() { return new ActiveXObject('Msxml3.XMLHTTP') },
			function() { return new ActiveXObject('Microsoft.XMLHTTP') }
		];
		
		var createXMLHttpObject = function() {
			var obj = false;
			for(var i = 0, length = XMLHttpRequests.length; i < length; i++) {
				try {
					obj = XMLHttpRequests[i]();
				} catch(e) {
					continue;
				}
			}
			return obj;
		};
		
		Ajax.load = function(request) {
			
			if ($) {
				return $.ajax(request).responseText;
			} 
			else {
				var req = createXMLHttpObject();
				if (!req) return;
								
				var success, error, data;
				
				if (typeof request.success === 'function') success = request.success;
				if (typeof request.error === 'function') error = request.error;
				if (request.hasOwnProperty('data')) data = request.data;
				var method = request.hasOwnProperty('type') ? request.type : 'GET';
				
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
		
		Ajax.get = function(request) {
			request.type = 'GET';
			return Ajax.load(request);
		};
		
		Ajax.post = function(request) {
			request.type = 'POST';
			return Ajax.load(request);
		};
		
		Ajax.put = function(request) {
			request.type = 'PUT';
			return Ajax.load(request);
		};
		
		Ajax.delete = function(request) {
			request.type = 'DELETE';
			return Ajax.load(request);
		};
		
		function Ajax() {}
		
		return Ajax;
	
	})();
	
	
	Cache = (function() {
		
		var activeProcess = null, poll = false,
		isOnline = false, isLoaded = false, isInit = false;
		
		var stop = function() {
			if(activeProcess != null) {
				clearTimeout(activeProcess);
				activeProcess = null;
			}
		};
		
		var statusCallback = function() {

			if(navigator.onLine && !isLoaded) {
				isOnline = true;
				isLoaded = true;
				Cache.fire("statusChange", 1);
				return;
			}
			
			stop();
												
			activeProcess = setTimeout(function() {

				if (navigator.onLine && !isLoaded) {
					isOnline = true;
					isLoaded = true;
					Cache.fire("statusChange", 1);					
				} else if (navigator.onLine) {
				  
				  Ajax.load({
				  	url: 'ping.js', 
				  	type: "GET",
				  	success: function(req) {
					  	if (isOnline === false) Cache.fire("statusChange", 1);
					  	isOnline = true;
					  },
					  error: function(req) {
					  	if (isOnline === true) Cache.fire("statusChange", 0);
					  	isOnline = false;
					  }
				  });
				  		  				  
				} else {
					
					setTimeout(function() {
						if (isOnline === true) Cache.fire("statusChange", 0);
						isOnline = false;
					}, 100);
				
				}
				
				activeProcess = null;
				if (poll) setTimeout(statusCallback, 10 * 1000);			
				
			}, (isLoaded ? 100 : 0));
			
		};
		
		var onCached = function(e) {
			Log.debug("Cache: All resources for this app downloaded. You can run this application while not connected to the internet");
		};
		
		var onChecking = function() {
			Log.debug("Cache: Checking for cache manifest");
		};

		var onDownloading = function() {
			Log.debug("Cache: Starting download of cached files");
		};
		
		var onError = function() {
			Log.debug("Cache: There was an error in the manifest, downloading cached files or you're offline");
		};
		
		var onNoUpdate = function() {
			Log.debug("Cache: There was no update needed");
		};
		
		var onProgress = function() {
			Log.debug("Cache: Downloading cached files");
		};
		
		var onUpdateReady = function() {
			window.applicationCache.swapCache();
			Log.debug("Cache: Updated cache has been loaded and is ready");
			window.location.reload(true);
		};
		
		Cache._events = new Events(null, Cache);
		
		Cache.on = function(ev, call, context) {
			var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
			return this._events.on.call(this._events, ev, proxy);
		};
		
		Cache.fire = function() {
			return this._events.fire.apply(this._events, arguments);
		};
		
		Cache.detach = function() {
			return this._events.detach.apply(this._events, arguments);
		};
			
		
		Cache.init = function(polling) {
		
			if (isInit) return;		
			poll = polling;
			isInit = true;

			Node.bind(window, "offline", statusCallback);
			Node.bind(window, "online", statusCallback);
			Node.bind(window, "cached", onCached);
			Node.bind(window, "checking", onChecking);
			Node.bind(window, "downloading", onDownloading);
			Node.bind(window, "error", onError);
			Node.bind(window, "noupdate", onNoUpdate);
			Node.bind(window, "progress", onProgress);
			Node.bind(window, "updateready", onUpdateReady);
							
			statusCallback();
				
		};
		
		Cache.updateNetworkStatus = function(callback) {
			statusCallback();
		};
	
		Cache.isActive = function() {
			return isInit;
		};
		
		Cache.isOnline = function() {
			return isOnline;
		};
		
		function Cache() {}
		
		return Cache;
	
	})();
	
	
	Location = (function() {
	
		var location = null, timestamp = null,
				expire = 60 * 60 * 1000;
	
		Location.fetch = function(success, error) {
		
			if (!Location.isExpired()) {
				if (typeof success !== 'undefined') success(location);
			} 
			else {
				
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(position) {
						timestamp = (new Date().getTime());
						location = position.coords;
						Log.info('Location retrieved');
						if (typeof success == 'function') success(position.coords);
					},
					function(error) {
						switch (error.code) 
						{
							case error.TIMEOUT:
								Log.error('Location services timeout');
								break;
							case error.POSITION_UNAVAILABLE:
								Log.error('Position unavailable');
								break;
							case error.PERMISSION_DENIED:
								Log.error('Please Enable Location Services');
								break;
							default:
								Log.error('Unknown location services error');
								break;
						}
						if(typeof error === 'function') error();
					});
				}
			}
		
		};
		
		Location.isExpired = function() {
			return ((new Date()).getTime() - timestamp) > expire;
		}
	
		function Location() {}
	
		return Location;
	
	})();
	

	Log = (function() {
		
		Log._events = new Events(null, Log);
		
		Log.on = function(ev, call, context) {
			var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
			return this._events.on.call(this._events, ev, proxy);
		};
		
		Log.fire = function() {
			return this._events.fire.apply(this._events, arguments);
		};
		
		Log.detach = function() {
			return this._events.detach.apply(this._events, arguments);
		};
		
		
		if (typeof(console) == "undefined") {
		  console = { log: function() { }, dir: function() { } };
		}
	
		Log.info = function(message, ex) {
			Log.fire('info', message);
		};
		
		Log.debug = function(message, ex) {
			Log.fire('debug', message);
		};
		
		Log.warn = function(message, ex) {
			Log.fire('warn', message);
		};
		
		Log.error = function(message, ex) {
			Log.fire('error', message);
		};
		
		function Log() {}
		
		return Log;
	
	})();
	
	
	Source = Class.extend({
	
		initialize: function(config) {
			this.config = config;
		},
		
		getName: function() {
			return this.config.name;
		},
		
		isPersistent: function() {
			return false;
		}
	
	});
	
	
	LocalStorageSource = Source.extend({
	
		isPersistent: function() {
			return true;
		},
		
		getPath: function(type) {
			return this.getName() + ':' + 'model:' + type;
		},
		
		getAll: function(type) {
			return Storage.get(this.getPath(type)) || undefined;
		},
		
		get: function(type, id) {
			var data = Storage.get(this.getPath(type)) || {};
			return data.hasOwnProperty(id) ? data[id] : undefined;
		},
		
		set: function(type, id, object) {
			if (id === null) id = this.nextKey(type);
			var data = Storage.get(this.getPath(type));
			data = data || {};
			data[id] = object;
			Storage.set(this.getPath(type), data);
			return id;
		},
		
		remove: function(type, id) {
			var data = Storage.get(this.getPath(type));
			delete data[id];
			Storage.set(this.getPath(type), data);
			return true;
		},
		
		flush: function(type) {
			 Storage.remove(this.getPath(type));
		},
		
		nextKey: function(type) {
			var size = 0, key, keys = [];
			var obj = Storage.get(this.getPath(type));
			for (key in obj) {
				if (obj.hasOwnProperty(key) && !isNaN(key)) keys.push(parseInt(key, 10));
			} 
			return (keys.length > 0) ? Math.max.apply(Math, keys) + 1 : 1;
		}
		
	});
	
	
	AjaxSource = Source.extend({
	
		initialize: function(config) {
			this.config = config;
		},
		
		request: function(config) {
		
			if (Cache.isActive() && !Cache.isOnline()) {
				Log.warn('Could not connect to server');
				return;
			}
		
			var success = (typeof config.success === 'function') ? config.success : null;
			var error = (typeof config.error === 'function') ? config.error : null;
			var complete = (typeof config.complete === 'function') ? config.complete : null;
		
			if (typeof config.context !== 'undefined') {
				if (success) success = function() { success.apply(context, arguments); };
				if (error) error = function() { error.apply(context, arguments); }
				if (complete) complete = function() { complete.apply(context, arguments); }
			}
			
			var req = { url: config.url, type: config.type };
			
			if (config.hasOwnProperty('async')) req.async = config.async;
			if (config.hasOwnProperty('data')) req.data = config.data;
			if (config.hasOwnProperty('dataType')) req.dataType = config.dataType;
			if (config.hasOwnProperty('contentType')) req.contentType = config.contentType;
			if (success) req.success = success;
			if (error) req.error = error;
			if (complete) req.complete;
			
			return Ajax.load(req);
		}
	
	});
	
	
	Model = Class.extend({
	
		initialize: function(config) {
			this.config = config;
			this._events = new Events(null, this);
	
			for(var field in config.fields) {
				if (config.fields[field].name == config.id) this.config.key = field;
			}
			if (this.config.key === null) throw "Missing id field in model '" + this.getName() + "'";		
		},
		
		getName: function() {
			return this.config.name;
		},
		
		getKey: function() {
			return this.config.key;
		},
		
		getId: function() {
			return this.config.id;
		},
		
		getFields: function() {
			return this.config.fields;
		},
		
		getSource: function() {
			return this.config.source;
		},
		
		getAll: function(query, success, error) {
			var successFunc = function(data) {
				var mappedData = this.mapItems(data);
				success.call(this, new Collection(this, mappedData));
			};
			this.getSource().getAll(this.getName(), Class.proxy(successFunc, this), error);
		},
		
		get: function(id, success, error) {
			var successFunc = function(data) {
				var mappedData = this.mapItem(data);
				success.call(this, new Item(this, mappedData));
			};
			this.getSource().get(this.getName(), id, Class.proxy(successFunc, this), error);
		},
		
		set: function(item, success, error) {
			var id = item.hasOwnProperty('id') ? item[id] : null;
			var successFunc = function(data) {
				var mappedData = this.mapItem(data);
				success.call(this, new Item(this, mappedData));
			};
			this.getSource().set(this.getName(), id, this.unmapItem(item), Class.proxy(successFunc, this), error);
		},
		
		remove: function(id, success, error) {
			var deltaId = id;
			var successFunc = function(data) {
				success.call(this, deltaId);
			};
			this.getSource().remove(this.getName(), id, Class.proxy(successFunc, this), error);
		},
		
		on: function(ev, call, context) {
			var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
			return this._events.on.call(this._events, ev, proxy);
		},
		
		fire: function() {
			return this._events.fire.apply(this._events, arguments);
		},
		
		detach: function() {
			return this._events.detach.apply(this._events, arguments);
		},
		
		mapItem: function(data) {
			var model = {}, fields = this.getFields();											
			for(var field in fields) {
				var source = fields[field].name, 
						value = (data.hasOwnProperty(source)) ? data[source] : undefined;		
				if (value === undefined) {
					Log.warn("Could not parse JSON field '" + field + "' for " + this.getName());
					continue;
				}
				model[field] = value;
			}
			return model;
		},
		
		mapItems: function(data) {
			var models = [];	
			for (var i = 0, len = data.length; i < len; i++) {
				var model = this.mapItem(data[i]);
				if (typeof model === 'object') models.push(model);
			}	
			return models;	
		},
		
		unmapItem: function(object) {	
			var data = {}, fields = this.getFields();
			for (var field in fields) {
				if (this.getKey() == field && !object.hasOwnProperty(this.getKey())) {
					continue;
				}
				var source = fields[field].name,
						value = (typeof object[field] !== 'undefined') ? object[field] : undefined;
				if (value === undefined && !fields[field].nullable) {
					Log.warn("Missing data for field '" + field + "' for " + this.getName());
					continue;
				}		
				data[source] = value;
			}
			return data;
		}
	
	});
	
	
	Collection = Class.extend({
	
		initialize: function(model, data) {
			this.model = model
			this.data = data;
			this.active = data;
			this.list = this.toArray();
		},
		
		getModel: function() {
			return this.model;
		},
		
		count: function() {
			return this.list.length;
		},
		
		get: function(id) {
			return this.data.hasOwnProperty(id) ? new Item(this.model, this.data[id]) : undefined;
		},
		
		filter: function(callback) {
			if (typeof callback === 'function' && this.active !== undefined) {
				for(var id in this.active) {
					if (!callback.call(this, this.active[id] || {})) delete this.active[id];
				}
			}
		},
		
		clearFilters: function() {
			this.active = this.data;
		},
		
		toArray: function() {
			var output = [];
			for (var id in this.active) {
				output.push(this.active[id]);
			}
			return output;
		},
		
		toObject: function() {
			return this.data;
		}
	
	});
	
	
	Item = Class.extend({
	
		initialize: function(model, data) {
			this.model = model;
			this.id = data[this.model.getKey()];
			this.data = data;
			this.isSaved = true;
		},
		
		get: function(name) {
			return this.data.hasOwnProperty(name) ? this.data[name] : undefined;
		},
		
		set: function(name, value) {
			this.data[name] = value;
			this.isSaved = false;
		},
		
		clear: function(name) {
			delete this.data[name];
			this.isSaved = false;
		},
		
		isSaved: function() {
			return this.isSaved;
		},
		
		exists: function() {
			return typeof this.id !== undefined;
		},
		
		save: function() {
			this.model.set(this.id, this.data, Class.proxy(function() {
				this.isSaved = true;
			}, this), function(e) {});
		},
		
		remove: function() {
			this.model.remove(this.id, Class.proxy(function() {
				this.isSaved = true;
				this.id = undefined;
			}, this), function(e) {});
		},
		
		refresh: function() {
			this.data = this.model.get(this.id);
			this.isSaved = true;
		},
		
		toObject: function() {
			return this.data;
		}
	
	});
	
	
	Node = (function() {
	
		Node.bind = function(obj, evt, fn) {		
			if (obj.addEventListener) {
				obj.addEventListener(evt, fn, false);
			} else if (obj.attachEvent) {
				obj.attachEvent('on' + evt, fn);
			}
		};
		
		Node.unbind = function(obj, evt, fn) {		
			if (obj.removeEventListener) {
				obj.removeEventListener(evt, fn, false);
			} else if (obj.detachEvent) {
				obj.detachEvent('on' + evt, fn);
			}
		};
		
		Node.on = function() {
			Node.bind.apply(Node, arguments)
		};
		
		Node.off = function() {
			Node.bind.apply(Node, arguments)
		};
	
		function Node(selector) {
			if ($) {
				this.target = $(selector);
				this.jQuery = true;
			}
			else this.target = document.getElementById(selector);
		}
		
		Node.prototype.bind = function(obj, evt, fn) {
			Node.bind(this.target, evt, fn);
		};
		
		Node.prototype.unbind = function(obj, evt, fn) {
			Node.unbind(this.target, evt, fn);
		};
		
		return Node;
	
	})();
	
	
	Loader = (function() {
	
		var modules = {};
		
		Loader.addModule = function(name, fn, req) {
			name = name.replace(/[^-A-Za-z_]/g);
			var mod = {
				name: name,
				fn: fn,
				req: (req != undefined) ? req : []
			};
			modules[name] = mod;
		};
	
		Loader.loadModule = function(name) {
			if (Orange.modules.hasOwnProperty(name)) return;
			if (modules[name] != undefined) {				
				Orange.modules[name] = true;											
				for(var i = 0, len = modules[name].req.length; i < len; i++) {
					if(modules[name].req[i] === name) continue;
					Loader.loadModule(modules[name].req[i]);
				}			
				modules[name].fn.call(window, Orange);				
				Log.info('Module "' + name + '" loaded');
			}
		};
		
		function Loader() {}
	
		return Loader;
	
	})();
	
	var add = function() {
		var args = arguments,
			name = args[0],
			fn = ( typeof args[1] === 'function' ) ? args[1] : null,
			req = args[2];
		Loader.addModule(name, fn, req);	
	};
	
	var use = function() {
		var args = Array.prototype.slice.call(arguments),
			fn = args[args.length-1],
			req = clone(args).splice(0, args.length-1)										
		if(typeof req[0] != 'function') { 
			for (var i = 0, len = req.length; i < len; i++) {
				Loader.loadModule(req[i]);
			}
		}
		fn.call(window, Orange);	
	};
	
	var namespace = function(name) {
		if(Orange[name] == undefined) {
			Orange[name] = {};
		}	
	};
	
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
	
	function cloneAttributes(source, destination) {
		if (!$) throw "cloneAttributes() not supported";
		var destination = $(destination).eq(0);
	  var source = $(source)[0];
	  for (i = 0; i < source.attributes.length; i++) {
	      var a = source.attributes[i];
	      destination.attr(a.name, a.value);
	  }
	}
	
	Orange = this.Orange = {};

  Orange.version = '1.0.2';

	Orange.__import = this.__import = __import;

	Orange.__export = this.__export = __export;

	Orange.modules = {};

	Orange.add = add;
	
	Orange.use = use;
	
	Orange.namespace = namespace;

  Orange.Ajax = Ajax;

  Orange.AjaxSource = AjaxSource;

	Orange.Application = Application;
	
	Orange.Cache = Cache;
	
	Orange.Class = this.Class = Class;
	
  Orange.Events = Events;
  
  Orange.EventTarget = EventTarget;

	Orange.Item = Item;
	
	Orange.Loader = Loader;
	
	Orange.LocalStorageSource = LocalStorageSource;

	Orange.Location = Location;

  Orange.Log = this.Log = Log;

  Orange.Model = Model;
  
  Orange.Node = Node;
  
  Orange.Source = Source;
  
  Orange.Storage = Storage;
	
}).call(this);