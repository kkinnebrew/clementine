// ------------------------------------------------------------------------------------------------
// Collection Class
// ------------------------------------------------------------------------------------------------

/** 
 * @module Data
 */
(function(Orange) {

  var Collection;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Events           = Orange.Events;
  var Model            = Orange.Model;


  // ------------------------------------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Fired when an item is added to a collection.
   * @event add
   * @param {*} item  The item added to the collection.
   * @param {*} index  The index of the item to append after. Defaults to the end.
   */
  var EVENT_ADD = 'add';
  
  /**
   * Fired when an item is removed from the collection.
   * @event remove
   * @param {int} index  The index or id of the item removed from the collection.
   */
  var EVENT_REMOVE = 'remove';
  
  /**
   * Fired when a change in the sorting of the collection occurs.
   * @param {bool} asc  Whether the sort is ascending.
   * @event sort
   */
  var EVENT_SORT = 'sort';
  
  /**
   * Fired when a change in the collection occurs.
   * @event update
   */
  var EVENT_UPDATE = 'update';
  
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
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------

  Collection = Class.extend({
    
    /**
     * @class Collection
     * @uses Events
     * @constructor
     */  
    initialize: function() {
      
    }
  
  }).includes(Events);
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Collection = Collection;
    
  
}(Orange));