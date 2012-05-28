/**
 * commons.js | Orange Commons 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none (socket.io if using websockets)
 * @description base library classes
 */

(function() {

	var Orange, Ajax, Browser, Cache, Class, Element, Events, EventHandle, EventTarget, Loader, Location, Log, Socket, Storage,

			__import = function(name) { return Orange[name] },
			__export = function(name, object) { return Orange[name] = object },
			__keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g,
			__modFilterRegex = /[^-A-Za-z_]/g;


	Class = (function() {

		var initializing = false, fnTest = /xyz/.test(function() {xyz;}) ? /\b_super\b/ : /.*/;
		
		Class.extend = function(def) {
		
			var _super = this.prototype;
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
	
	
	EventHandle = (function() {
	
		function EventHandle(target, ev, call) {
			this.target = target;
			this.ev = ev;
			this.call = call;
		}
		
		EventHandle.prototype.detach = function() {
			this.target.detach(this.ev, this.call);
			delete this.target;
			delete this.ev;
			delete this.call;
		}
	
	});
	
	
	Events = (function() {
	
		function Events(parent, self) {
			this._listeners = {};
			this._parent = parent;
			this._self = self;
		}
		
		Events.prototype.on = function(ev, call) {
			if (!this._listeners.hasOwnProperty(ev)) {
				this._listeners[ev] = [];
			}
			this._listeners[ev].push(call);	
			return new EventHandle(this, ev, call);
		};
		
		Events.prototype.fire = function(ev, data) {
			
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
			
		};
		
		Event.prototype.detach = function(ev, call) {
		
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
		
		};
		
		Event.prototype.destroy = function() {
			for(var listener in this._listeners) {
				listener.detach();
			}
			delete this._parent;
			delete this._self;
		};
	
		return Events;
	
	})();

	
	Log = (function() {
		
		var Log = {}, events = new Events(null, Log), level = 0;
		
		if (typeof(console) == "undefined") {
		  console = { log: function() {}, dir: function() {} };
		}
		
		var printLog = function(type, msg, ex) {
			if (ex) console.log(type, msg, ex);
			else console.log(type, msg);
		};
		
		Log.on = function(ev, call, context) {
			var context = context, proxy = function(e) {
				var message = e.data.message, ex = e.data.data;
				call.call(((typeof context !== 'undefined') ? context : this), message, ex);
			};
			return events.on.call(events, ev, proxy);
		};

		Log.fire = function() {
			return events.fire.apply(events, arguments);
		};
				
		Log.detach = function() {
			return events.detach.apply(events, arguments);
		};
		
		Log.setLevel = function(logLevel) {
			switch (logLevel.toLowerCase()) {
				case 'info':
					level = 4; break;
				case 'debug':
					level = 3; break;
				case 'warn':
					level = 2; break;
				case 'error':
					level = 1; break;
				default:
					level = 0;
			}
		};
		
		Log.info = function(msg, ex) { if (level > 3) Log.fire('info', { message: msg, data: ex }); };
		Log.debug = function(msg, ex) { if (level > 2) Log.fire('debug', { message: msg, data: ex }); };
		Log.warn = function(msg, ex) { if (level > 1) Log.fire('warn', { message: msg, data: ex }); };
		Log.error = function(msg, ex) { if (level > 0) Log.fire('error', { message: msg, data: ex }); };
		
		Log.on('info', function(msg, ex) { printLog('[INFO]', msg, ex); });
		Log.on('debug', function(msg, ex) { printLog('[DEBUG]', msg, ex); });
		Log.on('warn', function(msg, ex) { printLog('[WARN]', msg, ex); });
		Log.on('error', function(msg, ex) { printLog('[ERROR]', msg, ex); });
				
		return Log;
		
	})();
	
	
	Loader = (function() {
	
		var modules = {}, active = {};
	
		return {
		
			addModule: function(name, fn, req) {
				name = name.replace(/[^-A-Za-z_]/g);
				var mod = {
					name: name,
					fn: fn,
					req: (req != undefined) ? req : []
				};
				modules[name] = mod;
			},
			
			loadModule: function(name) {
				if (active.hasOwnProperty(name)) return;
				if (modules[name] != undefined) {				
					active[name] = true;											
					for(var i = 0, len = modules[name].req.length; i < len; i++) {
						if(modules[name].req[i] === name) continue;
						Loader.loadModule(modules[name].req[i]);
					}			
					modules[name].fn.call(window, Orange);				
					Log.debug('Module "' + name + '" loaded');
				}
			}
		
		};
	
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
		
		return {
		
			load: function(request) {
						
				if (typeof $ !== 'undefined') {
					return $.ajax(request).responseText;
				} 
				else {
					var req = createXMLHttpObject();
					if (!req) return;
									
					var success, error, data, done = false;
					
					console.log(request.data);
					
					if (typeof request.success === 'function') success = request.success;
					if (typeof request.error === 'function') error = request.error;
					if (request.hasOwnProperty('data')) data = encodeURIComponent(request.data);
					var method = request.hasOwnProperty('type') ? request.type : 'GET';
					var url = request.hasOwnProperty('type') ? request.url : null;

					req.open(method, url, true);
					req.setRequestHeader('Cache-Control', 'no-cache');
					req.timeout = 3000;
					req.ontimeout = function () { error(req); }
					
					req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
					if (data) req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
					req.onreadystatechange = function () {
						if (req.readyState != 4) return;
						if (req.status != 200 && req.status != 304) {
							error(req);
						}
						else success(req.responseText);
					}
					
					if (req.readyState == 4) {
						success(req); return;
					}
					
					req.send(data);
				}
				
			},
			
			get: function(request) {
				request.type = 'GET';
				return Ajax.load(request);
			},
			
			post: function(request) {
				request.type = 'POST';
				return Ajax.load(request);
			},
			
			put: function(request) {
				request.type = 'PUT';
				return Ajax.load(request);
			},
			
			delete: function(request) {
				request.type = 'DELETE';
				return Ajax.load(request);
			}
		
		};
	
	})();
	
	
	Element = (function() {
		
		Element.bind = function(obj, evt, fn) {		
			if (obj.addEventListener) {
				obj.addEventListener(evt, fn, false);
			} else if (obj.attachEvent) {
				obj.attachEvent('on' + evt, fn);
			}
		};
		
		Element.unbind = function(obj, evt, fn) {		
			if (obj.removeEventListener) {
				obj.removeEventListener(evt, fn, false);
			} else if (obj.detachEvent) {
				obj.detachEvent('on' + evt, fn);
			}
		};
		
		Element.on = function() {
			Element.bind.apply(Element, arguments)
		};
		
		Element.off = function() {
			Element.bind.apply(Element, arguments)
		};
	
		function Element(selector) {
			if (typeof $ !== 'undefined') {
				this.target = $(selector);
				this.jQuery = true;
			}
			else this.target = document.getElementById(selector.replace('#', ''));
		}
		
		Element.prototype.bind = function(evt, fn) {
			Element.bind(this.target, evt, fn);
		};
		
		Element.prototype.unbind = function(evt, fn) {
			Element.unbind(this.target, evt, fn);
		};
		
		Element.prototype.on = function(evt, fn) {
			Element.on(this.target, evt, fn);
		};
		
		Element.prototype.off = function(evt, fn) {
			Element.off(this.target, evt, fn);
		};
		
		return Element;
		
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
		
		var events = new Events(null, Cache)
		
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
		
		return {
				
			on: function(ev, call, context) {
				var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
				return events.on.call(events, ev, proxy);
			},
			
			fire: function() {
				return events.fire.apply(events, arguments);
			},
			
			detach: function() {
				return events.detach.apply(events, arguments);
			},
				
			
			init: function(polling) {
			
				if (isInit) return;		
				poll = polling;
				isInit = true;
	
				Element.bind(window, "offline", statusCallback);
				Element.bind(window, "online", statusCallback);
				Element.bind(window, "cached", onCached);
				Element.bind(window, "checking", onChecking);
				Element.bind(window, "downloading", onDownloading);
				Element.bind(window, "error", onError);
				Element.bind(window, "noupdate", onNoUpdate);
				Element.bind(window, "progress", onProgress);
				Element.bind(window, "updateready", onUpdateReady);
								
				statusCallback();
					
			},
			
			updateNetworkStatus: function(callback) {
				statusCallback();
			},
		
			isActive: function() {
				return isInit;
			},
			
			isOnline: function() {
				return isOnline;
			}
		
		}
	
	})();
	
	
	Storage = (function() {
	
		var _localStorage = window.localStorage,
				_isSupported = false, _isOnline = false;
				
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
		
		if ((typeof JSON === "undefined" || JSON.stringify == undefined) && typeof $ === 'undefined') {
			_isSupported = false;
		}

		if (!_isSupported) Log.debug("localStorage not supported");	
				
	
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
	
	
	Socket = (function() {
	
		function Socket(path) {
			if (typeof io !== 'undefined') {
				this.connection = io.connect(path);
			} else throw 'Socket.io required';
		}
		
		Socket.prototype.on = function() {
			this.connection.on.apply(this.connection, arguments);
		};
		
		Socket.prototype.send = function() {
			this.connection.send.apply(this.connection, arguments);
		};
		
		Socket.prototype.emit = function() {
			this.connection.emit.apply(this.connection, arguments);
		};
		
		return Socket;
	
	})();
	
	
	Location = (function() {
	
		var location = null, timestamp = null,
				expire = 60 * 60 * 1000;
	
		return {
		
			fetch: function(success, error) {
			
				if (!Location.isExpired()) {
					if (typeof success !== 'undefined') success(location);
				} 
				else {
					
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position) {
							timestamp = (new Date().getTime());
							location = position.coords;
							Log.debug('Location retrieved');
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
							if (typeof error === 'function') error();
						});
					}
				}
			
			},
			
			isExpired: function() {
				return ((new Date()).getTime() - timestamp) > expire;
			}
		
		}
	
	})();
	
	
	Browser = (function() {
	
		var BrowserDetect = {
		
			init: function () {
				this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
				this.version = this.searchVersion(navigator.userAgent)
					|| this.searchVersion(navigator.appVersion)
					|| "an unknown version";
				this.OS = this.searchString(this.dataOS) || "an unknown OS";
				
				// check if mobile
				var useragent = navigator.userAgent.toLowerCase();
				if (useragent.search("iphone") > 0)
				    this.isMobile = true; // iphone
				else if (useragent.search("ipod") > 0)
				    this.isMobile = true; // ipod
				else if (useragent.search("android") > 0)
				    this.isMobile = true; // android
				else this.isMobile = false;
				
				// check if tablet
				if (useragent.search("ipad") > 0)
				    this.isTablet = true; // ipad
				else this.isTablet = false;
				
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
				{ 
					string: navigator.userAgent,
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
			isMobile: BrowserDetect.isMobile,
			isTablet: BrowserDetect.isTablet,
			isDesktop: !(BrowserDetect.isMobile || BrowserDetect.isTablet),
			isTouch: (BrowserDetect.isMobile || BrowserDetect.isTablet)
		}
	
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
		if (typeof $ !== 'undefined') throw "cloneAttributes() not supported";
		var destination = $(destination).eq(0);
	  var source = $(source)[0];
	  for (i = 0; i < source.attributes.length; i++) {
	      var a = source.attributes[i];
	      destination.attr(a.name, a.value);
	  }
	}
	
		
	Orange 					= this.Orange = {};
  Orange.version 	= '1.0.2';
	Orange.__import = this.__import = __import;
	Orange.modules 	= {};

	Orange.add = add;
	Orange.use = use;
	Orange.namespace = namespace;

  Orange.Ajax 				= Ajax;
	Orange.Browser 			= Browser;
	Orange.Cache 				= Cache;
	Orange.Class 				= this.Class = Class;
	Orange.Element 			= Element;
	Orange.Events 			= Events;
  Orange.EventTarget 	= EventTarget;
  Orange.Loader				= Loader;
	Orange.Location 		= Location;
  Orange.Log 					= this.Log = Log;  
  Orange.Socket 			= Socket;
  Orange.Storage 			= Storage;	

}).call(this);

/**
 * mvc.js | Orange MVC Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons
 * @description base model-view-controller classes
 */

Orange.add('mvc', function(O) {

	var Application, Collection, Controller, Model, Source, View,
			__keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g;
	
	var Cache = __import('Cache'), Storage = __import('Storage'), 
			Loader = __import('Loader'), Location = __import('Location'),
			Events = __import('Events');
	
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
		
			if (this.config.hasOwnProperty('logging')) Log.setLevel(this.config.logging);
		
			Cache.on('statusChange', Class.proxy(function(e) {
				
				if (e.data == 1) {
					Storage.goOnline();
					if (this.config.location) Location.fetch();
					Log.debug('Application "' + this.name + '" online');
				} else {
					Log.debug('Application "' + this.name + '" online');
					Storage.goOffline();
				}
				
				window.onload = Class.proxy(function() {
					this.onLaunch(e.data);
				}, this);	
				
			}, this));
			
			Cache.init(this.config.poll);
		},
		
		onLaunch: function(online) {},
		
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
	
	
	Controller = Class.extend({
		
		initialize: function() {},
		
		destroy: function() {}
		
	});
	
	
	Model = Class.extend({
		
		initialize: function(data) {
			this.getName();
			var field = this.constructor.getKey();
			this.isSaved = (data || {}).hasOwnProperty(field);
			this.id = this.isSaved ? data[field] : null;
			this.data = data || {};
		},
		
		getName: function() {
			throw 'Cannot instantiate model';
		},
		
		getFields: function() {
			throw 'Cannot instantiate model';
		},
		
		getSource: function() {
			throw 'Cannot instantiate model';
		},
		
		get: function(name) {
			return this.data[name];
		},
		
		set: function(name, value) {
			this.data[name] = value;
			this.isSaved = false;
		},
		
		clear: function() {
			delete this.data[name];
			this.isSaved = false;
		},
		
		refresh: function() {
			var item = this.constructor.get(this.getId());
			this.data = item.toObject();
			this.isSaved = true;
			// prevent duplicate refreshes
		},
		
		save: function(success, error, context) {
			if (this.isSaved) return;
			var successFunc = function(data) {
				this.isSaved = true;
				if (typeof success === 'function') success(data);
			};
			this.constructor.set(this.data, Class.proxy(successFunc, this), error, context);
		},
		
		remove: function(success, error, context) {
			if (this.exists()) {
				this.constructor.remove(this.id, success, error, context);
			}
			this.destroy();
		},
		
		mergeChanges: function(deltas) {
			
			// merge values
			
		},
		
		isSaved: function() {
			return this.isSaved;
		},
		
		exists: function() {
			return this.id !== null;
		},
		
		getId: function() {
			return this.id;
		},
		
		getModel: function() {
			return this.constructor;
		},
		
		toObject: function() {
			return this.data;
		},
		
		destroy: function() {
			this.isSaved = false;
			this.id = null;
			this.data = {};
		}
		
	});
	
	Model.getKey = function() {
		var fields = this.getFields();
		for(var field in fields) {
			if (fields[field].hasOwnProperty('primaryKey')) return field;
		}
	};
	
	Model.getId = function() {
		var fields = this.getFields();
		for(var field in fields) {
			if (fields[field].hasOwnProperty('primaryKey')) return fields[field].name;
		}
	};
	
	Model.getAll = function(query, success, error, context) {
		var successFunc = function(data) {
			var mappedData = Model.mapItems.call(this, data);
			success.call((typeof context === 'function' ? context : this), new Collection(this, mappedData));
		};
		this.getSource().getAll(this.getName(), Class.proxy(successFunc, this), error);
	};
	
	Model.get = function(id, success, error, context) {
		var successFunc = function(data) {
			var mappedData = Model.mapItem.call(this, data);
			success.call((typeof context !== 'undefined' ? context : this), new this(mappedData));
		};
		this.getSource().get(this.getName(), id, Class.proxy(successFunc, this), error);
	};
	
	Model.set = function(item, success, error, context) {
		if (item instanceof Model) item = item.toObject();
		var id = item.hasOwnProperty(this.getKey()) ? item[this.getKey()] : null;
		var successFunc = function(data) {
			var mappedData = Model.mapItem.call(this, data);
			if (typeof success === 'function') success.call((typeof context !== 'undefined' ? context : this), new this(mappedData));
			this.fire('datachange', [ { action: (id == null ? 'sync' : 'set'), id: mappedData[this.getKey()] } ]);
		};
		this.getSource().set(this.getName(), id, Model.unmapItem.call(this, item), Class.proxy(successFunc, this), error);
	};
	
	Model.remove = function(id, success, error) {
		var deltaId = id;
		var successFunc = function(data) {
			if (typeof success === 'function') success.call(this, deltaId);
			this.fire('datachange', [ { action: 'remove', id: deltaId } ]);
		};
		this.getSource().remove(this.getName(), id, Class.proxy(successFunc, this), error);
	};
	
	Model.on = function(ev, call, context) {
		var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
		return this.events.on.call(this.events, ev, proxy);
	},
	
	Model.fire = function() {
		return this.events.fire.apply(this.events, arguments);
	},
	
	Model.detach = function() {
		return this.events.detach.apply(this.events, arguments);
	},
	
	Model.mapItem = function(data) {
		var model = {}, fields = this.getFields();											
		for (var field in fields) {
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
	
	Model.mapItems = function(data) {
		var models = {}, id = this.getKey();
		for (var i = 0, len = data.length; i < len; i++) {
			var model = Model.mapItem.call(this, data[i]);
			if (typeof model === 'object') models[model[id]] = model;
		}	
		return models;	
	},
	
	Model.unmapItem = function(object) {	
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
	
	Model.extend = function(def) {
		
		var m = Class.extend.call(this, def);
				
		var required = ['getName', 'getId', 'getFields', 'getSource'];
		for (var i = 0, len = required.length; i < len; i++) {
			if (!def.hasOwnProperty(required[i])) throw "Class missing '" + required[i] + "()' implementation";
			m[required[i]] = def[required[i]];
		}
		
		var source = def.getSource();
		if (!source.supportsModels()) throw "Source '" + source.getName() + "' does not support models";
		
		m.events = new Events(null, this);
		
		m.getKey = function() { return Model.getKey.apply(m, arguments); };
		m.getAll = function() { return Model.getAll.apply(m, arguments); };
		m.get = function() { return Model.get.apply(m, arguments); };
		m.set = function() { return Model.set.apply(m, arguments); };
		m.remove = function() { return Model.remove.apply(m, arguments); };
		
		m.on = function() { return Model.on.apply(m, arguments); };
		m.fire = function() { return Model.fire.apply(m, arguments); };
		m.detach = function() { return Model.detach.apply(m, arguments); };
		
		return m;
			
	};
	
	
	View = (function() {
	
		var views = {};
	
		var fetch = function(path) {
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
				if (typeof views[path] !== 'undefined') {
					return views[path];
				} else if (typeof path !== 'undefined' && path !== '') {
					return fetch(path);
				}	else {
					throw 'Invalid template path';
				}
			}
			
		}
	
	})();
	
	
	Source = Class.extend({
	
		initialize: function(config) {
			if (typeof config === 'undefined') return;
			this.config = config;
		},
		
		getName: function() {
			return (this.config || {}).hasOwnProperty('name') ? this.config.name : 'source';
		},
		
		supportsModels: function() {
			return false;
		},
		
		isPersistent: function() {
			return false;
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
			return this.data.hasOwnProperty(id) ? new this.model(this.data[id]) : null;
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
			return this.active;
		},
		
		getModel: function() {
			return this.model;
		}
		
	});
	
	
	O.Application = Application;
	O.Collection	= Collection;
	O.Controller	= Controller;
	O.Model				= Model;
	O.Source			= Source;
	O.View				= View;
	
}, [], '1.0.2');

/**
 * db.js | Orange DB Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc
 * @description adds common data source types
 */

Orange.add('db', function(O) {

	var AjaxSource, LocalStorageSource, RestSource, SessionStorageSource;
	
	var Cache = __import('Cache'), Storage = __import('Storage'), Ajax = __import('Ajax'), Source = __import('Source');
	
	AjaxSource = Source.extend({
	
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
	
	
	LocalStorageSource = Source.extend({
	
		isPersistent: function() {
			return true;
		},
		
		supportsModels: function() {
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
	
	
	RestSource = AjaxSource.extend({
	
		initialize: function(config) {
			if (typeof config === 'undefined') return;
			this.config = config;
			this.config.path = (config.path.charAt(config.path.length-1) == '/') ? config.path : config.path + '/';
			Log.info('Source "' + this.getName() + '" connected');
		},
		
		getPath: function() {
			return this.config.path;
		},
		
		getDataType: function() {
			return this.config.hasOwnProperty('dataType') ? this.config.dataType : 'text/json';
		},
	
		getAll: function(type, success, error) {		
					
			var successFunc = function(data) {
				data = this.processItems(type, data);
				success.call(this, data);
			}
						
			this.request({
				url: this.getPath() + this.filterType(type),
				contentType: this.getDataType(),
				type: 'GET',
				success: Class.proxy(successFunc, this),
				error: error
			});
			
		},
		
		get: function(type, id, success, error) {
	
			var successFunc = function(data) {
				data = this.processItem(type, data);
				success.call(this, data);
			}
			
			var path = this.getPath() + this.filterType(type);
			
			this.request({
				url: (path.charAt(path.length-1) == '/') ? path + id : path + '/' + id,
				contentType: this.getDataType(),
				type: 'GET',
				success: Class.proxy(successFunc, this),
				error: error
			});
			
		},
		
		set: function(type, id, object, success, error) {

			var type = this.filterType(type);
	
			var successFunc = Class.proxy(function(data) {
				data = this.processItem(type, data);
				success.call(this, data);
			}, this), path = this.getPath(), req;
			
			path = (!id) ? path + type : (path.charAt(path.length-1) == '/') ? path + type + '/' + id : path + '/' + type + '/' + id;
			
			req = {
				url: path,
				success: Class.proxy(successFunc, this),
				error: error
			}
			
			if (!id) {
				req['type'] = 'POST',
				req['data'] = object
			} else {
				req['type'] = 'PUT';
				req['data'] = JSON.stringify(object);
				req['contentType'] = 'application/json';
			}
						
			this.request(req);
	
		},
		
		remove: function(type, id, success, error) {
	
			var path = this.getPath() + this.filterType(type);
			
			this.request({
				url: (path.charAt(path.length-1) == '/') ? path + id : path + '/' + id,
				type: 'DELETE',
				success: function(data) {
					success.call(this, JSON.parse(data));
				},
				error: error
			});
			
		},
				
		processItem: function(type, data) {
			return this.filterItem(type, data);
		},
		
		processItems: function(type, data) {
			var items = this.filterItems(type, data);
			var output = [];
			for(var i = 0, len = items.length; i < len; i++) {
				output.push(this.processItem(type, items[i]));
			}
			return output;
		},
		
		filterItem: function(type, data) {
			return JSON.parse(data);
		},
		
		filterItems: function(type, data) {
			return JSON.parse(data);
		},
		
		filterType: function(type) {
			return type;
		}
	
	});
	
	
	SessionStorageSource = Source.extend({});
	
	
	O.AjaxSource 						= AjaxSource;
	O.LocalStorageSource 		= LocalStorageSource;
	O.RestSource 						= RestSource;
	O.SessionStorageSource 	= SessionStorageSource;
	
}, ['mvc'], '1.0.2');

/**
 * ui.js | Orange UI Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2
 * @description commonly used view controllers
 */

Orange.add('ui', function(O) {

	var Binding, Form, Input, GridViewController, LightboxViewController, ListViewController, MapViewController, MultiViewController, 
			ProgressViewController, TableViewController, TabViewController, TooltipViewController, ViewController;

	var Application = __import('Application'), Model = __import('Model');
	
	Application.prototype.onLaunch = function(online) {
		
		var root = $('[data-root="true"]'),
		type = root.attr('data-control'),
		name = root.attr('data-name');
		if (typeof type === 'undefined' || typeof name === 'undefined') throw 'Root view not found';
		
		// remove root attribute
		root.removeAttr('data-root');
		
		// load view
		var c = ViewController.load(type);
		var controller = new c(null, root);
		controller.onLoad();
							
	};
	
	Binding = (function() {
	
		return {
		
			bindData: function(node, item) {
			
				// check for the data format
				if (item instanceof O.Item) {
					var id = item.id(), data = item.toObject();
				} else if (typeof item === 'object') {
					var id = null, data = item;
				}
				else throw 'Invalid data item';
				
				if (id !== null) node.attr('itemid', id);
				
				// parse all the data fields
				for (var field in data) {
					var el = node.find('[itemprop="' + field + '"]');
					var childList = [];
					node.find('[itemprop="' + field + '"]').each(function() {
						var include = false, parent = $(this).parent();
						while (parent.length !== 0 && !include) {
							if ($(parent).not(node).length === 0) {
								include = true; break;
							} else if ($(parent).not('[itemscope]').length === 0) {
								include = false; break;
							} parent = $(parent).parent();
						}
						if (include) childList.push($(this));
					});
																							
					if (childList.length > 0) {
						for(var i = 0, len = childList.length; i < len; i++) {
							if (data[field] instanceof Array || data[field] instanceof O.Collection) {
								O.Binding.bindList(childList[i], data[field]);
							} else if (typeof data[field] === 'object' || data[field] instanceof O.Item) {
								O.Binding.bindData(childList[i], data[field]);
							} else childList[i].text(data[field]);
						}
					}
				}
			},
			
			bindList: function(node, list) {
						
				// check for the data format
				if (list instanceof O.Collection) {
					var data = list.toArray();
				} else if (list instanceof Array) {
					var data = list;
				}
				else throw 'Invalid data collection';
			
				var template = node.find('[itemscope]');
				var itemscope = $(template).attr('itemscope');
				
				// validate attribute exists
				if (typeof itemscope !== 'undefined' && itemscope !== false) {
					node.html('');
					for(var i=0, len = data.length; i < len; i++) {
						var instance = template.clone();
						O.Binding.bindData(instance, data[i]);
						node.append(instance);
					}
				}
			}
		}
		
	})();
	
	
	Input = Class.extend({
	
	});
	
	Input.extend = function(def) {
	
	};
	
	
	Form = Class.extend({
	
		initialize: function(target) {
			
			// set vars
			var that = this, name = $(target).attr('name');
			
			// set instance vars
			this.fields = {};
			this.target = target;

			// find all form fields
			$(target).find('input, select, textarea, button .ui-input').each(function() {
				var fieldName = $(this).attr('name');
				that.fields[fieldName] = $(this);
			});
			
		},
		
		getField: function(name) {
			if (typeof this.fields[name] !== 'undefined') {
				return this.fields[name];
			} else {
				throw "Error: Form field '" + name + "' not found";
			}
		},
		
		setField: function(name, value) {
			try {
				this.getField(name).val(value);
			} catch(e) {
				console.log('[WARN] Field "' + name +'" could not be fetched');
			}
		},
		
		getData: function() {
			var data = {};
			for (var field in this.fields) {
				var val = this.fields[field].val(), type = this.fields[field].attr('type');
				if (typeof val !== undefined && val !== null && type !== 'submit' && type !== 'button') {
					data[field] = val;
				}
			}
			return data;
		},
		
		setData: function(item) {
			var data = item;
			if (item instanceof O.Item) data = item.toObject();
			for (var field in this.fields) {
				if (typeof data[field] !== undefined && data[field] !== null) {
					this.fields[field].val(data[field]);
				}
			}
		},
		
		detach: function() {
			for (var name in this.fields) {
				this.fields[name].detach();
			}
		},
		
		destroy: function() {
			for (var name in this.fields) {
				delete this.fields[name];
			}
		}
	
	});
	
	
	ViewController = Class.extend({
	
		initialize: function(parent, target) {
				
			// set vars
			var that = this, views = [], forms = [], elements = [];
			
			// setup instance vars
			this.views = {};
			this.forms = {};
			this.elements = {};
			this.events = [];
			this.data = {};
			this.eventTarget = new O.Events(parent, this);
			
			// validate target
			if (typeof target !== 'undefined') {
				this.target = $(target);
				var _target = $(target).get(0);
			} else throw 'Invalid target';
			
			// check if parent
			this.parent = (typeof parent !== 'undefined') ? parent : null;
			if (this.parent === null) this.target.removeAttr('data-root');
						
			// validate arguments
			for (var i = 0, len = _target.attributes.length; i < len; i++) {
				if (_target.attributes[i].name.match(/data-/)) {
					this.data[_target.attributes[i].name.replace(/data-/, '')] = _target.attributes[i].value;
				}
			}
			
			// finds immediate descendant children
			var childFunc = function(selector) {
				var childList = [];
				this.target.find(selector).each(function() {
					var include = false, parent = $(this).parent();
					while (parent.length !== 0 && !include) {
						if ($(parent).not($(that.target)).length === 0) {
							include = true; break;
						} else if ($(parent).not('[data-control]').length === 0) {
							include = false; break;
						} parent = $(parent).parent();
					}
					if (include) childList.push(this);
				});
				return childList;
			}
			
			// populate child views
			views = childFunc.call(this, '[data-control]');
			forms = childFunc.call(this, 'form');
			elements = childFunc.call(this, '[data-name]:not([data-control])');
			
			// process views
			for (var i = 0, len = views.length; i < len; i++) {
				var view = $(views[i]), name = view.attr('data-name'),
						type = view.attr('data-control'), path = view.attr('data-template'),
						isRemote = (typeof path !== 'undefined' && path.length > 0);
				
				if (isRemote) {
					var source = O.View.load(path);
					view.html($(source).html());
					cloneAttributes(source, view);
					view.removeAttr('data-template');
				}
				
				var c = ViewController.load(type);
				this.views[name] = new c(this, view);
			}
			
			// process forms
			for (var i = 0, len = forms.length; i < len; i++) {
				var form = $(forms[i]), name = form.attr('name'), child = new O.Form(form);
				this.forms[name] = child;
			}
			
			// process elements
			for (var i = 0, len = elements.length; i < len; i++) {
				var el = $(elements[i]), name = el.attr('data-name');
				if (typeof name !== 'undefined' && name.length > 0) this.elements[name] = el.removeAttr('data-name');
			}
			
			// process types
			this.target.addClass(this.getClasses());
			this.target.removeAttr('data-control').removeAttr('data-name');
			
			// store for debugging
			this.type = this.getType();
			this.name = this.data.name;
							
		},
		
		getType: function() {
			return 'view';
		},
		
		getClasses: function() {
			var classes = typeof this.typeList !== 'undefined' ? this.typeList : '';
			return classes + ' ' + this.data.name;
		},

		getTriggers: function() {
			return [];
		},
		
		getBindings: function() {
			return {};
		},
		
		
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onLoad: function() {
			
			this.onWillLoad();
			
			for (var name in this.views) {
				this.views[name].onLoad();
			}
			
			var views = this.getBindings();
			
			for (var view in views) {
				var events = views[view];
				for (var event in events) {
					if (event == 'touchclick') event = Browser.isTouch ? 'touchend' : 'click';
					var func = (typeof events[event] === 'function') ? events[event] : null;
					if (func === null) {
						var name = event.charAt(0).toUpperCase() + event.slice(1);
						func = (events[event] === true && typeof this['on' + name] === 'function') ? this['on' + name] : null;
					}
					if (func !== null && this.views.hasOwnProperty(view)) this.getView(view).on(event, $.proxy(func,  this));
					else if (func !== null && this.elements.hasOwnProperty(view)) this.getElement(view).on(event, $.proxy(func,  this));
				}
			}
			
			this.onDidLoad();
		
		},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		onUnload: function() {
		
			this.onWillUnload();

			for (var view in this.views) { this.getView(view).detach(); }
			for (var form in this.forms) { this.getForm(form).detach(); }
			for (var el in this.elements) { this.getElement(el).unbind(); }
			for (var name in this.views) { this.views[name].onUnload(); }
			
			this.onDidUnload();
		
		},
		
		getView: function(name) {
			if (name instanceof ViewController) return name;
			else if (typeof this.views[name] !== 'undefined') return this.views[name];
			throw 'Error: View "' + name + '" not found';
		},
		
		getForm: function(name) {
			if (this.forms[name] instanceof Form) return this.forms[name];
			throw 'Error: Form "' + name + '" not found';
		},

		getElement: function(name) {
			if (typeof this.elements[name] !== 'undefined') return this.elements[name];
			throw 'Error: Element "' + name + '" not found';
		},				
		
		
		hasView: function(name) {
			return typeof this._views[name] !== 'undefined';
		},
		
		hasElement: function(name) {
			return typeof this._elements[name] !== 'undefined';
		},
		
		hasForm: function(name) {
			return typeof this._forms[name] !== 'undefined';
		},
		

		on: function(event, callback, context) {
			var proxy = (typeof context !== 'undefined') ? function() { callback.apply(context, arguments); } : callback;
			return this.eventTarget.on.call(this.eventTarget, event, proxy);
		},
		
		detach: function(event, callback) {
			return this.eventTarget.detach.apply(this.eventTarget, arguments);
		},
		
		fire: function(event, data) {
			return this.eventTarget.fire.apply(this.eventTarget, arguments);
		},
		
		
		bindData: function(item, live) {
			Binding.bindData(this.target, item);
			if (live && item instanceof Model) {
				if (this.liveEvt) this.liveEvt.detach();
				var id = item.getId(), model = item.getModel();
				this.liveEvt = model.on('datachange', function(d) {
					if (item.mergeChanges(d)) Binding.bindData(this.target, item);
				}, this);
			}
		},
				
		toString: function() {
			return '[' + this.getType() + ' ' + this.data.name + ']';
		},
				
		destroy: function() {
			for (var name in this._views) {
				this.views[name].destroy();
			}
			for (var name in this._forms) {
				this.forms[name].destroy();
			}
			for (var name in this._elements) {
				delete this.elements[name];
			}
			if (this.liveEvt) this.liveEvt.detach();
			delete this.target;
			delete this.parent;
			delete this.eventTarget;
		}
	
	});
	
	ViewController.views = { 'view': ViewController };
	ViewController.prototype.typeList = '';
	
	ViewController.extend = function(def) {
	
		var m = Class.extend.call(this, def),
				type = def.getType();

		var required = ['getType'];
		for (var i = 0, len = required.length; i < len; i++) {
			if (!def.hasOwnProperty(required[i])) throw "Class missing '" + required[i] + "()' implementation";
			m[required[i]] = def[required[i]];
		}
		m.prototype.typeList += ((m.prototype.typeList == '') ? '' : ' ') + type;
		m.extend = arguments.callee;
		
		return ViewController.views[type] = m;
	
	};
	
	ViewController.load = function(name) {
		if (!this.views.hasOwnProperty(name)) throw "View '" + name + '" not found';
		return this.views[name];
	};
	
	
	MultiViewController = ViewController.extend({
	
		getType: function() { return 'multi-view' },
		
		initialize: function(parent, target) {
			this._super(parent, target);
			this.defaultView = this.target.attr('data-default');
			this.target.removeAttr('data-default');
		},
		
		onLoad: function() {
			for (var i in this._views) {
				if (this._views[i].name !== this.defaultView) {
					this._views[i].target.hide();
				} else {
					this.activeView = this._views[i];
				}
			}
			this._super();
		},
		
		activateView: function(name) {
			var view = this.getView(name);
			if (view instanceof O.ViewController) {
				this.activeView.target.hide();
				this.activeView = view;
				this.activeView.target.show();
			}
		},
		
		getActiveView: function() {
			return this.activeView.name;
		}
	
	});
	
	O.Binding = Binding;
	O.Form		= Form;
	O.Input	= Input;
	
	O.GridViewController			= GridViewController;
	O.LightboxViewController	= LightboxViewController;
	O.ListViewController			= ListViewController;
	O.MapViewController				= MapViewController;
	O.MultiViewController			= MultiViewController;
	O.ProgressViewController	= ProgressViewController;
	O.TableViewController			= TableViewController;
	O.TabViewController				= TabViewController;
	O.TooltipViewController		= TooltipViewController;
	O.ViewController					= ViewController;
	
}, ['mvc'], '1.0.2');