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
  
    var initializing;
    var superRegex;
    
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
      
      var _super;
      
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
    
    }
    
    /**
     * Stops the event from bubbling to the currentTarget's parent.
     *
     * @method stopPropagation
     */
    EventTarget.prototype.stopPropagation = function() {
    
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
      
    }
    
    /**
     * Detaches the original event referenced by the EventHandle. This is a one
     * time use class and should be removed following detachment.
     *
     * @method detach
     */
    EventHandle.prototype.detach = function() {
      
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
      
      var fn;
      
      /**
       * An object containing references to each listener.
       * @property _listeners
       * @type {object}
       * @default {}
       * @private
       */
      this._listeners = {};
      
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
    
      var fn;
      var wrap;
      
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
    
      var parent;
      var type;
      var listeners;
      
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
        
      var listeners;
      
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
     * @returns {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.resolve = function() {

    };
    
    /**
     * Rejects the deferred object and executes all of it's fail callbacks.
     *
     * @method reject
     * @chainable
     * @param {*} [args]*  Arguments to pass to the resolve callbacks.
     * @returns {Deferred} A chainable reference to the deferred.
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
     * @returns {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.notify = function() {
    
    };
    
    /**
     * Returns a promise for the deferred object.
     *
     * @method promise
     * @chainable
     * @returns {Promise} The promise object representing the deferred.
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
     * @returns {Deferred} A chainable reference to the deferred.
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
     * @returns {Deferred} A chainable reference to the deferred.
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
     * @returns {Deferred} A chainable reference to the deferred.
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
     * @returns {Deferred} A chainable reference to the deferred.
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
     * @returns {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.always = function() {
    
    };
    
    /**
     * Checks if the deferred is currently resolved.
     *
     * @method isResolved
     * @returns {boolean}
     */
    Deferred.prototype.isResolved = function() {
    
    };
    
    /**
     * Checks if the deferred is currently rejected.
     *
     * @method isRejected
     * @returns {boolean}
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
     * @returns {Promise}  A chainable promise object.
     */
    Promise.prototype.progress = Deferred.prototype.progress;
        
    /**
     * Accepts a callback to bind to the promise's resolve notification.
     *
     * @method done
     * @chainable
     * @param {function} done*  One or more callbacks to bind to resolve.
     * @param {*} [context]  An optional context to bind to the callbacks.     
     * @returns {Promise} =  A chainable promise object.
     */
    Promise.prototype.done = Deferred.prototype.done;
        
    /**
     * Accepts a callback to bind to the promise's reject notification.
     *
     * @method fail
     * @chainable
     * @param {function} fail*  One or more callbacks to bind to reject.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @returns {Promise}  A chainable promise object.
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
     * @returns {Promise}  A chainable promise object.
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
     * @returns {Promise}  A chainable promise object.
     */
    Promise.prototype.always = Deferred.prototype.always;
        
    /**
     * Checks if the promise is currently resolved.
     *
     * @method isResolved
     * @returns {boolean}  Whether the promise is resolved
     */
    Promise.prototype.isResolved = Deferred.prototype.isResolved;
        
    /**
     * Checks if the promise is currently rejected.
     *
     * @method isRejected
     * @returns {boolean}  Whether the promise is rejected.
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
        
      },
      
      /**
       * Loads a given module and its dependent modules by name.
       *
       * @method loadModule
       * @param {string} name  The name of the module to load.
       */
      loadModule: function(name) {
        
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

  }
  
  /**
   * Includes a module in another and returns the exports object of that module.
   *
   * @method include
   * @param {string} name  The name of the module to include.
   */
  function include(name) {

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
  

}).call(this);