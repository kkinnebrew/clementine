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
		
		var events = new Events(null, Log);
		
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
		
		Log.info = function(msg, ex) { Log.fire('info', { message: msg, data: ex }); };
		Log.debug = function(msg, ex) { Log.fire('debug', { message: msg, data: ex }); };
		Log.warn = function(msg, ex) { Log.fire('warn', { message: msg, data: ex }); };
		Log.error = function(msg, ex) { Log.fire('error', { message: msg, data: ex }); };
		
		Log.on('info', function(msg, ex) { printLog('[INFO]', msg, ex); });
		Log.on('debug', function(msg, ex) { printLog('[DEBUG]', msg, ex); });
		Log.on('warn', function(msg, ex) { printLog('[WARN]', msg, ex); });
		Log.on('error', function(msg, ex) { printLog('[ERROR]', msg, ex); });
		
		function Log() {}
		
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
					
					if (typeof request.success === 'function') success = request.success;
					if (typeof request.error === 'function') error = request.error;
					if (request.hasOwnProperty('data')) data = request.data;
					var method = request.hasOwnProperty('type') ? request.type : 'GET';
					var url = request.hasOwnProperty('type') ? request.url : null;
										
					req.open(method, url, true);
					req.setRequestHeader('Cache-Control', 'no-cache');
					req.timeout = 3000;
					req.ontimeout = function () { error(req); }
					
					req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
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
	
	})();
	
	
	Storage = (function() {
	
	})();
	
	
	Socket = (function() {
	
	})();
	
	
	Location = (function() {
	
	})();
	
	
	Browser = (function() {
	
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
	Orange.Location 		= Location;
  Orange.Log 					= this.Log = Log;  
  Orange.Socket 			= Socket;
  Orange.Storage 			= Storage;	

}).call(this);