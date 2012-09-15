// ------------------------------------------------------------------------------------------------
// Global Functions
// ------------------------------------------------------------------------------------------------

function noop() {}

function proxy(fn, context) {
  var that = context;
  return function() {
    return fn.apply(that, arguments);
  };
}


// ------------------------------------------------------------------------------------------------
// jQuery Extensions
// ------------------------------------------------------------------------------------------------

jQuery.fn.outerHTML = function(s) {
  return s ? this.before(s).remove() : jQuery('<p>').append(this.eq(0).clone()).html();
};


// ------------------------------------------------------------------------------------------------
// Array Extensions
// ------------------------------------------------------------------------------------------------

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


// ------------------------------------------------------------------------------------------------
// Core Module
// ------------------------------------------------------------------------------------------------

/**
 * The OrangeUI Core Module containing all required base classes, objects
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
     * @param {object} def An object of functions and properties.
     * @return {Class}
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
     * @method include
     * @static
     * @param {object} def An object of functions and properties.
     * @return {Class}
     */
    Class.include = function(def) {
      
      var key;
      var value;
      
    };
    
    return Class;
  
  }());
  
  
  // ------------------------------------------------------------------------------------------------
  // EventTarget Object
  // ------------------------------------------------------------------------------------------------
  
  EventTarget = (function() {
    
    /**
     * The e target object passed to all event callbacks.
     *
     * @class EventTarget
     * @constructor
     * @param {string} type  the name of the event.
     * @param {*} currentTarget  the current target set to each bubble level.
     * @param {*} target  the target that originally fired the event.
     * @param {*} data  the data payload passed along with the event.
     */
    function EventTarget(type, currentTarget, target, data) {
    
    }
    
    /**
     * Stops the event from bubbling to the currentTarget's parent.
     *
     * @method stopPropagation
     * @return {void}
     */
    EventTarget.prototype.stopPropagation = function() {
    
    };
    
    return EventTarget;
    
  }());
  
  
  // ------------------------------------------------------------------------------------------------
  // EventHandle Object
  // ------------------------------------------------------------------------------------------------

  EventHandle = (function() {
  
    /**
     * The handle returned at every event binding (not including once)
     * that maintains a reference to detach the event in the future.
     *
     * @class EventHandle
     * @constructor
     * @param {string} type  the name of the event.
     * @param {function} call  the function bound to the event.
     * @param {*} target  the target the event is bound to.
     */
    function EventHandle(type, call, target) {
      
    }
    
    /**
     * Detaches the original event referenced by the EventHandle. This is a one
     * time use class and should be removed following detachment.
     *
     * @method detach
     * @return {void}
     */
    EventHandle.prototype.detach = function() {
      
    };
    
    return EventHandle;
  
  }());

  
  // ------------------------------------------------------------------------------------------------
  // Events Mixin
  // ------------------------------------------------------------------------------------------------
  
  /**
   * A mixin for adding custom event functionality to an object. Events may be
   * bound, fired, and detached dynamically directly on objects.
   *
   * @class Events
   * @requires EventTarget
   */
  Events = {
  
    /**
     * Binds a listener to an object's event with a given context.
     *
     * @method on
     * @requires EventHandle
     * @static
     * @param {string} ev  the name of the event.
     * @param {function} call  the listener to bind to the event.
     * @param {context} [context]  the optional context to bind to the function.
     * @return {EventHandle}
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
     * @static
     * @param {string} ev  the name of the event.
     * @param {function} call  the listener to bind to the event.
     * @param {context} [context]  the optional context to bind to the function.
     * @return {void}
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
     * @static
     * @param {string} ev  the name of the event.
     * @param {*} [data]  the optional data payload to pass to all callbacks.
     * @return {void}
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
     * @static
     * @param {string} [ev]  the optional name of the event to unbind.
     * @param {function} [call]  the option listener to unbind.
     * @return {void}
     */
    detach: function(ev, fn) {
        
      var listeners;
      
    }
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Deferred Object
  // ------------------------------------------------------------------------------------------------
  
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
     * @returns {Deferred}
     */
    Deferred.prototype.resolve = function() {

    };
    
    /**
     * Rejects the deferred object and executes all of it's fail callbacks.
     *
     * @method reject
     * @chainable
     * @param {*} [args]*  Arguments to pass to the resolve callbacks.
     * @returns {Deferred}
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
     * @returns {Deferred}
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
     * @returns {Deferred}
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
     * @returns {Deferred}
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
     * @returns {Deferred}
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
     * @returns {Deferred}
     */
    Deferred.prototype.then = function(done, fail, context) {
    
    };
    
    /**
     * Accepts a callback to bind to the either deferred's resolve or reject
     * notifications.
     *
     * @method always
     * @chainable
     * @param {function} always*  One or more callbacks to bind to completion.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @returns {Deferred}
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
  
  
  // ------------------------------------------------------------------------------------------------
  // Promise Object
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Provides promise objects to more easily handle asynchronous function calls.
   *
   * @class Promise
   */
  Promise = (function() {
  
    function Promise() {

    }
    
    Promise.prototype.resolve = function() {

    };
    
    Promise.prototype.then = function(fn, args) {

    };
  
    return Deferred;
  
  }());

}).call(this);