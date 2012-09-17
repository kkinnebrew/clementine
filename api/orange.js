// -------------------------------------------------------------------------------------------------
// Global Functions
// -------------------------------------------------------------------------------------------------

function noop() {}

function proxy(fn, context) {
  var that = context;
  return function() {
    return fn.apply(that, arguments);
  };
}


// -------------------------------------------------------------------------------------------------
// jQuery Extensions
// -------------------------------------------------------------------------------------------------

jQuery.fn.outerHTML = function(s) {
  return s ? this.before(s).remove() : jQuery('<p>').append(this.eq(0).clone()).html();
};

jQuery.fn.firstChildren = function(selector) {
	var children = [];
	this.find(selector).each(function() {
	  var include = false, parent = $(this).parent();
	  while (parent.length !== 0 && !include) {
	    if ($(parent).not($(this)).length === 0) {
	      include = true; break;
	    } else if ($(parent).not('[data-control]').length === 0) {
	      include = false; break;
	    } parent = $(parent).parent();
	  }
	  if (include) {
	  	children.push($(this));
	  }
	});
	return children;
};


// -------------------------------------------------------------------------------------------------
// Object Extensions
// -------------------------------------------------------------------------------------------------

Object.prototype.clone = function() {
	var i, newObj = (o instanceof Array) ? [] : {};
	for (i in o) {
	  if (i === 'clone') {
	    continue;
	  }
	  if (o[i] && o[i] instanceof Date) {
	    newObj[i] = new Date(o[i]);
	  } else if (o[i] && typeof o[i] === "object") {
	    newObj[i] = clone(o[i]);
	  } else {
	    newObj[i] = o[i];
	  }
	}
	return newObj;
};


// -------------------------------------------------------------------------------------------------
// Array Extensions
// -------------------------------------------------------------------------------------------------

Array.prototype.clone = function() { return this.slice(0); };

Array.prototype.indexOf = [].indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) { return i; }
  }
  return -1;
};

Array.prototype.first = [].first || function() {
  return this.length ? this[0] : null;
};

Array.prototype.last = [].last || function() {
  return this.length ? this[this.length-1] : null;
};


// -------------------------------------------------------------------------------------------------
// Core Module
// -------------------------------------------------------------------------------------------------

/**
 * The OrangeUI Core Module contains all required base classes, objects
 * and function dependencies.
 *
 * @module Core
 */
