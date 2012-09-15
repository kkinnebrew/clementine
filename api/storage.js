// ------------------------------------------------------------------------------------------------
// Storage Object
// ------------------------------------------------------------------------------------------------

/** 
 * @module HTML5
 */
(function(Orange) {

  var Storage;
  
  
  // ------------------------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Stores a reference to the local storage database.
   * @property _db
   * @private
   * @type {localStorage}
   */
  var _db;
  
  /**
   * Whether or not the storage manager is online.
   * @property _isOnline
   * @private
   * @default false
   * @type {bool}
   */
  var _isOnline = false;
    
  
  // ------------------------------------------------------------------------------------------------
  // Object Definition
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Wraps HTML5's localStorage feature for easy retrieval of key value pairs from cache. Each
   * pair is expirable as is the entire local storage cache.
   *
   * @class Storage
   */
  Storage = {
    
    /**
     * Returns the value for a key from localStorage.
     *
     * @method get
     * @param {string} key  
     * @param {*} [alt]  An alternate to return if the key is not found.
     * @return
     */
    get: function(key, alt) {

    },
    
    /**
     * Sets an object value to localStorage for a given key.
     *
     * @method set
     * @param {string} key  A key store the local storage object to
     * @param {*} value  The value to store for the given key
     * @param {int} [ttl]  An duration in milliseconds for when the object should expire.
     * @return
     */
    set: function(key, value, ttl) {
    
    },

    /**
     * Removes an object from localStorage for a given key.
     *
     * @method remove
     * @param {string} key  A key to remove from localStorage
     * @return
     */
    remove: function(key) {
    
    },
    
    /**
     * Flushes all object from the localStorage object. Objects will not be flushed when 
     * offline unless force is set to true.
     *
     * @method flushExpired
     * @param {bool} force  Whether to force flush when offline.
     */
    flushExpired: function(force) {
    
    },
    
    /**
     * Flushes all expired objects from the localStorage object. Objects will not be flushed 
     * when offline unless force is set to true.
     *
     * @method flush
     * @param {bool} force  Whether to force flush when offline.
     */
    flush: function(force) {
    
    },
    
    /**
     * Forces the storage manager online. Data will now be expired or flushed.
     *
     * @method goOnline
     */
    goOnline: function() {
    
    },
    
    /**
     * Forces the storage manager offline. Data will not be expired or flushed when
     * offline unless forced.
     *
     * @method goOffline
     */
    goOffline: function() {
    
    },
    
    /**
     * Checks if the storage manager is online.
     *
     * @method isOnline
     * @return {bool}  A boolean representing the manager's connection status.
     */
    isOnline: function() {
    
    },
    
    /**
     * Returns a boolean value checking if the localStorage cache is supported.
     *
     * @method isSupported
     * @return {bool}  A boolean representing the browser's support.
     */
    isSupported: function() {
    
    }
  
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Storage = Storage;
    
  
}(Orange));