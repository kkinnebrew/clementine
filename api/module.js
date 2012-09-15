// ------------------------------------------------------------------------------------------------
// Module Class
// ------------------------------------------------------------------------------------------------

/** 
 * @module Core
 */
(function(Orange) {

  var Module;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Deferred = Orange.Deferred;
  var Promise = Orange.Promise;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  /**
   * The Module class adds class key registration and the Event mixin to
   * the generic class object.
   *
   * @class Module
   * @uses Events
   */
  Module = Class.extend({
    
    /**
     * When implemented, it should return a unique string name to match the
     * class. This allows classes to be looked up by name.
     *
     * @method getType
     * @return {string}  The unique type name of the class.
     */
    getType: function() {
    
    }
  
  }).includes(Events);
  
  
  /**
   * Allows the lookup of a class by the value of its getType() string.
   *
   * @method find
   * @static
   * @param {string} type  The type string to lookup
   */
  Module.find = function(type) {
  
  };
  
  /**
   * Overrides the default extend method to handle implementation
   * requirements. The module will check to be sure any subclasses
   * implement required methods.
   *
   * @method extend
   * @static
   * @param {object} def  An object of functions and properties.
   * @param {Array} impl  An array of method names that are required.
   * @return {Module}  The newly created module object.
   */
  Module.extend = function(def, impl) {
  
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Module = Module;
    
  
}(Orange));