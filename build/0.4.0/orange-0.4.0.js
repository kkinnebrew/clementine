/**
 * OrangeUI | 0.4.0 | 09.03.2012
 * https://github.com/brew20k/orangeui
 * Copyright (c) 2012 Kevin Kinnebrew
 */

/**
 * commons.js | Orange Commons 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none (socket.io if using websockets)
 * @description base library classes
 */
 
(function() {

	var Orange, Class, EventTarget, EventHandle, Events, Log, Loader, Ajax, Element, Cache, Storage, Socket, Location,
	
		__import = function(name) { return Orange[name] },
		__export = function(name, object) { return Orange[name] = object },
		__keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g,
		__modFilterRegex = /[^-A-Za-z_]/g;
	
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
	
	/**
	 * provides basic oop functionality including
	 * inheritance, and accessing super classes
	 */
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

	/**
	 * the returned event object passed to callback
	 * functions
	 */	
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
	
	/**
	 * the event handle returned on every event binding
	 * to maintain a reference for unbinding later
	 */
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
			delete this;
		}
		
		return EventHandle;
	
	})();
	
	/**
	 * the event object to bind, fire, and unbind
	 * events on. this can be used in your other classes
	 * to give them even functionality
	 */	 
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
		
		Events.prototype.detach = function(ev, call) {
		
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
		
		Events.prototype.destroy = function() {
			for(var listener in this._listeners) {
				listener.detach();
			}
			delete this._parent;
			delete this._self;
		};
	
		return Events;
	
	})();
	
	/**
	 * adds basic logging functionality on top
	 * of the console so that the application can
	 * bind to and listen for log messages.
	 * the log is exposed as a global variable.
	 */
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
	
	/**
	 * the loader is used to manage all
	 * developer created modules outside the scope
	 * and namespace of the library
	 */
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
	
	/**
	 * publically available loader function
	 * for adding modules
	 */
	var add = function() {
		var args = arguments,
			name = args[0],
			fn = ( typeof args[1] === 'function' ) ? args[1] : null,
			req = args[2];
		Loader.addModule(name, fn, req);	
	};
	
	/**
	 * publically available loader function
	 * for loading dependant modules
	 */
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
	
	/**
	 * sets the given namespace inside a module
	 */
	var namespace = function(name) {
		if(Orange[name] == undefined) {
			Orange[name] = {};
		}	
	};
	
	/**
	 * wrapper around ajax calls either using jQuery if
	 * available for defaulting to a limited functionality
	 * XMLHttpRequest otherwise.
	 */	
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
						
				if (typeof $ !== 'undefined') return $.ajax(request).responseText;
				else {
					var req = createXMLHttpObject();
					if (!req) return;
									
					var success, error, data, done = false;
					
					if (typeof request.success === 'function') success = request.success;
					if (typeof request.error === 'function') error = request.error;
					if (request.hasOwnProperty('data')) data = encodeURIComponent(request.data);
					var method = request.hasOwnProperty('type') ? request.type : 'GET';
					var url = request.hasOwnProperty('type') ? request.url : null;

					req.open(method, url, true);
					req.setRequestHeader('Cache-Control', 'no-cache');
					req.timeout = 5000;
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
					
					var timeout = setTimeout(ajaxTimeout, 5000);
					
					function ajaxTimeout(){
						req.abort();
					}
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
			
			del: function(request) {
				request.type = 'DELETE';
				return Ajax.load(request);
			}
		
		};
	
	})();
	
	/**
	 * internal wrapper for DOM element lookups using either jQuery 
	 * for defaulting to document.getElementById() providing
	 * event listener bindings
	 */
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
	
	/**
	 * the cache wraps HTML5's new offline mode
	 * using the navigator.onLine propery. it falls
	 * back to polling when offline mode is not supported.
	 * 
	 */
	Cache = (function() {
		
		var active = null, poll = false,
				isOnline = false, isLoaded = false, isInit = false;
				
		var stop = function() {
			if(active != null) {
				clearTimeout(active);
				active = null;
			}
		};
		
		var events = new Events(null, Cache)
		
		var statusCallback = function() {
	
			if(navigator.onLine && !isLoaded) {
				isOnline = true;
				isLoaded = true;
				Cache.fire("statusChange", 1);
				if (poll) setTimeout(statusCallback, 10 * 1000);
				return;
			}
			
			stop();
						
			active = setTimeout(function() {

				if (navigator.onLine && !isLoaded) {
					isOnline = true;
					isLoaded = true;
					Cache.fire("statusChange", 1);
				} else if (navigator.onLine) {
				  
				  var id = Math.floor(Math.random()*10000);
				  
				  Ajax.load({
				  	url: 'ping.js?q='+id, 
				  	type: "GET",
				  	success: function(req) {
					  	if (isOnline === false) {
					  		isOnline = true;
					  		Cache.fire("statusChange", 1);
					  	}
					  	
					  },
					  error: function(req) {
					  	if (isOnline === true) {
					  		isOnline = false;
					  		Cache.fire("statusChange", 0);
					  	}	
					  }
				  });
				  		  				  
				} else {
					
					setTimeout(function() {
						if (isOnline === true) {
							isOnline = false;
							Cache.fire("statusChange", 0);
						}
					}, 100);
				
				}
				
				active = null;
				if (poll) setTimeout(statusCallback, 10 * 1000);
				
			}, (isLoaded ? 100 : 0));
			
		};
		
		var onUpdateReady = function() {
			window.applicationCache.swapCache();
			Log.debug("Cache: Updated cache loaded and ready");
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
	
	/**
	 * storage wraps HTML5 local storage adding
	 * expirations and support for older browsers
	 */
	Storage = (function() {
	
		var _localStorage = window.localStorage,
				isSupported = false, isOnline = false;
				
		if ("localStorage" in window) {
			try {
				window.localStorage.setItem('_test', 1);
				isSupported = true;
				window.localStorage.removeItem('_test');
			} catch (e) {} // iOS5 Private Browsing mode throws QUOTA_EXCEEDED_ERROR DOM Exception 22 via JStorage
		}
		
		if (isSupported) {
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
			    isSupported = true;
				}
			} catch(e) {}
		} else {} // TODO: add support for IE 6/7 userData
		
		if ((typeof JSON === "undefined" || JSON.stringify == undefined) && typeof $ === 'undefined') {
			isSupported = false;
		}

		if (!isSupported) Log.debug("localStorage not supported");	
				
	
		Storage.get = function(key) {
			
			if (!isSupported) return;
			try {
				var item = JSON.parse(_localStorage.getItem(key));
				if (item != undefined && item.data != undefined) {
					if (isOnline && item.ttl !== -1 && ((new Date()).getTime() - item.timestamp) > item.ttl) {
						_localStorage.removeItem(key);
					}
					return item.data; 
				}
			} catch(e) {
				Log.error("Error fetching object from localStorage");
			}
			
		};
		
		Storage.set = function(key, value, ttl) {
					
			if (!isSupported) return false;
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
			if (!isSupported) return false;
			_localStorage.removeItem(key);
		};
		
		Storage.flushExpired = function(force) {
			if (!isSupported) return;			
			if (isOnline === false && force !== true) return;
			for (var key in _localStorage) {
				Storage.get(key);
			}
		};
		
		Storage.flush = function(force) {
			if (!isSupported) return;
			if (isOnline === false && force !== true) return;
			_localStorage.clear();
			Log.info("Clear: Local storage cleared");
		};
		
		Storage.isSupported = function() {
			return isSupported;
		};
	
		Storage.goOnline = function() {
			isOnline = true;
		};
		
		Storage.goOffline = function() {
			isOnline = false;
		};
	
		function Storage() {}
	
		return Storage;
	
	})();
	
	/**
	 * basic wrapper for web sockets using
	 * socket.io for support
	 */
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
	
	/**
	 * adds wrapper for support for HTML5's geolocation
	 * TODO handle time zone differences
	 */
	Location = (function() {
	
		var location = null, timestamp = null,
				expire = 60 * 60 * 1000;
	
		return {
		
			get: function(success, error) {
			
				if (!Location.isExpired() && typeof success !== 'undefined') return success(location);
					
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(position) {
						timestamp = (new Date().getTime());
						location = position.coords;
						if (typeof success == 'function') success(position.coords);
					},
					function(error) {
						switch (error.code) {
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
			
			},
			
			isExpired: function() {
				return ((new Date()).getTime() - timestamp) > expire;
			}
		
		}
	
	})();
	
	/**
	 * performs user ageent detection to determine the 
	 * browser, version, os, and device for an application
	 */
	Browser = (function() {
	
		var BrowserDetect = {
		
			init: function () {
				this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
				this.version = this.searchVersion(navigator.userAgent)
					|| this.searchVersion(navigator.appVersion)
					|| "an unknown version";
				this.OS = this.searchString(this.dataOS) || "an unknown OS";
				
				// check device
				var useragent = navigator.userAgent.toLowerCase();
				if (useragent.search("iphone") > 0 || useragent.search("ipod") > 0) this.device = 'Phone';
				else if (useragent.search("ipad") > 0) this.device = 'Tablet';
				else if (useragent.search("mobile") > 0 && this.OS == 'Android') this.device = 'Phone';
				else if (this.OS == 'Android') this.device = 'Tablet';
				else this.device = 'Desktop';
				if (this.OS == 'Android' && useragent.search("galaxy_tab") > 0) this.device = 'Tablet';
				
				// check scrolling
				if (this.device == 'desktop') this.nativeScroll = true;
				else if (this.OS == 'iOS' && navigator.userAgent.match(/ OS 5_/i)) this.nativeScroll = true;
				else if (navigator.userAgent.match(/ HTC/i) || navigator.userAgent.match(/ Desire_A8181/i)
				  || navigator.userAgent.match(/ myTouch4G/i) || navigator.userAgent.match(/ ADR6200/i)) {
				    this.nativeScroll = true;
				} else this.nativeScroll = false;
				
			},
			
			searchString: function (data) {
				for (var i = 0; i < data.length; i++)	{
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
				var str = dataString.substring(index+this.versionSearchString.length+1).split(' ', 1).pop();
				return str.split('.', 2).join('.').replace(';', '');
			},
			
			dataBrowser: [
				{ string: navigator.userAgent, subString: "Android", versionSearch: "Android", identity: "Android" },
				{ string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
				{ string: navigator.userAgent, subString: "OmniWeb", versionSearch: "OmniWeb/", identity: "OmniWeb" },
				{ string: navigator.vendor, subString: "Apple", identity: "Safari", versionSearch: "Version" },
				{ prop: window.opera, identity: "Opera", versionSearch: "Version" },
				{ string: navigator.vendor, subString: "iCab", identity: "iCab" },
				{ string: navigator.vendor, subString: "KDE", identity: "Konqueror" },
				{ string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
				{ string: navigator.vendor, subString: "Camino", identity: "Camino" },
				{	string: navigator.userAgent, subString: "Netscape", identity: "Netscape" },
				{ string: navigator.userAgent, subString: "MSIE", identity: "Explorer", versionSearch: "MSIE" },
				{ string: navigator.userAgent, subString: "Gecko", identity: "Mozilla", versionSearch: "rv" },
				{ string: navigator.userAgent, subString: "≈", identity: "Netscape", versionSearch: "Mozilla" }
			],
			dataOS : [
				{ string: navigator.userAgent, subString: "Android", identity: "Android" },
				{ string: navigator.userAgent, subString: "iPhone", identity: "iOS" },
				{ string: navigator.userAgent, subString: "iPad", identity: "iOS" },
				{ string: navigator.platform, subString: "Win", identity: "Windows" },
				{ string: navigator.platform, subString: "Mac", identity: "Mac" },
				{ string: navigator.platform, subString: "Linux", identity: "Linux" }
			]
		
		};
		
		BrowserDetect.init();
		
		return {
			browser: BrowserDetect.browser,
			version: BrowserDetect.version,
			os: BrowserDetect.OS,
			device: BrowserDetect.device,
			scroll: BrowserDetect.nativeScroll,
			touch: (BrowserDetect.OS == 'Android' || BrowserDetect.OS == 'iOS')
		}
	
	})();
	
	Orange 					= this.Orange = {};
	Orange.version 	= '0.3';
	Orange.__import = this.__import = __import;
	Orange.modules 	= {};

	Orange.add = add;
	Orange.use = use;
	Orange.namespace = namespace;

  Orange.Ajax 				= Ajax;
	Orange.Browser 			= Browser;
	Orange.Cache 				= Cache;
	Orange.Class 				= this.Class = Class;
	Orange.Events 			= Events;
	Orange.Loader				= Loader;
	Orange.Location 		= Location;
  Orange.Log 					= this.Log = Log;  
  Orange.Storage 			= Storage;
	

}).call(this);
/**
 * mvc.js | Orange MVC Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2
 * @description base model-view-controller classes
 */

Orange.add('mvc', function(O) {

	var Application, Controller, View, Source, AjaxSource, LocalStorageSource, RestSource, PersistentStorageSource, Model, Collection, PersistenceManager;
	
	// import dependencies
	var Ajax 			= __import('Ajax'),
			Cache 		= __import('Cache'),
			Events 		= __import('Events'),
			Loader 		= __import('Loader'), 
			Location 	= __import('Location'),
			Storage 	= __import('Storage');

	/**
	 * the application stores all the configuration and
	 * initial loading logic. the onLoad() method should be
	 * overriden for a custom application.
	 * fires [load, unload, online, offline]
	 */
	Application = Class.extend({
		
		initialize: function(config) {
		
			// validate requirements
			if (!config.hasOwnProperty('name') || (new RegExp(/[^A-Za-z:0-9_\[\]]/g)).test(config.name)) throw 'Invalid application name';
			if (!config.hasOwnProperty('required')) config.required = [];
			if (!config.hasOwnProperty('location')) config.location = false;
			if (!config.hasOwnProperty('log')) config.log = 'none';
		
			// store config
			this.config = config;
		
			// setup event target
			this.events = new Events(null, this);
			
			// set states
			this._isOnline = false;
			this.isLoaded = false;
				
		},
		
		load: function() {

			// load dependencies
			for (var i = 0, len = this.config.required.length; i < len; i++) {
				Loader.loadModule(this.config.required[i]);
			}
			
			// set logging level
			Log.setLevel(this.config.log);
			
			// bind caching event
			Cache.on('statusChange', Class.proxy(function(e) {
				
				// detach one time event
				Cache.detach();
				
				// set online status
				this._isOnline = e.data == 1;
						
				if (!this.loaded) this.initStorage.call(this);
														
			}, this));
			
			// setup caching
			Cache.init(true);
			
		},
		
		unload: function() {
			if (this.isLoaded) {
				this.fire('unload');
				this.events.detach();
			}
		},
		
		initStorage: function() {
			
			// initialize persistence manager
			if (!this.isLoaded) PersistenceManager.init();
			
			// change storage status
			if (this._isOnline) Storage.goOnline();
			else Storage.goOffline();
			
			// flush cache if new version
			if (!this.isLoaded && this.config.hasOwnProperty('version') && Storage.get('appVersion') !== this.config.version) {
				PersistenceManager.flush();
				Storage.set('appVersion', this.config.version);
			}
			
			// setup location
			this.initLocation.call(this);
		
		},
		
		initLocation: function() {
		
			// fetch location
			if (this.config.location) Location.get();
			
			// call load
			if (!this.isLoaded) this._onLoad.call(this);
		
		},
		
		_onLoad: function() {
		
			// prevent duplicate loading
			if (this.isLoaded) return;
									
			// set as loaded
			this.isLoaded = true;
						
			// go online
			this.onLoad();
						
			// bind online offline event
			Cache.on('statusChange', Class.proxy(function(e) {

				// set online status
				this._isOnline = e.data == 1;
				
				// run events		
				this.initStorage();
				this.initLocation();
				
				// call online/offline
				if (this._isOnline) this.onOnline();
				else this.onOffline();
														
			}, this));
			
		},
		
		onLoad: function() {
		
			Log.info('Application loaded');
			
			// fire load event
			this.fire('load');
		
			// go online
			if (this._isOnline) this.onOnline();
			else this.onOffline();
		
		},
		
		onOnline: function() {
		
			Log.info('Application went online');
			
			// fire offline event
			this.fire('offline');
		
		},
		
		onOffline: function() {
		
			Log.info('Application is offline');
			
			// fire online event
			this.fire('online');
		
		},
		
		on: function(ev, call, context) {
			var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
			return this.events.on.call(this.events, ev, proxy);
		},
		
		fire: function() {
			return this.events.fire.apply(this.events, arguments);
		},
		
		detach: function() {
			return this.events.detach.apply(this.events, arguments);
		},
		
		isOnline: function() {
			return this._isOnline;
		}
	
	});
	
	/**
	 * this is the base controller class
	 * which will be overriden by other controllers
	 */
	Controller = Class.extend({
	
		initialize: function() {},
		destroy: function() {}
	
	});
	
	/**
	 * views can be stored externally and loaded dynamically
	 * via a given path. when loading different views from the
	 * same file, a type and or name should be included. for overriding
	 * default views, only the last view will be used if duplicates exist.
	 */
	View = (function() {
	
		var views = {};
	
		var fetch = function(path) {
						
			if (views.hasOwnProperty(path)) return views[path];
			
			var view = $.ajax({
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
			
			views[path] = view;
			
			return view;
			
		};
	
		return {
		
			load: function(path, type, name) {
				
				if (typeof path === 'undefined' || path == '') return;

				var source = fetch(path), views, view;
				
				if ($(source).length > 1) views = $('<div>' + source + '</div>');
				else if (typeof type == 'undefined' && typeof name == 'undefined') return $(source);

				if (typeof type !== 'undefined' && typeof name !== 'undefined') {
					view = views.find('[data-control="' + type + '"][data-name="' + name + '"]:last');
				} else if (typeof type !== 'undefined') {
					view = views.find('[data-control="' + type + '"]:last');
				} else throw 'View not found';
								
				if (view.length) return view;
				else throw 'View not found';
				
			}
			
		}
	
	})();

	/**
	 * the base source class is overridden to
	 * provide custom handling of different types of
	 * data sources. the config.name property is required.
	 */
	Source = Class.extend({
	
		initialize: function(config) {
			if (typeof config === 'undefined') return;
			this.config = config;
			var name = this.config.name;
			if ((/[^A-Za-z:0-9_\[\]]/g).test(name)) throw 'Invalid character in source name "' + name + '"';
		},
		
		getName: function() {
			return (this.config || {}).hasOwnProperty('name') ? this.config.name : 'source';
		},
		
		supportsModels: function() {
			return false;
		},
		
		isPersistent: function() {
			return false;
		},
		
		destroy: function() {
			delete this.config;
		}
	
	});
	
	/**
	 * overrides the base data source to allow for data requests
	 * via ajax
	 */
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
	
	/**
	 * the local storage source allows the access of model
	 * data cached to localStorage via the model get/set methods
	 */
	LocalStorageSource = Source.extend({
	
		isPersistent: function() {
			return true;
		},
		
		supportsModels: function() {
			return true;
		},
		
		getPath: function(type) {
			return 'model:' + this.getName() + ':' + type;
		},
		
		getAll: function(type) {
			return Storage.get(this.getPath(type)) || undefined;
		},
		
		get: function(type, id) {
			var data = Storage.get(this.getPath(type)) || {};
			return data.hasOwnProperty(id) ? data[id] : undefined;
		},
		
		setAll: function(type, data) {
			if (data instanceof Array) throw 'Invalid input, expecting object';
			return Storage.set(this.getPath(type), data);
		},
		
		set: function(type, id, object) {
			if (id === null) id = this.nextKey(type);
			if (typeof object === 'undefined') return;
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
	
	/**
	 * the rest source provides a standard implementation
	 * of interaction with a REST webservice for retrieving
	 * model data
	 */
	RestSource = AjaxSource.extend({
	
		initialize: function(config) {
			if (typeof config === 'undefined') return;
			this.config = config;
			if (!this.config.hasOwnProperty('path')) throw 'Rest Source missing path';
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
				success.call(this, this.processItems(type, data));
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
	
	
	PersistentStorageSource = Source.extend({
	
		isPersistent: function() {
			return true;
		},
		
		supportsModels: function() {
			return true;
		},
		
		getPath: function() {
			return this.getName() + ':' + 'model';
		},
		
		getAllActions: function() {
			var models = Storage.get(this.getPath()) || {}, output = {};
			for (var model in models) {
				var m = Model._models[model],
						actions = models[model];
				for (var id in actions) {
					output[id] = { model: m, item: actions[id] };
				}
			}
			return (output) ? output : null;
		},
		
		getAll: function(type) {
			var models = Storage.get(this.getPath());
			return (typeof models !== 'undefined' && models.hasOwnProperty(type)) ? models[type] : null; 
		},
		
		get: function(type, id) {
			var models = Storage.get(this.getPath());
			return (typeof models !== 'undefined' && models.hasOwnProperty(type)) ? (models[type].hasOwnProperty(id) ? models[type][id] : null) : null; 
		},
		
		setAll: function(type, data) {
			if (data instanceof Array) throw 'Invalid input, expecting object';
			var models = Storage.get(this.getPath());
			models[type] = data;
			return Storage.set(this.getPath(), models);
		},
		
		set: function(type, id, object) {
			if (id === null) id = this.nextKey(type);
			var data = Storage.get(this.getPath()) || {};
			if (!data.hasOwnProperty(type)) data[type] = {};
			data[type][id] = object;
			Storage.set(this.getPath(), data);
			return id;
		},
		
		remove: function(type, id) {
			var data = Storage.get(this.getPath());
			if (data && data.hasOwnProperty(type) && data[type].hasOwnProperty(id)) delete data[type][id];
			else return null;
			Storage.set(this.getPath(), data);
			return true;
		},
		
		flush: function(type) {
			 Storage.remove(this.getPath());
		},
		
		nextKey: function(type) {
			var size = 0, key, keys = [];
			var obj = Storage.get(this.getPath()) || {};
			if (obj.hasOwnProperty(type)) obj = obj[type];
			else obj[type] = {};
			for (key in obj) {
				if (obj.hasOwnProperty(key) && !isNaN(key)) keys.push(parseInt(key, 10));
			} 
			return (keys.length > 0) ? Math.max.apply(Math, keys) + 1 : 1;
		}
	
	});
	
	/**
	 * represents each data instance and can be manipulated
	 * and edited in real time
	 */
	Model = Class.extend({
		
		initialize: function(data) {
		
			this.getName();
			var field = this.constructor.getKey();
			this._isSaved = ((data || {}).hasOwnProperty(field) && !(data || {}).hasOwnProperty('_unsaved')) ? true : false;
			this.id = (data || {}).hasOwnProperty(field) ? data[field] : null;
			this.data = data || {};
			this.hasChanges = false;
			this.fields = this.constructor.getFields();
			this.events = [];
			this.eventTarget = new Events(null, this);
			
			this.events.push(this.constructor.on('datachange', Class.proxy(this.mergeDelta, this)));
			this.events.push(this.constructor.on('datasync', Class.proxy(this.syncDelta, this)));
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
			if (!this.fields.hasOwnProperty(name)) throw "Field does not exist";
			return this.data[name];
		},
		
		set: function(name, value) {
			if (!this.fields.hasOwnProperty(name)) throw "Field does not exist";
			this.data[name] = value;
			this.hasChanges = true;
		},
		
		clear: function(name) {
			if (!this.fields.hasOwnProperty(name)) throw "Field does not exist";
			delete this.data[name];
			this.hasChanges = true;
		},
		
		refresh: function() {
			var item = this.constructor.get(this.getId());
			this.data = item.toObject();
			this.hasChanges = false;
		},
		
		save: function(success, error, context) {
			if (!this.hasChanges) return;
			var successFunc = function(data) {
				this.hasChanges = false;
				this._isSaved = data.isSaved();
				this.id = data.getId();
				data.destroy();
				if (typeof success === 'function') success(this);
			};
			this.constructor.set(this.data, Class.proxy(successFunc, this), error, context);
		},
		
		remove: function(success, error, context) {
			var successFunc = function() {
				this.destroy();
				if (success) success.call(context);
			};
		
			if (this.exists()) {
				this.constructor.remove(this.id, Class.proxy(successFunc, this), error, context);
			}
		},
		
		mergeDelta: function(e) {
			var delta = e.data;
			if (this.id && delta.id == this.id) {
				if (delta.action == 'set') this.data = delta.item;
				else if (delta.action == 'delete') this.destroy();
			}
		},
		
		syncDelta: function(e) {
			var delta = e.data;
			if (this.id && delta.id == this.oldId) {
				this.id = delta.id;
				this.data[this.constructor.getKey()] = delta.id;
			}
		},
		
		isSaved: function() {
			return this._isSaved;
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
		
		on: function(ev, call, context) {
			var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
			return this.eventTarget.on.call(events, ev, proxy);
		},
		
		fire: function() {
			return this.eventTarget.fire.apply(events, arguments);
		},
		
		detach: function() {
			return this.eventTarget.detach.apply(events, arguments);
		},
		
		destroy: function() {
			this._isSaved = false;
			this.id = null;
			this.data = {};
			for (var i = 0, len = this.events.length; i < len; i++) {
				this.events[i].detach();
			}
			this.eventTarget.destroy();
			this.events = [];
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
		var context = typeof context === 'function' ? context : this;
		var successFunc = function(data) {
			var mappedData = Model.mapItems.call(this, data), output = {};
			if (typeof query === 'function') {
				for (var i in mappedData) {
					if (query == null || query.call(this, mappedData[i])) {
						output[i] = mappedData[i];
					}
				} mappedData = output;
			}
			success.call(context, new Collection(this, mappedData));
		};
		PersistenceManager.getAll(this, Class.proxy(successFunc, this), Class.proxy(error, context));
	};
	
	Model.get = function(id, success, error, context) {
		var context = typeof context === 'function' ? context : this;
		var successFunc = function(data) {
			var mappedData = Model.mapItem.call(this, data);
			success.call(context, new this(mappedData));
		};
		PersistenceManager.get(this, id, Class.proxy(successFunc, this), error ? Class.proxy(error, context) : function() {});
	};
	
	Model.set = function(item, success, error, context) {
		if (item instanceof Model) item = item.toObject();
		var id = item.hasOwnProperty(this.getKey()) ? item[this.getKey()] : null;
		var context = typeof context === 'function' ? context : this;
		var successFunc = function(data) {
			var mappedData = Model.mapItem.call(this, data);
			this.fire('datachange', { action: 'set', id: mappedData[this.getKey()], item: mappedData });
			if (success) success.call(context, new this(mappedData));
		};
		PersistenceManager.set(this, id, Model.unmapItem.call(this, item), Class.proxy(successFunc, this), error ? Class.proxy(error, context) : function() {});
	};
	
	Model.remove = function(id, success, error, context) {
		var context = typeof context === 'function' ? context : this, deltaId = id;
		var successFunc = function(data) {
			this.fire('datachange', { action: 'delete', id: id });
			if (success) success.call(context, deltaId);
		};
		PersistenceManager.remove(this, id, Class.proxy(successFunc, this), error ? Class.proxy(error, context) : function() {});
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
		if (data['_unsaved']) model['_unsaved'] = true;									
		for (var field in fields) {
			var source = fields[field].name, 
					value = (data.hasOwnProperty(source)) && data[source] != null ? data[source] : undefined;		
			if (value === undefined && !fields[field].nullable) {
				Log.warn("Could not parse JSON field '" + field + "' for " + this.getName());
				continue;
			}
			else if (value !== undefined) model[field] = value;
		}
		return model;
	},
	
	Model.mapItems = function(data) {
		var models = {}, id = this.getKey();
		for (var i in data) {
			var model = Model.mapItem.call(this, data[i]);
			if (typeof model === 'object') models[i] = model;
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
					value = (object.hasOwnProperty(field)) ? object[field] : undefined;
			if (value === undefined && !fields[field].nullable) {
				Log.warn("Missing data for field '" + field + "' for " + this.getName());
				continue;
			}		
			else if (value !== undefined) data[source] = value;
		}
		return data;
	}
	
	Model._models = {};
	
	Model.extend = function(def) {
		
		var m = Class.extend.call(this, def);
				
		var required = ['getName', 'getFields', 'getSource'];
		for (var i = 0, len = required.length; i < len; i++) {
			if (!def.hasOwnProperty(required[i])) throw "Class missing '" + required[i] + "()' implementation";
			m[required[i]] = def[required[i]];
		}
		
		var source = def.getSource();
		if (!source.supportsModels()) throw "Source '" + source.getName() + "' does not support models";
		
		m.events = new Events(null, this);
		
		m.getId = function() { return Model.getId.apply(m, arguments); };
		m.getKey = function() { return Model.getKey.apply(m, arguments); };
		m.getAll = function() { return Model.getAll.apply(m, arguments); };
		m.get = function() { return Model.get.apply(m, arguments); };
		m.set = function() { return Model.set.apply(m, arguments); };
		m.remove = function() { return Model.remove.apply(m, arguments); };
		
		m.on = function() { return Model.on.apply(m, arguments); };
		m.fire = function() { return Model.fire.apply(m, arguments); };
		m.detach = function() { return Model.detach.apply(m, arguments); };
		
		Model._models[m.getName()] = m;
		
		return m;
			
	};
	
	/**
	 * represents a list of model objects and allows
	 * for filtering and fetching
	 */
	Collection = Class.extend({
		
		initialize: function(model, data) {
			
			this.model = model
			this.data = data;
			this.active = data;
			this.list = this.toArray();
			this.events = [];
			this.eventTarget = new Events(null, this);
			
			this.events.push(this.model.on('datachange', Class.proxy(this.mergeDeltas, this)));
			this.events.push(this.model.on('datasync', Class.proxy(this.syncDeltas, this)));

		},
		
		mergeDeltas: function(e) {
						
			var delta = e.data;
							
			if (delta.action == 'set') {
				this.data[delta.id] = delta.item;
				if (this.active.hasOwnProperty(delta.id)) this.active[delta.id] = delta.item;
			} else if (delta.action == 'delete') {
				if (this.data.hasOwnProperty(delta.id)) delete this.data[delta.id];
				if (this.active.hasOwnProperty(delta.id)) delete this.active[delta.id];
			}
			
			this.list = this.toArray();
			
		},
		
		syncDeltas: function(e) {
						
			var delta = e.data;
			
			if (this.data.hasOwnProperty(delta.oldId)) {
				
				var item = this.data['c' + delta.oldId];
				delete this.data['c' + delta.oldId];
				this.data[delta.id] = item;
				this.data[delta.id][this.model.getKey()] = delta.id;
				if (this.data[delta.id]['_unsaved']) delete this.data[delta.id]['_unsaved'];
				
				if (this.active.hasOwnProperty(delta.oldId)) {
					delete this.active[delta.oldId]
					this.active[delta.id] = item;
				}
				
				this.list = this.toArray();
			}
			
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
		},
		
		on: function(ev, call, context) {
			var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
			return this.eventTarget.on.call(events, ev, proxy);
		},
		
		fire: function() {
			return this.eventTarget.fire.apply(events, arguments);
		},
		
		detach: function() {
			return this.eventTarget.detach.apply(events, arguments);
		},
		
		destroy: function() {
			for (var i = 0, len = this.events.length; i < len; i++) {
				this.events[i].detach();
			}
			this.eventTarget.destroy();
			this.events = [];
		}
		
	});
		
	/**
	 * manages persistent data across offline and online
	 * states
	 */
	PersistenceManager = (function() {
	
		var isSyncing = false, isLive = false;
		
		PersistenceManager.init = function() {
						
			isLive = !(Cache.isActive() && !Cache.isOnline());
			
			this.cacheDS = new LocalStorageSource({ name: 'cache' });
			this.createDS = new PersistentStorageSource({ name: 'create' });
			this.updateDS = new PersistentStorageSource({ name: 'update' });
			this.deleteDS = new PersistentStorageSource({ name: 'delete' });
			this.pendingDS = new PersistentStorageSource({ name: 'pending' });
						
			Cache.on('statusChange', Class.proxy(this.onStatusChange, this));
			
		};
		
		PersistenceManager.getAll = function(model, success, error) {
			
			var offlineFunc = function(data) {
			
				var creates = this.createDS.getAll(model.getName()),
						updates = this.updateDS.getAll(model.getName()),
						deletes = this.deleteDS.getAll(model.getName()),
						pending = this.pendingDS.getAll(model.getName());
								
				for (var key in creates) {
					var c = creates[key];
					c[model.getId()] = 'c' + key;
					data['c' + key] = c;
					data['c' + key]['_unsaved'] = true;
				}
				for (var key in updates) {
					data[key] = updates[key];
					data[key]['_unsaved'] = true;
				}
				for (var key in deletes) delete data[key];
								
				if (isSyncing) for (var key in pending) data[pending[model.getId()]] = pending[key];
				
				success(data);
			
			};
			
			var onlineFunc = function(data) {
				var output = {};
				for (var i = 0, len = data.length; i < len; i++) {
					output[data[i][model.getId()]] = data[i];
				}
				this.cacheDS.setAll(model.getName(), output); // TO DO: check if this is array or list
				success.call(this, output);
			};
				
			if (!isLive) {
				var items = this.cacheDS.getAll(model.getName());
				if (items != undefined) offlineFunc.call(this, items)
				else error.call(this);
			}
			else model.getSource().getAll(model.getName(), Class.proxy(onlineFunc, this), error);
		
		};

		PersistenceManager.get = function(model, id, success, error) {
							
			var onlineFunc = function(data) {
				this.cacheDS.set(model.getName(), id, data);
				success(data);
			};
			
			var onlineFuncError = function(e) {
				if (e.status == '404') {
					this.cacheDS.remove(model.getName(), id);
				} error(e);
			};
			
			if (!isLive) {

				var item = this.cacheDS.get(model.getName(), id);
								
				var creates = this.createDS.getAll(model.getName()),
						updates = this.updateDS.getAll(model.getName()),
						deletes = this.deleteDS.getAll(model.getName()),
						pending = this.pendingDS.getAll(model.getName()),
						data = null;
				
				if (isSyncing) {
					for (var i in pending) {
						if (pending[i].hasOwnProperty(model.getId()) && pending[i][model.getId()] == id) data = pending[i];
					}
				}
				
				var cid = false;
				if (id.substr(0, 1) == 'c') cid = true;

				if (cid && creates && creates.hasOwnProperty(id.substr(1))) {
					data = creates[id.substr(1)];
					if (data) data[model.getId()] = id;
				}
				if (!cid && updates && updates.hasOwnProperty(id) && data == null) data = updates[id];
				if (!cid && deletes && deletes.hasOwnProperty(id)) throw "Cannot fetch deleted item";
				
				if (data) {
					data['_unsaved'] = true;
				}
				
				if (item != undefined || data) success((!data) ? item : data);
				else error.call(this);
			}
			else model.getSource().get(model.getName(), id, Class.proxy(onlineFunc, this), Class.proxy(onlineFuncError, this));
		
		};
		
		
		PersistenceManager.set = function(model, id, item, success, error) {
									
			var offlineFunc = function(data) {
				data['_unsaved'] = true;
				success(data);
			};
			
			var onlineFunc = function(data) {
				this.cacheDS.set(model.getName(), data[model.getId()], data);
				success(data);
			};
						
			if (!isLive) {
								
				if (!id) {
								
					var id = 'c' + this.createDS.set(model.getName(), null, item);
					if (!id) error();
					else {
						item[model.getId()] = id;
						offlineFunc(item);
					}
				} else if (isSyncing) {
										
					var deletes = this.deleteDS.getAll(model.getName());
				
					if (deletes && deletes.hasOwnProperty(id)) {
						throw 'Cannot update already removed item';
					} else {
						this.pendingDS.set(model.getName(), null, item);
						offlineFunc.call(this, item);
					}
						
				} else {
										
					var creates = this.createDS.getAll(model.getName()),
							deletes = this.deleteDS.getAll(model.getName());
				
					if (creates && creates.hasOwnProperty(id.substr(1))) this.createDS.set(model.getName(), id.substr(1), item);
					else if (deletes && deletes.hasOwnProperty(id)) throw 'Cannot update already removed item';
					else this.updateDS.set(model.getName(), id, item);
					
					offlineFunc.call(this, item);
						
				}
								
			}
			else model.getSource().set(model.getName(), id, item, Class.proxy(onlineFunc, this), error);
		
		};
		
		PersistenceManager.remove = function(model, id, success, error) {
						
			var onlineFunc = function(data) {
				this.cacheDS.remove(model.getName(), id);
				success(data);
			};
		
			if (!isLive) {
						
				var creates = this.createDS.getAll(model.getName()),
						updates = this.updateDS.getAll(model.getName()),
						deletes = this.deleteDS.getAll(model.getName());
						
				var cid = false;
				if (id.substr(0, 1) == 'c') cid = true;
			
				if (cid && creates && creates.hasOwnProperty(id.substr(1))) this.createDS.remove(model.getName(), id.substr(1));
				if (!cid && updates && updates.hasOwnProperty(id)) this.updateDS.remove(model.getName(), id);
				if (!cid && deletes && deletes.hasOwnProperty(id)) throw 'Cannot delete already removed item';
				else if (!cid) this.deleteDS.set(model.getName(), id, {});
				
				success(id);
				
			} else model.getSource().remove(model.getName(), id, Class.proxy(onlineFunc, this), error);
			
		};
		
		PersistenceManager.flush = function() {
		
			this.createDS.flush(true);
			this.updateDS.flush(true);
			this.deleteDS.flush(true);
			this.pendingDS.flush(true);
			
		};
		
		PersistenceManager.onStatusChange = function(e) {
						
			if (e.data == 1 && !isSyncing) {
				setTimeout(Class.proxy(function() {
					this.onSync();		
				}, this), 150);		
			} else {
				if (isSyncing) {
					this.onSyncFailure.call(this);
				} else {
					isLive = !(Cache.isActive() && !Cache.isOnline());
				}
			}
			
		};
		
		PersistenceManager.onSync = function(force) {
			
			if (isSyncing && !force) return;
			
			isSyncing = true;
			
			var createSuccessFunc = function(data, id, model, name, newId) {
								
				this.createDS.remove(name, id);
				this.cacheDS.set(name, newId, data);
				
				model.fire('datasync', {
					oldId: id,
					id: newId
				});
				
				this.syncCount--;
				this.checkSyncStatus();
			
			};
			
			var updateSuccessFunc = function(data, id, model, name) {
						
				this.updateDS.remove(name, id);
				this.cacheDS.set(name, id, data);
				
				this.syncCount--;
				this.checkSyncStatus();
			
			};
			
			var deleteSuccessFunc = function(id, model, name) {
								
				this.deleteDS.remove(name, id);
				this.cacheDS.remove(name, id);
				
				this.syncCount--;
				this.checkSyncStatus();
			
			};
				
			var creates = this.createDS.getAllActions(),
					updates = this.updateDS.getAllActions(),
					deletes = this.deleteDS.getAllActions();
					
			this.syncCount = 0;

			if (creates) for (var i in creates) this.syncCount++;
			if (updates) for (var i in updates) this.syncCount++;
			if (deletes) for (var i in deletes) this.syncCount++;
						
			if (this.syncCount == 0) {
				this.checkSyncStatus();
				return;
			}
			
			var syncCreate = Class.proxy(function(id, object) {
				var model = object.model;
				var item = object.item;
				delete item[model.getId()];
				model.getSource().set(model.getName(), null, item, Class.proxy(function(data) {				
					createSuccessFunc.call(this, data, id, model, model.getName(), data[model.getId()]);				
				}, this), this.onSyncFailure);
			}, this);
			
			var syncUpdate = Class.proxy(function(id, object) {
				var model = object.model;
				model.getSource().set(model.getName(), id, object.item, Class.proxy(function(data) {				
					updateSuccessFunc.call(this, data, id, model, model.getName());				
				}, this), this.onSyncFailure);
			}, this);
			
			var syncDelete = Class.proxy(function(id, object) {
				var model = object.model;
				model.getSource().remove(model.getName(), id, Class.proxy(function(data) {				
					deleteSuccessFunc.call(this, id, model, model.getName());				
				}, this), this.onSyncFailure);
			}, this);
		
			for (var id in creates) syncCreate(id, creates[id]);
			for (var id in updates) syncUpdate(id, updates[id]);
			for (var id in deletes) syncDelete(id, deletes[id]);
					
		};
		
		PersistenceManager.onSyncSuccess = function() {

			isSyncing = false;
			isLive = !(Cache.isActive() && !Cache.isOnline());
		
			Log.info("Synced with server");
			
		};
		
		PersistenceManager.onSyncFailure = function() {
			Log.info("Could sync with server");
		};
		
		PersistenceManager.checkSyncStatus = function() {
						
			if (this.syncCount == 0) {
				var pending = this.pendingDS.getAllActions();
				if (pending.length > 0) {				
					for (var i in pending) {					
						var model = pending[i].model, item = pending[i].item;
						if (item.hasOwnProperty(model.getId())) var id = item[model.getId()];
						else throw "Pending item missing id";
						this.updateDS.set(model.getName(), item, id);
						this.pendingDS.remove(model.getName(), id);						
					}					
					this.onSync(true)					
				} else PersistenceManager.onSyncSuccess.call(this);
			}
			
		};
		
		PersistenceManager.destroy = function() {
			Cache.detach('statusChange', this.proxy);
		}
		
		function PersistenceManager() {}
		
		return PersistenceManager;
	
	})();
		

	O.Application = Application;
	O.Collection	= Collection;
	O.Controller	= Controller;
	O.Model				= Model;
	O.Source			= Source;
	O.View				= View;

	O.AjaxSource 								= AjaxSource;
	O.LocalStorageSource 				= LocalStorageSource;
	O.RestSource 								= RestSource;
	O.PersistenceManager				= PersistenceManager;
	O.PersistentStorageSource		= PersistentStorageSource;
	
}, [], '0.3');
/**
 * ui.js | Orange UI Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2, history.js
 * @description commonly used view controllers
 */

Orange.add('ui', function(O) {

	var UIApplication, Binding, Form, Input, MultiViewController, ViewController;

	// import dependencies
	var Application = __import('Application'), 
			Collection 	= __import('Collection'),
			Events 			= __import('Events'), 
			Model 			= __import('Model');
	
	/**
	 * overrides the base application class to handle
	 * lookup of root view controller and default loading
	 * of root view
	 */
	UIApplication = Application.extend({
	
		onLoad: function() {
			
			// fetch root element
			var root = $('[data-root]'),
			type = root.attr('data-control'),
			name = root.attr('data-name');
			if (typeof type === 'undefined' || typeof name === 'undefined') throw 'Root view not found';
			
			// remove root attribute
			root.removeAttr('data-root');
			
			// load view
			var c = ViewController.get(type);
			var controller = new c(null, root);
			
			controller.on('load', function() {	
				controller.show();
			});
		
			// load controller	
			controller.load();
			
			// call superclass
			this._super();
		
		}
	
	});
	
	/**
	 * bindings are used to apply live data to DOM elements
	 * so that any updates to a Model or Collection are automatically
	 * pushed to the DOM
	 */
	Binding = Class.extend({
	
		initialize: function(node) {
	
			this.node = node;
			this.template = node.clone();
			this.eventTarget = new Events(null, this);
			this.loaded = false;
		
		},
		
		bindData: function(model, live) {
		
			// check if already loaded
			if (this.loaded) return;
		
			// pass to binding method
			this._bindData(this.node, model);
				
			// set as loaded
			this.loaded = true;
		
		},
		
		_bindData: function(node, model, id) {
		
			if (model instanceof Model) {
				var id = model.getId(), data = model.toObject();
			} else if (typeof model !== 'undefined') {
				data = model, id = id;
			} else {
				Log.error('Invalid model item');
				return;
			}
						
			if (id) node.attr('itemid', id);
			
			// parse data fields
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
						if (data[field] instanceof Array || data[field] instanceof Collection) {
							this._bindList(childList[i], data[field]);
						} else if (typeof data[field] === 'object' || data[field] instanceof Model) {
							this._bindData(childList[i], data[field]);
						} else childList[i].text(data[field]);
					}
				}
			}
		
		},
		
		bindList: function(list, live) {
				
			// check if already loaded
			if (this.loaded) return;

			// bind data
			this._bindList(this.node, list);
			
			// set as loaded
			this.loaded = true;
				
			
		},
		
		_bindList: function(node, list) {
		
			var itemscope = $(node).find('[itemscope]');
			if (!itemscope.length) return;
						
			// get template
			var template = itemscope.clone(), output = node.clone().empty();
		
			// check for the data format
			if (list instanceof O.Collection) {
				var data = list.toObject();
				for(var i in data) {
					var instance = template.clone();
					this._bindData(instance, data[i], i);
					output.append(instance);
				}
				
			} else if (list instanceof Array) {
				
				var data = list;
				for(var i=0, len = data.length; i < len; i++) {
					var instance = template.clone();
					this._bindData(instance, data[i]);
					output.append(instance);
				}
				
			}
						
			// insert into dom
			node.replaceWith(output);
		
		},
		
		clear: function() {
			
			this.node.replaceWith(this.template.clone());
			this.loaded = false;
		
		}
	
	});
	
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
				Log.warn('[WARN] Field "' + name +'" could not be fetched');
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
	

	var ViewController = O.Controller.extend({
			
		/**
		 * initializes the view controller and all its child 
		 * view controllers, forms, and elements
		 * @param {ViewController} parent
		 * @param {HTMLElement} parent
		 */
		initialize: function(parent, target) {
		
			// set vars
			var that = this, views = [], forms = [], elements = [];
		
			// set load statuses
			this.loading = false;
			this.unloading = false;
			this.loaded = false;
			
			// setup display statuses
			this.visible = false;
			this.appearing = false;
			this.disappearing = false;
			
			// setup state statuses
			this.changing = false;
			
			// create arrays
			this.loadEvts = [];
			this.unloadEvts = [];
			this.showEvts = [];
			this.hideEvts = [];
			
			// setup instance vars
			this.views = {};
			this.forms = {};
			this.elements = {};
			this.events = [];
			this.data = {};
			this.source = target.clone();
						
			// setup event target
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
			
			// DEBUG
			console.log(this.data.name + ' ' + "Initialized");
			
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
				
				var c = ViewController.get(type);
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
				if (typeof name !== 'undefined' && name.length > 0) this.elements[name] = el.removeAttr('data-name').addClass(name);
			}
			
			// process types
			this.target.addClass(this.getClasses());
			this.target.removeAttr('data-control').removeAttr('data-name');
			
			// store for debugging
			this.type = this.getType();
			this.name = this.data.name;
		
		},
		
		/**
		 * the unique type string for the controller. this matches the
		 * data-control value used in view markup
		 */
		getType: function() {
			return 'ui-view';
		},
		
		/**
		 * returns the outputted class names for the view. by default
		 * the getType() of the view controller as well as all its parent
		 * view controllers, as well as its data-name attribute will be added
		 */
		getClasses: function() {
			var classes = typeof this.typeList !== 'undefined' ? this.typeList : '';
			return classes + ' ' + this.data.name ? this.data.name : '';
		},
	
		/**
		 * returns an array of strings of the events this function
		 * triggers. this is for informational / syntax readability purposes only
		 */
		getTriggers: function() {
			return [];
		},
		
		/**
		 * returns dynamic bindings of events on child views in the form
		 * { 'view-name' : { 'event' : 'callback' }
		 * the callback can be replaced with true to default to looking for a
		 * method in the format on{Event}. All callbacks are bound in the context
		 * of the view controller.
		 */
		getBindings: function() {
			return {};
		},
		
		
		load: function() {
		
			// return if already loading
			if (this.loading || this.loaded) return;
			
			// set statuses
			this.loading = true;
			
			// bind event handlers
			this.loadEvts.push(this.on('_load', this.onLoad, this));
			this.loadEvts.push(this.on('_loaded', this.onDidLoad, this));
			
			// call onWillLoad
			this.onWillLoad();
		
		},
		
		onWillLoad: function() {
			
			// ex. fetch data
			
			// DEBUG
			console.log(this.data.name + ' ' + "Will Load");
			
			// fire load event
			this.fire('_load');
			
		},
		
		onLoad: function() {
		
			// run functions
			
			// load children
			for (var name in this.views) {
				this.views[name].load();
			}
			
			// DEBUG
			console.log(this.data.name + ' ' + "Load");
		
			// fire loaded event
			this.fire('_loaded');
		
		},
		
		onDidLoad: function() {
		
			// run functions
					
			// unbind all event handlers
			for (var i = 0, len = this.loadEvts.length; i < len; i++) {
				this.loadEvts[i].detach();
			}
			
			// DEBUG
			console.log(this.data.name + ' ' + "Did Load");
						
			// allow unloading
			this.loadEvts = [];
			this.loading = false;
			this.loaded = true;
						
			// fire public load event
			this.fire('load');
		
		},
		
		
		unload: function() {
		
			// return if already unloading
			if (this.unloading || !this.loaded) return;
			
			// hide first if visible
			if (this.visible && !this.disappearing) {
				this.vEvt = this.on('disappear', function(e) {
					this.unload();
					this.vEvt.detach();
				}, this);
				this.hide();
				return;
			}
			
			// bind event handlers
			this.unloadEvts.push(this.on('_unload', this.onUnload, this));
			this.unloadEvts.push(this.on('_unloaded', this.onDidUnload, this));
			
			// set statuses
			this.unloading = true;
			
			// call onWillUnload
			this.onWillUnload();
		
		},
		
		onWillUnload: function() {
			
			// run functions
			console.log(this.data.name + ' ' + "Will Unload");
			
			// ex. clear data
			
			// fire unload event
			this.fire('_unload');
			
		},
		
		onUnload: function() {
			
			// unload children
			for (var name in this.views) {
				this.views[name].unload();
			}
		
			// run functions
			console.log(this.data.name + ' ' + "Unload");
			this.target.remove();
		
			// fire unloaded event
			this.fire('_unloaded');
		
		},
		
		onDidUnload: function() {
		
			// run functions
			console.log(this.data.name + ' ' + "Did Unload");
						
			// unbind all event handlers
			for (var i = 0, len = this.unloadEvts.length; i < len; i++) {
				this.unloadEvts[i].detach();
			}
			
			// allow loading
			this.unloadEvts = [];
			this.unloading = false;
			this.loaded = false;
			
			// fire public unload event
			this.fire('unload');
		
		},
		
		
		show: function() {
		
			// return if already visible or appearing
			if (this.visible || this.appearing) return;
			
			// set statuses
			this.appearing = true;
			
			// bind event handlers
			this.showEvts.push(this.on('_appear', this.onAppear, this));
			this.showEvts.push(this.on('_appeared', this.onDidAppear, this));
			
			// call onWillAppear
			this.onWillAppear();
		
		},
		
		onWillAppear: function() {
			
			// run functions
			console.log(this.data.name + ' ' + "Will Appear");
			
			// bind events
			var views = this.getBindings();
												
			for (var view in views) {
				var events = views[view];
				for (var event in events) {
					var func = (typeof events[event] === 'function') ? events[event] : null;
					if (event == 'touchclick') event = O.Browser.isTouch ? 'touchend' : 'click';
					if (func === null) {
						var name = event.charAt(0).toUpperCase() + event.slice(1);
						func = (events[event] === true && typeof this['on' + name] === 'function') ? this['on' + name] : null;
					}
					if (func !== null && this.views.hasOwnProperty(view)) {	
							this.getView(view).on(event, $.proxy(func,  this));
					}
					else if (func !== null && this.elements.hasOwnProperty(view)) {
						this.getElement(view).on(event, $.proxy(func, this));
					}
				}
			}
			
			// fire appear event
			this.fire('_appear');
			
		},
		
		onAppear: function() {
				
			// show children
			for (var name in this.views) {
				this.views[name].show();
			}
			
			// run functions
			console.log(this.data.name + ' ' + "Appear");
			
			// fire appeared event
			this.fire('_appeared');
		
		},
		
		onDidAppear: function() {
		
			// run functions
			console.log(this.data.name + ' ' + "Did Appear");
		
			// unbind all event handlers
			for (var i = 0, len = this.showEvts.length; i < len; i++) {
				this.showEvts[i].detach();
			}
			
			// allow hiding
			this.showEvts = [];
			this.appearing = false;
			this.visible = true;
			
			// fire public appear event
			this.fire('appear');
		
		},
		
			
		hide: function() {
	
			// return if already hidden or hiding
			if (!this.visible || this.disappearing) return;

			// set statuses
			this.disappearing = true;
			
			// bind event handlers
			this.hideEvts.push(this.on('_disappear', this.onDisappear, this));
			this.hideEvts.push(this.on('_disappeared', this.onDidDisappear, this));
			
			// call onWillDisappear
			this.onWillDisappear();
		
		},
		
		onWillDisappear: function() {
			
			// run functions
			console.log(this.data.name + ' ' + "Will Disappear");
			
			// unbind events
			for (var view in this.views) { this.getView(view).detach(); }
			for (var form in this.forms) { this.getForm(form).detach(); }
			for (var el in this.elements) { this.getElement(el).unbind(); }
			
			// fire disappear event
			this.fire('_disappear');
			
		},
		
		onDisappear: function() {
				
			// show children
			for (var name in this.views) {
				this.views[name].hide();
			}
			
			// run functions
			console.log(this.data.name + ' ' + "Disappear");
		
			// fire disappeared event
			this.fire('_disappeared');
		
		},
		
		onDidDisappear: function() {
		
			// run functions
			console.log(this.data.name + ' ' + "Did Disappear");
		
			// unbind all event handlers
			for (var i = 0, len = this.hideEvts.length; i < len; i++) {
				this.hideEvts[i].detach();
			}
			
			// allow showing
			this.hideEvts = [];
			this.disappearing = false;
			this.visible = false;
			
			// fire public disappear event
			this.fire('disappear');
		
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
			return typeof this.views[name] !== 'undefined';
		},				
		
		hasForm: function(name) {
			return typeof this.forms[name] !== 'undefined';
		},
		
		hasElement: function(name) {
			return typeof this.elements[name] !== 'undefined';
		},
		
		
		setView: function(name, view) {
			console.log(this);
			if (this.views.hasOwnProperty(name)) throw "View already exists";
			this.views[name] = view;
		},
		
		clearView: function(name) {
			if (this.views.hasOwnProperty(name)) {
				this.views[name].destroy();
				delete this.views[name];
			}
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
		
		bindList: function(model) {
		
			this.dataBinding = new O.Binding(this.target);
			this.dataBinding.clear();
			this.dataBinding.bindList(model);
		
		},
		
		toString: function() {
			return '[' + this.getType() + ' ' + this.data.name + ']';
		},
		
		find: function(selector) {
			return $(this.target).find(selector);
		},
				
		destroy: function() {
		
			// destroy views
			for (var name in this._views) { this.views[name].destroy(); }
			for (var name in this._forms) { this.forms[name].destroy(); }
			for (var name in this._elements) { delete this.elements[name]; }
			
			// clear references
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
	
	ViewController.get = function(name) {
		if (name == 'ui-view') return this;
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
	
	O.UIApplication = Application;
	O.Binding = Binding;
	O.Form		= Form;
	
	O.MultiViewController			= MultiViewController;
	O.ViewController					= ViewController;
	
}, ['mvc'], '1.0.2');