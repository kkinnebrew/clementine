// ------------------------------------------------------------------------------------------------
// Binding Class
// ------------------------------------------------------------------------------------------------

/**
 * The Data Module handles all service connections, data models for the client, live data
 * bindings to the DOM, and caching.
 *
 * @module Data
 */
(function(Orange) {

  var Binding;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Collection   = Orange.Collection;
  var Model        = Orange.Model;
  
  
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
   * @param {string|number} oldId  The old id to replace.
   * @param {string|number} newId  The new id to update.
   */
  var EVENT_SYNC = 'sync';

  
  // ------------------------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Binds a collection to jQuery DOM element target.
   *
   * @method bindCollection
   * @private
   * @param {jQuery} target  The jQuery target to bind to.
   * @param {Collection} collection  The collection object to bind.
   */
  function bindCollection(target, collection) {
  
  }
  
  /**
   * Binds an array to jQuery DOM element target.
   *
   * @method bindList
   * @private
   * @param {jQuery} target  The jQuery target to bind to.
   * @param {array} list  The array to bind.
   * @param {string} field  The field to use as the index.
   * @param {bool} ignore  Whether to ignore the data of the field.
   */
  function bindList(target, list, field, ignore) {
  
  }
  
  /**
   * Binds a model to jQuery DOM element target.
   *
   * @method bindModel
   * @private
   * @param {jQuery} target  The jQuery target to bind to.
   * @param {Model} model  The model to bind.
   */
  function bindModel(target, model) {
  
  }
  
  /**
   * Binds an object to jQuery DOM element target.
   *
   * @method bindModel
   * @private
   * @param {jQuery} target  The jQuery target to bind to.
   * @param {Model} model  The model to bind.
   * @param {string} field  The field to use as the index.
   * @param {bool} ignore  Whether to ignore the data of the field.
   */
  function bindData(target, data, field, ignore) {
  
  }
  
  /**
   * Binds raw primative data to a jQuery DOM element target.
   *
   * @method bindItem
   * @private
   * @param {jQuery} target  The jQuery target to bind to.
   * @param {string|number|Date} item  The item data to bind.
   */
  function bindItem(target, item) {
  
  }
  
  /**
   * Called when a collection emits an add event. Inserts a new
   * item into the DOM at a specific index.
   *
   * @method onAdd
   * @private
   */
  function onAdd(e) {
  
    var item = e.data.item;
    var index = e.data.index;
    var target; // might need this
  
  }
  
  /**
   * Called when a collection emits a remove. Removes an existing
   * item from the DOM at a specific index.
   *
   * @method onRemove
   * @private
   */
  function onRemove(e) {
  
    var index = e.data.index;
    var target; // might need this
  
  }
  
  /**
   * Called when a collection emits a remove event. Removes an existing
   * item from the DOM at a specific index.
   *
   * @method onSort
   * @private
   */
  function onSort(e) {
  
    var asc = e.data.asc;
    var target; // might need this
  
  }
  
  /**
   * Called when a collection emits an update event. This will refresh the DOM
   * and replace the existing data with fresh data.
   *
   * @method onUpdate
   * @private
   */
  function onUpdate(e) {
    
    var target; // might need this
    
  }
    
  /**
   * Called when a model emits an change event. This will update any instances
   * of the model in the DOM with the correct data.
   *
   * @method onChange
   * @private
   */
  function onChange(e) {
    
    var field = e.data.field;
    var value = e.target instanceof Model ? e.target.get(field) : e.target[field];
    var target; // might need this
    
  }
  
  /**
   * Called when a new model is synced with the server and has an id assigned to it. This
   * will update the model in the DOM with the new id.
   *
   * @method onSync
   * @private
   */
  function onSync(e) {
    
    var oldId = e.data.oldId;
    var newId = e.data.newId;
    var target; // might need this
    
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------

  Binding = Class.extend({
    
    /**
     * The Binding class allows for live data binding of objects, arrays, Models, and Collections
     * to DOM elements using HTML5's **Microdata** specification.
     *
     * @class Binding
     * @constructor
     * @param {jQuery} target  A reference to a DOM element that will be used for binding.
     */
    initialize: function(target) {
      
      /**
       * Stores a reference to the jQuery target object.
       * @property _target
       * @type {jQuery}
       * @private
       */
      this._target = target;
      
      /**
       * Stores the html text of the original target. Unbinding reverts to this markup.
       * @property _template
       * @type {string}
       * @private
       */
      this._template = null;
      
      /**
       * Stores a reference to the data being bound.
       * @property _data
       * @type {object|array|Model|Collection|Date|string|number}
       * @private
       */
      this._data = null;
      
      /**
       * Stores handles to all the items bound to listen for model changes.
       * @property _handles
       * @type {array}
       * @default []
       * @private
       */
      this._handles = [];
      
      /**
       * Whether the binding is currently in the process of binding.
       * @property _isBinding
       * @type {bool}
       * @default false
       * @private
       */
      this._isBinding = false;
      
      /**
       * Whether the target is already bound with data.
       * @property _isBound
       * @type {bool}
       * @default false
       * @private
       */
      this._isBound = false;
      
    },
    
    /**
     * Binds data to a DOM element, using HTML5's **Microdata** specification for bindings. If
     * the element is already bound with data, that data will be removed and replaced.
     *
     * @method bind
     * @param {object|array|Model|Collection|Date|string|number} data  The data to bind to the DOM.
     * @param {bool} live  Whether to live bind the data.
     */
    bind: function(data, live) {
    
    },
    
    /**
     * Unbinds data from a DOM element, returning it to its original state.
     *
     * @method unbind
     */
    unbind: function() {
    
    },
    
    /**
     * Destroys a binding, removing all references to DOM elements and models.
     *
     * @method destroy
     */
    destroy: function() {
    
    }
  
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Binding = Binding;
    
  
}(Orange));

