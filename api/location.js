// ------------------------------------------------------------------------------------------------
// Location Object
// ------------------------------------------------------------------------------------------------

/**
 * @module HTML5
 */
(function(Orange) {

  var Location;
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Definition
  // ------------------------------------------------------------------------------------------------
  
  var Deferred = Orange.Deferred;
  var Promise = Orange.Promise;
  
  
  // ------------------------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------------------------
  
  /**
   * The cache coordinates return from the navigator.
   * @property _location
   * @private
   * @type {Coordinates}
   */
  var _location;
  
  /**
   * The timestamp of the last successful geolocation request.
   * @property _timestamp
   * @private
   * @type {int}
   */
  var _timestamp;
  
  /**
   * The default time-to-live for the geolocation cache.
   * @property _ttl
   * @private
   * @type {int}
   */
  var _ttl;
  
  
  /**
   * Checks if the current location is expired.
   *
   * @method isExpired
   * @private
   * @return {bool}  Whether the coordinates are expired.
   */
  function isExpired() {
  
  }
  
  /**
   * Called when the geolocation request is successful.
   *
   * @method onSuccess
   * @private
   * @param {Coordinates} coords  The coordinates object returned.
   */
  function onSuccess() {
  
  }
  
  /**
   * Called when the geolocation request fails.
   *
   * @method onFailure
   * @private
   * @param {Exception} ex  The exception object returned.
   */
  function onFailure() {
  
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Definition
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Wraps HTML5's navigator.geolocation object for easy retrieval and caching of
   * current coordinates.
   *
   * @class Location
   * @requires Deferred
   */
  Location = {
    
    /**
     * Returns a promise object that resolves with the location coordinates of
     * the browser.
     *
     * @method find
     * @static
     * @return {Promise}  A promise that resolves when the location has returned.
     */
    find: function() {
    
    },
    
    /**
     * Checks if checking the browser's location is supported.
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
  
  Orange.Location = Location;
    
  
}(Orange));

