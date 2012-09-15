// ------------------------------------------------------------------------------------------------
// Cache Class
// ------------------------------------------------------------------------------------------------

/** 
 * @module HTML5
 */
(function(Orange) {

  var Cache;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Deferred = Orange.Deferred;
  var Events   = Orange.Events;
  var Promise  = Orange.Promise;
  
  
  // ------------------------------------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Fired when a change in the network connection to online occurs.
   * @event online
   */
  var EVENT_ONLINE = 'online';
  
  /**
   * Fired when a change in the network connection to offline occurs.
   * @event offline
   */
  var EVENT_OFFLINE = 'offline';
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------

  Cache = Class.extend({
    
    /**
     * The Cache class wraps HTML5's offlineMode functionality to notify the application
     * when a change in network connectivity has occurred.
     *
     * @class Cache
     * @requires Deferred
     * @requires Promise
     * @uses Events
     * @constructor
     */  
    initialize: function() {
      
      /**
       * Stores whether or not to poll the server.
       * @property _poll
       * @type {bool}
       * @default false
       * @private
       */
      this._poll = false;
      
      /**
       * Whether or not the connection is online.
       * @property _isOnline
       * @type {bool}
       * @default false
       * @private
       */
      this._isOnline = false;
      
      /**
       * Whether or not the cache has loaded.
       * @property _isLoaded
       * @type {bool}
       * @default false
       * @private
       */
      this._isLoaded = false;
      
      /**
       * The currently running ping process.
       * @property _process
       * @type {bool}
       * @private
       */
      this._process;
      
    },
    
    /**
     * Pings the network connection to check if it is active or inactive.
     * 
     * @method ping
     * @return {Promise}  A promise that resolves when online and rejects when offline.
     */
    ping: function() {
    
    },
    
    /**
     * Checks if the current connection is online.
     *
     * @method isOnline
     * @return {bool}  A boolean representing the connection status.
     */
    isOnline: function() {
    
    },
    
    /**
     * Checks if checking the network status is supported.
     *
     * @method isSupported
     * @return {bool}  A boolean representing the browser's support.
     */
    isSupported: function() {
    
    }
  
  }).include(Events);
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Cache = Cache;
    
  
}(Orange));