(function() {

  var Browser;
  var Class;
  var Deferred;
  var Events;
  var EventTarget;
  var EventHandle;
  var Loader;
  var Log;
  var Orange = {};
  var Promise;
  
  var keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g;
  var modFilterRegex = /[^A-Za-z\-_]/g;
  
  
  // ----------------------------------------------------------------------------------------------
  // Class Object
  // ----------------------------------------------------------------------------------------------
  
  Class = (function() {
  
    var initializing = false;
    var fnTest = /\b_super\b/;
    
    /**
     * A generic class providing oop and inheritance
     * via javascript prototypes.
     *
     * @class Class
     * @constructor
     */
    function Class() {}
    
    
    /**
     * Extends an existing class with additional properties
     * and methods. The _super() method can be called to invoke
     * the parent prototype's method.
     *
     * @method extend
     * @static
     * @param {object} def  An object of functions and properties.
     * @return {Class}  The newly created class object.
     */
    Class.extend = function(def) {
      
      var prototype;
      var name;
      
      var _super = this.prototype;
      
      initializing = true;
      prototype = new this();
      initializing = false;
      
      for (name in def) {
        prototype[name] = typeof def[name] === "function" && typeof _super[name] === "function" && fnTest.test(def[name]) ? (function(name, fn) {
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            this._super = tmp;
            return ret;
          };
        }(name, def[name])) : def[name];
      }
      
      function c() {
        if (!initializing && this.initialize) {
          this.initialize.apply(this, arguments);
        }
      }
  
      c.prototype = prototype;
      c.prototype.constructor = c;
      
      c.extend = Class.extend;
      c.include = Class.include;
  
      return c;
      
    };
    
    /**
     * Includes a mixin containing functions and methods into the
     * class' prototype. This does not affect inheritance.
     *
     * @method includes
     * @static
     * @param {object} def  An object of functions and properties.
     * @return {Class}  The class object with the mixin included.
     */
    Class.includes = function(def) {
      
      var key;
      var value;
      
      if (!def) {
        throw 'Missing definition';
      }
      
      for (key in def) {
        value = def[key];
        if (Array.prototype.indexOf.call(['extend', 'includes'], key) < 0) {
          this.prototype[key] = value;
        }
      }
        
      return this;
      
    };
    
    return Class;
  
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // EventTarget Object
  // -------------------------------------------------------------------------------------------------
  
  EventTarget = (function() {
    
    /**
     * The e target object passed to all event callbacks.
     *
     * @class EventTarget
     * @constructor
     * @param {string} type  the name of the event.
     * @param {*} currentTarget  The current target set to each bubble level.
     * @param {*} target  The target that originally fired the event.
     * @param {*} data  The data payload passed along with the event.
     */
    function EventTarget(type, currentTarget, target, data) {
    	
    	this.bubbles         = true;
    	this.currentTarget   = currentTarget;
    	this.data            = data;
    	this.target          = target;
    	this.type            = type;
    	
    }
    
    /**
     * Stops the event from bubbling to the currentTarget's parent.
     *
     * @method stopPropagation
     */
    EventTarget.prototype.stopPropagation = function() {
    	this.bubbles = false;
    };
    
    return EventTarget;
    
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // EventHandle Object
  // -------------------------------------------------------------------------------------------------

  EventHandle = (function() {
  
    /**
     * The handle returned at every event binding (not including once)
     * that maintains a reference to detach the event in the future.
     *
     * @class EventHandle
     * @constructor
     * @param {string} type The name of the event.
     * @param {function} call  The function bound to the event.
     * @param {*} target  The target the event is bound to.
     */
    function EventHandle(type, call, target) {
      
      this.call      = call;
      this.ev        = ev;
      this.target    = target;
      
    }
    
    /**
     * Detaches the original event referenced by the EventHandle. This is a one
     * time use class and should be removed following detachment.
     *
     * @method detach
     */
    EventHandle.prototype.detach = function() {
      
      this.target.detach(this.ev, this.call);
      
      delete this.target;
      delete this.ev;
      delete this.call;
      
    };
    
    return EventHandle;
  
  }());

  
  // -------------------------------------------------------------------------------------------------
  // Events Mixin
  // -------------------------------------------------------------------------------------------------
  
  /**
   * A mixin for adding custom event functionality to an object. Events may be
   * bound, fired, and detached dynamically directly on objects.
   *
   * @class Events
   * @static
   * @requires EventTarget
   */
  Events = {
  
    /**
     * Binds a listener to an object's event with a given context.
     *
     * @method on
     * @requires EventHandle
     * @param {string} ev  The name of the event. An event prefixed with an underscore won't bubble.
     * @param {function} call  The listener to bind to the event.
     * @param {context} [context]  The optional context to bind to the function.
     * @return {EventHandle}  The EventHandle object referencing the bound event.
     */
    on: function(ev, call, context) {
      
      var fn = typeof context !== 'undefined' ? proxy(call, context) : call;
      
      /**
       * An object containing references to each listener.
       * @property _listeners
       * @type {object}
       * @default {}
       * @private
       */
      this._listeners = this._listeners || {};
      
      if (!this._listeners.hasOwnProperty(ev)) {
      	this._listeners[ev] = [];
      }
      
      this._listeners[ev].push(fn);
      
      return new EventHandle(this, ev, fn);
      
    },
    
    /**
     * Binds a listen to an object's event only once. After the event is
     * fired, the event is immediately detached.
     *
     * @method once
     * @param {string} ev  The name of the event. An event prefixed with an underscore won't bubble.
     * @param {function} call  The listener to bind to the event.
     * @param {context} [context]  The optional context to bind to the function.
     */
    once: function(ev, call, context) {
    
      var fn = typeof context !== 'undefined' ? proxy(call, context) : call;
      
      var wrap = function() {
        call.apply(this, arguments);
        this.detach(ev, fn);
      };
      
      this.on(ev, wrap);
      
    },
    
    /**
     * Triggers an event on an object and causes all listeners bound to
     * that object and parent object's event to execute.
     *
     * @method fire
     * @param {string} ev  The name of the event.
     * @param {*} [data]  The optional data payload to pass to all callbacks.
     */
    fire: function(ev, data) {
    
      var parent = this.parent || null;
      
      if (typeof ev === 'string') {
        ev = new EventTarget(ev, this, this, data);
      }
      
      if (typeof ev.type !== 'string') {
        throw "Error: Invalid 'type' when firing event";
      }
      
      this._listeners = this._listeners || {};
      
      if (this._listeners[ev.type] instanceof Array) {
        var listeners = this._listeners[ev.type];
        for (var i = 0, len = listeners.length; i < len; i++) {
          listeners[i].call(this, ev, data);
        }
      }
      
      if (parent != null && ev.bubbles && ev.type[0] !== '_') {
        ev.currentTarget = this.parent;
        parent.fire.call(parent, ev, data);
      }
      
    },
    
    /**
     * Detaches listeners from an object. Specifying the event and function
     * parameters will remove that specific listener, while specifying just the
     * event name will remove all listeners for that event. No parameters will
     * remove all bound listeners to the object.
     *
     * @method detach
     * @param {string} [ev]  The optional name of the event to unbind.
     * @param {function} [call]  The option listener to unbind.
     */
    detach: function(ev, fn) {
        
      var listeners = [];
      
      this._listeners = this._listeners || {};
      
      if (typeof ev === 'undefined') {
        this._listeners = {};
      } else if (this._listeners[ev] instanceof Array) {
        if (typeof fn !== 'undefined') {
          listeners = this._listeners[ev];
          for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] === fn) {
              listeners.splice(i, 1);
              break;
            }
          }
        } else {
          this._listeners[ev] = [];
        }
      }
      
    }
    
  };
  
  
  // -------------------------------------------------------------------------------------------------
  // Deferred Object
  // -------------------------------------------------------------------------------------------------
  
  Deferred = (function() {
    
    /**
     * Provides deferred objects to more easily handle asynchronous function calls.
     *
     * @class Deferred
     * @constructor
     */
    function Deferred() {
      
      /**
       * Stores the state of the deferred object.
       * @property _resolved
       * @type {boolean}
       * @default false
       * @private
       */
      this._resolved = false;
      
      /**
       * Stores callbacks to execute when resolved.
       * @property _whenDone
       * @type {array}
       * @default []
       * @private
       */
      this._whenDone = [];
      
      /**
       * Stores callbacks to execute when rejected.
       * @property _whenFail
       * @type {array}
       * @default []
       * @private
       */
      this._whenFail = [];
      
      /**
       * Stores callbacks to execute when notified.
       * @property _whenProgress
       * @type {array}
       * @default []
       * @private
       */
      this._whenProgress = [];
      
      /**
       * Stores callbacks to execute for resolved and rejected states.
       * @property _whenThen
       * @type {array}
       * @default []
       * @private
       */
      this._whenThen = [];
      
      /**
       * Stores callbacks to execute when finished.
       * @property _whenAlways
       * @type {array}
       * @default []
       * @private
       */
      this._whenAlways = [];
      
    }
    
    /**
     * Resolves the deferred object and executes all of it's done callbacks.
     *
     * @method resolve
     * @chainable
     * @param {*} [args]*  Arguments to pass to the resolve callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.resolve = function() {

    };
    
    /**
     * Rejects the deferred object and executes all of it's fail callbacks.
     *
     * @method reject
     * @chainable
     * @param {*} [args]*  Arguments to pass to the resolve callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.reject = function() {
    
    };
    
    /**
     * Notifies the deferred object of a progress update and executes all of
     * its progress callbacks.
     *
     * @method notify
     * @chainable
     * @param {*} [args]*  Arguments to pass to the resolve callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.notify = function() {
    
    };
    
    /**
     * Returns a promise for the deferred object.
     *
     * @method promise
     * @chainable
     * @return {Promise} The promise object representing the deferred.
     */
    Deferred.prototype.promise = function() {
    
    };
    
    /**
     * Accepts a callback to bind to the deferred's progress notification.
     *
     * @method progress
     * @chainable
     * @param {function} progress*  One or more callbacks to bind to progress.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.progress = function() {
    
    };
    
    /**
     * Accepts a callback to bind to the deferred's resolve notification.
     *
     * @method done
     * @chainable
     * @param {function} done*  One or more callbacks to bind to resolve.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.done = function() {
    
    };
    
    /**
     * Accepts a callback to bind to the deferred's reject notification.
     *
     * @method fail
     * @chainable
     * @param {function} fail*  One or more callbacks to bind to reject.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.fail = function() {
    
    };
    
    /**
     * Accepts a callback to bind to the deferred's resolve or reject notifications.
     *
     * @method then
     * @chainable
     * @param {function} done  A callback to execute on resolve.
     * @param {function} fail  A callback to execute on reject.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.then = function(done, fail, context) {
    
    };
    
    /**
     * Accepts a callback to bind to the either the deferred's resolve or reject
     * notifications.
     *
     * @method always
     * @chainable
     * @param {function} always*  One or more callbacks to bind to completion.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.always = function() {
    
    };
    
    /**
     * Checks if the deferred is currently resolved.
     *
     * @method isResolved
     * @return {boolean}
     */
    Deferred.prototype.isResolved = function() {
    
    };
    
    /**
     * Checks if the deferred is currently rejected.
     *
     * @method isRejected
     * @return {boolean}
     */
    Deferred.prototype.isRejected = function() {
    
    };
        
    return Deferred;
  
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // Promise Object
  // -------------------------------------------------------------------------------------------------

  Promise = (function() {
    
    /**
     * Provides promise objects to more easily handle asynchronous function calls.
     *
     * @class Promise
     * @constructor
     * @param {Deferred} deferred  A deferred object to listen for
     */
    function Promise(deferred) {
      
      /**
       * Stores the state of the promise object.
       * @property _resolved
       * @type {boolean}
       * @default false
       * @private
       */
      this._resolved = false;
      
      /**
       * Stores callbacks to execute when resolved.
       * @property _whenDone
       * @type {array}
       * @default []
       * @private
       */
      this._whenDone = [];
      
      /**
       * Stores callbacks to execute when rejected.
       * @property _whenFail
       * @type {array}
       * @default []
       * @private
       */
      this._whenFail = [];
      
      /**
       * Stores callbacks to execute when notified.
       * @property _whenProgress
       * @type {array}
       * @default []
       * @private
       */
      this._whenProgress = [];
      
      /**
       * Stores callbacks to execute for resolved and rejected states.
       * @property _whenThen
       * @type {array}
       * @default []
       * @private
       */
      this._whenThen = [];
      
      /**
       * Stores callbacks to execute when finished.
       * @property _whenAlways
       * @type {array}
       * @default []
       * @private
       */
      this._whenAlways = [];
      
    }
    
    /**
     * Accepts a callback to bind to the promise's progress notification.
     *
     * @method progress
     * @chainable
     * @param {function} progress*  One or more callbacks to bind to progress.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.progress = Deferred.prototype.progress;
        
    /**
     * Accepts a callback to bind to the promise's resolve notification.
     *
     * @method done
     * @chainable
     * @param {function} done*  One or more callbacks to bind to resolve.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise} =  A chainable promise object.
     */
    Promise.prototype.done = Deferred.prototype.done;
        
    /**
     * Accepts a callback to bind to the promise's reject notification.
     *
     * @method fail
     * @chainable
     * @param {function} fail*  One or more callbacks to bind to reject.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.fail = Deferred.prototype.fail;
        
    /**
     * Accepts a callback to bind to the promise's resolve or reject notifications.
     *
     * @method then
     * @chainable
     * @param {function} done  A callback to execute on resolve.
     * @param {function} fail  A callback to execute on reject.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.then = Deferred.prototype.then;
        
    /**
     * Accepts a callback to bind to the either the promise's resolve or reject
     * notifications.
     *
     * @method always
     * @chainable
     * @param {function} always*  One or more callbacks to bind to completion.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.always = Deferred.prototype.always;
        
    /**
     * Checks if the promise is currently resolved.
     *
     * @method isResolved
     * @return {boolean}  Whether the promise is resolved
     */
    Promise.prototype.isResolved = Deferred.prototype.isResolved;
        
    /**
     * Checks if the promise is currently rejected.
     *
     * @method isRejected
     * @return {boolean}  Whether the promise is rejected.
     */
    Promise.prototype.isRejected = Deferred.prototype.isRejected;
      
    return Promise;
  
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // Loader Object
  // -------------------------------------------------------------------------------------------------
  
  /**
   * Handles dependency loading for each module.
   *
   * @class Loader
   */
  Loader = (function() {
    
    /**
     * Stores references to each module and its exports object by name.
     * @property _modules
     * @type {object}
     * @default {}
     * @private
     */
    var _modules = {};
    
    /**
     * Stores a list of modules that have already been invoked.
     * @property _active
     * @type {array}
     * @default []
     * @private
     */
    var _active = [];

        
    return {
      
      /**
       * Add a given module and its configuration parameters.
       *
       * @method addModule
       * @param {string} name  The name of the module to add.
       * @param {function} fn  The function containing the module's code.
       * @param {array} [required]  An array of required module dependencies.
       */
      addModule: function(name, fn, required) {
        
        var mod;
        
        if (!name.match(/[\^\-A-Za-z_]/g)) { throw 'Invalid module name'; }
        
        mod = {
          name: name,
          fn: fn,
          required: required || []
        };
        
        _modules[name] = mod;
        
      },
      
      /**
       * Loads a given module and its dependent modules by name.
       *
       * @method loadModule
       * @param {string} name  The name of the module to load.
       */
      loadModule: function(name) {
        
        var exports = {};
        
        if (_active.hasOwnProperty(name)) {
          return;
        }
        
        if (_modules[name] !== undefined) {
        
          _active[name] = true;
          
          for (var i = 0, len = _modules[name].req.length; i < len; i++) {
            if (_modules[name].req[i] === name) { continue; }
            this.loadModule(_modules[name].req[i]);
          }
          
          _modules[name].fn.call(window, exports);
          Orange.modules[name] = exports;
          
        }
        
      }
      
    };
    
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // Log Object
  // -------------------------------------------------------------------------------------------------
  
 
  Log = Class.extend({
  
      
    /**
     * A wrapper around logging. Allows the application to intercept log
     * event messages and display them to the user.
     *
     * @class Log
     * @constructor
     * @uses Events
     */
    initialize: function(name) {
      
      /**
       * Stores the level of the logger.
       * @property _level
       * @type {string}
       * @default DEBUG
       * @private
       */
      this._level = 'DEBUG';
      
    },
    
    /**
     * A wrapper around logging. Allows the application to intercept log
     * event messages and display them to the user.
     *
     * @method setLevel
     * @param {string} level  The level to set the logger to.
     */
    setLevel: function(level) {
    
    },
    
    /**
     * Logs a debug message to the console.
     *
     * @method debug
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    debug: function(message, ex) {
    
    },
    
    /**
     * Logs a info message to the console.
     *
     * @method info
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    info: function(message, ex) {
    
    },
    
    /**
     * Logs a warn message to the console.
     *
     * @method warn
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    warn: function(message, ex) {
    
    },
    
    /**
     * Logs a error message to the console.
     *
     * @method error
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    error: function(message, ex) {
    
    }
  
  }).includes(Events);
  
  
  // -------------------------------------------------------------------------------------------------
  // Browser
  // -------------------------------------------------------------------------------------------------
  
  /**
   * The Browser object stores many commonly checked feature detection results.
   *
   * @class Browser
   * @static
   */
  Browser = {
    touch: ('ontouchstart' in window) || (window.hasOwnProperty('DocumentTouch') && document instanceof DocumentTouch),
    location: 'geolocation' in navigator
  };
  
  
  // -------------------------------------------------------------------------------------------------
  // Module Functions
  // -------------------------------------------------------------------------------------------------
  
  /**
   * Adds a new module and it's dependencies by name.
   *
   * @method add
   * @param {string} name  The name of the module.
   * @param {function} fn  The function containing the module's code.
   * @param {array} [required]  An array of required modules to load.
   */
  function add() {
		var args = arguments,
		  name = args[0],
		  fn = ( typeof args[1] === 'function' ) ? args[1] : null,
		  req = args[2];
		Orange.Loader.addModule(name, fn, req);
  }
  
  /**
   * Loads a set of modules by name and then executes an optional
   * function using those modules.
   *
   * @method use
   * @param {string} [modules]*  A set of modules to load.
   * @param {function} [fn] An optional function to call using those modules.
   */
  function use() {
		var args = Array.prototype.slice.call(arguments),
		  fn = args[args.length-1],
		  req = clone(args).splice(0, args.length-1);
		if (typeof req[0] !== 'function') {
		  for (var i = 0, len = req.length; i < len; i++) {
		    Orange.Loader.loadModule(req[i]);
		  }
		}
		fn.call(window, Orange);
  }
  
  /**
   * Includes a module in another and returns the exports object of that module.
   *
   * @method include
   * @param {string} name  The name of the module to include.
   */
  function include(name) {
		if (typeof Orange.modules[name] !== undefined) {
		  return Orange.modules[name];
		} else {
		  throw 'Could not require module';
		}
  }
  
  /**
   * Returns a new deferred object that resolves when two existing promises or
   * deferreds have resolved.
   *
   * @method when
   * @param {Deferred|Promise} deferred*  A set of deferreds to build the new object from.
   * @return {Deferred}  A Deferred object that resolves when the arguments resolve.
   */
  function when() {
  	
  	var deferred = new Deferred(this);
  	var count = arguments.length;
  	  
  	function resolve() {
  	  if (--count === 0) {
  	    deferred.resolve();
  	  }
  	}
  	
  	function reject() {
  		deferred.reject();
  	}
  	
  	for (var i=0; i<arguments.length; i++) {
  	  arguments[i].then(resolve, reject);
  	}
  	
  	return deferred;
  	
  }
  
  
  // -------------------------------------------------------------------------------------------------
  // Exports
  // -------------------------------------------------------------------------------------------------
  
  Orange              = this.Orange = { modules: {} };
  Orange.version      = '0.6.0';
  
  Orange.add          = this.add = add;
  Orange.use          = this.use = use;
  Orange.include      = this.include = include;
  Orange.when         = this.when = when;
  
  Orange.Class        = Class;
  Orange.Deferred     = Deferred;
  Orange.Events       = Events;
  Orange.EventHandle  = EventHandle;
  Orange.Loader       = Loader;
  Orange.Log          = new Log();
  Orange.Promise      = Promise;
  

}.call(this));

