// ------------------------------------------------------------------------------------------------
// Service Class
// ------------------------------------------------------------------------------------------------

/**
 * @module Data
 */
(function(Orange) {

  var Service;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Collection       = Orange.Collection;
  var Events           = Orange.Events;
  var Model            = Orange.Model;
  var Module           = Orange.Module;
  
  
  // ------------------------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Validates a configuration object to be sure all fields are valid and allowed.
   *
   * @method validateConf
   * @private
   * @param {object} config  The configuration object to validate.
   * @return {bool}  A boolean whether the configuration object is valid.
   */
  function validateConf(config) {
  
  }
  
  /**
   * Validates a mapping object to be sure all fields are valid and allowed.
   *
   * @method validateMap
   * @private
   * @param {object} map  The map object to validate.
   * @return {bool}  A boolean whether the map object is valid.
   */
  function validateMap(config) {
  
  }
  
  /**
   * Maps an inbound array from a service into a collection object.
   *
   * @method arrayToCollection
   * @private
   * @param {object} map  The map object to validate.
   * @param {array} data  The array to map into a collection.
   * @return {Collection}  A collection representing the data.
   */
  function arrayToCollection(map, data) {
  
  }
  
  /**
   * Maps an inbound array from a service into a collection object.
   *
   * @method objectToCollection
   * @private
   * @param {object} map  The map object to validate.
   * @param {object} data  The object to map into a collection.
   * @return {Collection}  A collection representing the data.
   */
  function objectToCollection(map, data) {
  
  }
  
  /**
   * Maps an inbound array from a service into a collection object.
   *
   * @method objectToModel
   * @private
   * @param {object} map  The map object to validate.
   * @param {object} data  The data to map into a model.
   * @return {Model}  A model representing the data.
   */
  function objectToModel(map, data) {
  
  }
  
  /**
   * Reads the cache for a cached request.
   *
   * @method readCache
   * @private
   * @param {string} path  The path string to read.
   * @param {string} method  The request method.
   * @param {object} params  The parameters passed to the request.
   * @return {*}  The data that was cached, or undefined if unsuccessful
   */
  function readCache(path, method, params) {
  
  }
  
  /**
   * Writes data to the cache for a request.
   *
   * @method writeCache
   * @private
   * @param {string} path  The path string to cache.
   * @param {string} method  The request method.
   * @param {object} params  The parameters passed to the request.
   * @param {object|Model|Collection} data  The data to write to the cache
   */
  function writeCache(path, method, params, data) {
  
  }
  
  /**
   * Clears the cache by manually expiring objects.
   *
   * @method clearCache
   * @private
   * @param {string} path  The path string to cache.
   * @param {string} method  The request method.
   * @param {object} [params]  The parameters passed to the request, or for any parameter if empty.
   */
  function clearCache(path, method, params) {
  
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------

  Service = Module.extend({
    
    /**
     * The Service class handles all connections to external web services. A collection of endpoints
     * for a specific url path can be organized into method calls here, and their responses
     * sanitized and mapped into standard model/collection formats.
     *
     * @class Service
     * @constructor
     * @param {object} config  The config object for the service.
     */
    initialize: function(config) {
      
      /**
       * Stores the base url to request from. This is passed from the app.json.
       * @property _baseUrl
       * @type {string}
       * @private
       */
      this._baseUrl = '';
      
      /**
       * Stores a reference to the auth service.
       * @property _authService
       * @type {Service}
       * @private
       */
      this._authService = null;
      
      /**
       * Whether the service is currently online or offline.
       * @property _isOnline
       * @type {bool}
       * @private
       */
      this._isOnline = false;
      
    },
    
    /**
     * Should return the path fragment to be used for all endpoints of the service.
     *
     * @method getPath
     * @return {string}  The path to add to the baseUrl.
     */
    getPath: function() {
      return '';
    },
    
    /**
     * This handles all requests to the service. A configuration mapping object is passed
     * that stores the information needed to map the response to a readable format.
     *
     * @method request
     * @param {path} path  The path to add to the baseUrl to reach.
     * @param {method} method  The HTTP method to use.
     * @param {params} params  The parameters to pass via the request.
     * @param {object} config  The config object for the endpoint.
     * @return {Promise}  A promise that resolves when the request completes.
     */
    request: function(path, method, params, config) {
    
    },
    
    /**
     * A helper function that takes either a model or its id and returns
     * the id.
     *
     * @method modelOrId
     * @param {object} obj  Either the model or the id.
     * @return {string|int}  The id of the model.
     */
    modelOrId: function(obj) {
    
    },
    
    /**
     * Marks the service as online. Requests will be pushed directly to the server, skipping
     * the cache.
     *
     * @method goOnline
     */
    goOnline: function() {
    
    },
    
    /**
     * Marks the service as offline. Requests will be looked up in the cache and failed if
     * not results are cached.
     *
     * @method goOnline
     */
    goOffline: function() {
    
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
     * Destroys the service and clears all references and in memory objects.
     *
     * @method destroy
     */
    destroy: function() {
    
    }
  
  }, ['getPath']);
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Finds a service by its type string.
   * @method find
   * @static
   * @param {string} type  The type string to lookup on.
   * @return {Service}  The class object for the service.
   */
   
  /**
   * Extends an existing service class.
   * @method extend
   * @static
   * @param {object} def  The definition object for the class.
   * @return {Service}  The class object for the new service.
   */
   
  /**
   * Includes a mixin in an existing service class.
   * @method includes
   * @static
   * @param {object} def  The mixin object to apply.
   * @return {Service}  The updated class object for the service.
   */
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Service = Service;
    
  
}(Orange));

