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
			__export = function(name, object) { return Orange[name] = object }
			__keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g;


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
	
	})();
	
	
	Events = (function() {
	
	})();

	
	Log = (function() {
	
	})();
	
	
	Loader = (function() {
	
	})();
	
	
	Ajax = (function() {
	
	})();
	
	
	Element = (function() {
	
	})();
	
	
	Cache = (function() {
	
	})();
	
	
	Storage = (function() {
	
	})();
	
	
	Socket = (function() {
	
	}();
	
	
	Location = (function() {
	
	})();
	
	
	Browser = (function() {
	
	})();
	
	
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
	Orange.Loader 			= Loader;
	Orange.Location 		= Location;
  Orange.Log 					= this.Log = Log;  
  Orange.Socket 			= Socket;
  Orange.Storage 			= Storage;	

}).call(this);