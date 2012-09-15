// ------------------------------------------------------------------------------------------------
// Model Class
// ------------------------------------------------------------------------------------------------

/** 
 * @module Data
 */
(function(Orange) {

  var Model;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Collection       = Orange.Collection;
  var Events           = Orange.Events;
  var Module           = Orange.Module;
  
  
  // ------------------------------------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Fired when a change in model data occurs.
   * @event change
   * @param {string} field  The field that changed.
   */
  var EVENT_CHANGE = 'change';
  
  /**
   * Fired when a change in a model id occurs.
   * @event sync
   * @param {string|number} old  The old id to replace.
   * @param {string|number} new  The new id to update.
   */
  var EVENT_SYNC = 'sync';
  
  /**
   * Fired when a change in a model is request.
   * @event sync
   * @param {string} model  The type of the model to refresh.
   * @param {string|number} id  The id to update from the service.
   */
  var EVENT_SYNC = 'refresh';

  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------

  Model = Module.extend({
    
    /**
     * @class Model
     * @extends Module
     * @constructor
     * @param {object} data  The source data for the model.
     */  
    initialize: function(data) {
      
      /**
       * Stores the id of the model.
       * @property _id
       * @type {string|int}
       * @private
       */
      this._id;
      
      /**
       * Stores the formatted data of the model.
       * @property _data
       * @type {object}
       * @private
       */
      this._data;
      
      /**
       * Stores an array of the updates to the model, for undo purposes.
       * @property _changes
       * @type {array}
       * @private
       */
      this._changes;
      
      /**
       * Whether the module is currently changed and has not saved that change
       * to the server.
       * @property _isChanged
       * @type {bool}
       * @private
       */
      this._isChanged;
      
    },
    
    /**
     * This method must be implemented, laying out the model's fields and their
     * properties and types. The fields object returned is keyed by the field name.
     * The value is an object, implementing various properties associated with the 
     * specific type of that field. The **type** property is required. Supported field
     * types can be found in the Model.Fields object as constants.
     *
     * @method getFields
     * @return {object}  The field mapping for the object.
     */
    getFields: function() {
    
    },
    
    /**
     * This method must be implemented to set the model to emit change events for
     * live server updates.
     *
     * @method getLive
     * @return {bool}  Whether the model live saves to the server.
     */
    getLive: function() {
      return false;
    },
    
    /**
     * Returns the value of a given field from a model.
     *
     * @method get
     * @param {string} name  The name of the field to read.
     * @param {*} alt  An alternative value to return if the field isn't set.
     * @return {*}  The value of the field read.
     */
    get: function(name, alt) {
    
    },
    
    /**
     * Sets the value of a given field on a model.
     *
     * @method set
     * @param {string} name  The name of the field to set.
     * @param {*} value  The value to set to the field.
     */
    set: function(name, value) {
    
    },
    
    /**
     * Clears the value of a given field on a model.
     *
     * @method clear
     * @param {string} name  The name of the field to clear.
     */
    clear: function(name) {
    
    },
    
    /**
     * Emits a request for a model refresh. A service must be defined to handle
     * this request for a given model and id.
     *
     * @method refresh
     */
    refresh: function() {
    
    },
    
    /**
     * Goes back to the previous state of the model. The model stores the recent
     * history of it's changes.
     *
     * @method undo
     */
    undo: function() {
    
    },
    
    /**
     * Returns the id for the given model.
     *
     * @method id
     * @return {string|number}  The id of the model.
     */
    id: function() {
    
    },
    
    /**
     * Whether the model has unsaved changes with the server.
     *
     * @method isChanged
     * @return {bool}  Whether the model is unsaved.
     */
    isChanged: function() {
    
    },
    
    /**
     * Returns an object representing the model's fields.
     *
     * @method toObject
     * @return {object}  A cloned object representing the model.
     */
    toObject: function() {
    
    },
    
    /**
     * Returns a string representing the model.
     *
     * @method toString
     * @return {object}  A string representation of the model.
     */
    toString: function() {
    
    },
    
    /**
     * Destroys a given model and all it's references.
     *
     * @method destroy
     */
    destroy: function() {
    
    }
  
  }, ['getFields']);
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Finds a model by its type string.
   * @method find
   * @static
   * @param {string} type  The type string to lookup on.
   * @return {Model}  The class object for the model.
   */
   
  /**
   * Extends an existing model class.
   * @method extend
   * @static
   * @param {object} def  The definition object for the class.
   * @return {Model}  The class object for the new model.
   */
   
  /**
   * Includes a mixin in an existing model class.
   * @method includes
   * @static
   * @param {object} def  The mixin object to apply.
   * @return {Model}  The updated class object for the model.
   */
   
   
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Model = Model;
    
  
}(Orange));