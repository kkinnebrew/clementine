/**
 * commons.js | Orange Commons 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none (socket.io if using websockets)
 * @description base library classes
 */

(function() {

	var Orange, Ajax, Browser, Cache, Class, Element, Events, EventTarget, Loader, Location, Log, Socket, Storage,

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
			isDesktop: !(BrowserDetect.isMobile || BrowserDetect.isTablet)
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