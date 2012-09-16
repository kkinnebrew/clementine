// ------------------------------------------------------------------------------------------------
// Queue Mixin
// ------------------------------------------------------------------------------------------------

/**
 * @module Core
 */
(function(Orange) {

  var Queue;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Deferred = Orange.Deferred;
  var Promise = Orange.Promise;
  
  
  // ------------------------------------------------------------------------------------------------
  // Mixin Definition
  // ------------------------------------------------------------------------------------------------
  
  /**
   * The Queue makes it simple to easily create chainable methods that
   * can be executed synchronously.
   *
   * @class Queue
   * @static
   * @requires Deferred
   * @requires Promise
   */
  Queue = {
    
    /**
     * Adds a new function to the queue for execution.
     *
     * @method add
     * @chainable
     * @param {function} fn  The function to execute.
     * @param {array} args  Optional arguments array to pass the function.
     * @param {int} wait  A duration to wait after the callback finishes.
     * @return {*}  A reference to the class using the mixin.
     */
    add: function(fn, args, wait) {
    
      /**
       * An array containing each item in the queue.
       * @property _queue
       * @type {array}
       * @default []
       * @private
       */
      this._queue = [];
      
      /**
       * An boolean if the queue is executing.
       * @property _running
       * @type {bool}
       * @default false
       * @private
       */
      this._running = false;
      
      /**
       * A reference to the currently executing process.
       * @property _process
       * @type {bool}
       * @private
       */
      this._process = null;
    
    },
    
    /**
     * Clears the queue and returns after the currently executing process
     * has finished. Any waits will be immediately terminated.
     *
     * @method stop
     * @chainable
     * @return {*}  A reference to the class using the mixin.
     */
    stop: function() {
    
    },
    
    /**
     * Calls the next process waiting in the queue. This should be called at
     * the end of every queued function to tell the queue to continue. Missing
     * the **next()** call will pause the queue.
     *
     * @method next
     * @chainable
     * @return {*}  A reference to the class using the mixin.
     */
    next: function() {
    
    },
    
    /**
     * Creates a new **Deferred** object and appends it to the queue. When that item
     * in the queue is reached, the deferred will resolve.
     *
     * @method defer
     * @return {Deferred}  A Deferred object to bind to.
     */
    defer: function() {
    
    },
    
    /**
     * Creates a new **Promise** object and appends it to the queue. When that item
     * in the queue is reached, the promise will resolve.
     *
     * @method promise
     * @return {Promise}  A Promise object to bind to.
     */
    promise: function() {
    
    }
  
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Queue = Queue;
    
  
}(Orange));

