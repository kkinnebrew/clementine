/*!
 * OrangeUI | 0.5.0 | 09.16.2012
 * https://github.com/brew20k/orangeui
 * Copyright (c) 2012 Kevin Kinnebrew
 */

// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

/**
 * @module UI
 */
(function(Orange) {

  var Application;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Cache          = Orange.Cache;
  var Storage        = Orange.Storage;
  var View           = Orange.View;
  var ViewController = Orange.ViewController;

  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------

  Application = Class.extend({
    
    /**
     * The Application class manages the entire application lifecycle, from setup to authentication
     * to accessing services and loading the DOM.
     *
     * @class Application
     * @constructor
     * @param {object} config  The application is passed your app.json file.
     */
    initialize: function(config) {
      
    }
  
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application = Application;
    
  
}(Orange));


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
      this._process = null;
      
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
      
      /**
       * Stores an array of the data maintained within the collection.
       * @property _data
       * @type {array}
       * @default []
       * @private
       */
      this._data = [];
      
      /**
       * Stores the original data passed to the collection.
       * @property _source
       * @type {array}
       * @default []
       * @private
       */
      this._source = [];
      
      /**
       * Stores whether the collection is sorted ascending.
       * @property _asc
       * @type {bool}
       * @default true
       * @private
       */
      this._asc = true;
      
      /**
       * Stores the fields the collection has been sorted on.
       * @property _sorts
       * @type {array}
       * @default []
       * @private
       */
      this._sorts = [];
      
      /**
       * Stores the key value filters applied to the collection.
       * @property _filters
       * @type {object}
       * @default {}
       * @private
       */
      this._filters = {};
      
      /**
       * Stores the pagination integer for paginating the collection.
       * @property _paginate
       * @type {int}
       * @default 0
       * @private
       */
      this._paginate = 0;
      
      /**
       * Stores the current page the collection is on.
       * @property _page
       * @type {int}
       * @default 1
       * @private
       */
      this._page = 1;
      
    },
    
    /**
     * Gets an item from the collection by either id or index.
     *
     * @method get
     * @param {int|string} index  The id or index to lookup.
     * @return {*}  The item from the collection.
     */
    get: function(index) {
    
    },
    
    /**
     * Appends an item to the end of the collection.
     *
     * @method append
     * @param {*} item  The item to append to the collection.
     */
    append: function(item) {
    
    },
    
    /**
     * Prepends an item to the beginning of the collection.
     *
     * @method prepend
     * @param {*} item  The item to prepend to the collection.
     */
    prepend: function(item) {
    
    },
    
    /**
     * Inserts an item at specified index in the collection. Zero denotes the
     * beginning of the collection. Id's can also be used, inserting the
     * item after the item with the given id.
     *
     * @method insert
     * @param {int|string} index  The id or index to insert after.
     * @param {*} item  The item to insert into the collection.
     */
    insert: function(index, item) {
    
    },
    
    /**
     * Removes an item from the collection by a given index or id.
     *
     * @method remove
     * @param {int|string} index  The index or id to remove from the collection.
     */
    remove: function(index) {
    
    },
    
    /**
     * Clears all the items from the collection. The collection will be restored
     * to its original initialized state.
     *
     * @method clear
     */
    clear: function() {
    
    },
    
    /**
     * Returns the number of objects currently in the collection. This does not take
     * into account any applied filters.
     *
     * @method size
     * @param {bool} visible  Returns only the count of visible items.
     * @return {int}  The number of items in the collection.
     */
    size: function(visible) {
    
    },
    
    /**
     * Filters a collection on a given keyword or set of keywords. The filters will
     * be applied to a specific field, or all fields if none are specified. The filter
     * can also be applied to the existing already filtered list. By default, the list
     * will filter from its unfiltered state.
     *
     * @method filter
     * @param {string|array} keyword  The keyword or array of keywords to filter on.
     * @param {string} [field]  The field to filter on, or none if testing all fields.
     * @param {bool} [existing]  Whether or not to start the filter from the entire set.
     */
    filter: function(keyword, field, existing) {
    
    },
    
    /**
     * Unfilters the current collection, either removing a specific keyword, or
     * all filters if none are specified.
     *
     * @method unfilter
     * @param {string} [keyword]  The keyword to remove from filtering.
     */
    unfilter: function(keyword) {
    
    },
    
    /**
     * Sorts the collection based on a given field or set of fields. If a set is passed
     * the collection will filter on each field in order of precedence.  Sort must
     * only be called before paginating.
     *
     * @method sort
     * @param {string|array} field  The field or fields to sort the collection by.
     * @param {bool} direction  The direction to filter, ascending is default.
     */
    sort: function(field, direction) {
    
    },
    
    /**
     * Reverses the direction of the collection. This will be applied regardless if a
     * specific sort has been applied. Reverse cannot be called while paginated.
     *
     * @method reverse
     */
    reverse: function() {
    
    },
    
    /**
     * Paginates the collection to a specific number of items. Filter and sorts should
     * be applied prior to pagination, for they cannot be changed while paginated.
     *
     * @method paginate
     * @param {int} limit  The number of items per page.
     * @param {int} [page]  Optionally what page to start on, defaulting to the first.
     */
    paginate: function(limit, page) {
    
    },
    
    /**
     * Removes pagination from the collection returning it to its default state.
     *
     * @method unpaginate
     */
    unpaginate: function() {
    
    },
    
    /**
     * Sets the page of the paginated collection, or returns the current page of the
     * collection.
     *
     * @method page
     * @param {int} [page]  The page to goto in the collection. Optionally the current page.
     */
    page: function(page) {
    
    },
    
    /**
     * Goes to the first page of the paginated collection.
     *
     * @method start
     */
    start: function() {
    
    },
    
    /**
     * Goes to the last page of the paginated collection.
     *
     * @method end
     */
    end: function() {
    
    },
    
    /**
     * Goes to the next page of the paginated collection.
     *
     * @method next
     */
    next: function() {
    
    },
    
    /**
     * Goes to the previous page of the paginated collection.
     *
     * @method prev
     * @param
     */
    prev: function() {
    
    },
    
    /**
     * Returns an array representation of the entire collection.
     *
     * @method toArray
     * @param {bool} visible  If set, will only return filtered items.
     */
    toArray: function() {
    
    },
    
    /**
     * Destroys the collection and removes all references to its underlying data.
     *
     * @method destroy
     */
    destroy: function() {
    
    }
  
  }).includes(Events);
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Collection = Collection;
    
  
}(Orange));


// ------------------------------------------------------------------------------------------------
// ViewController Class
// ------------------------------------------------------------------------------------------------

/**
 * The UI Module contains classes for managing application interaction logic. This includes
 * manipulation the DOM, loading view, managing routes, and event bindings.
 *
 * @module UI
 */
(function(Orange) {

  var ViewController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Binding     = Orange.Binding;
  var Browser     = Orange.Browser;
  var Form        = Orange.Form;
  var Model       = Orange.Model;
  var Module      = Orange.Module;
  var Queue       = Orange.Queue;
  var View        = Orange.View;
  
  
  // ------------------------------------------------------------------------------------------------
  // Functions
  // ------------------------------------------------------------------------------------------------
  
  
  // ------------------------------------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Fired when the view controller finishes loading.
   * @event load
   */
  var EVENT_LOAD = 'load';
  
  /**
   * Fired when the view controller has appeared.
   * @event appear
   */
  var EVENT_APPEAR = 'appear';
  
  /**
   * Fired when the view controller has disappeared.
   * @event disappear
   */
  var EVENT_DISAPPEAR = 'disappear';
  
  /**
   * Fired when the view controller finishes unloading.
   * @event unload
   */
  var EVENT_UNLOAD = 'unload';
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  ViewController = Module.extend({
    
    /**
     * The ViewController is the primary class of OrangeUI and manages all interaction logic in
     * the application. This includes binding events to DOM elements, passing data to your views
     * manipulating the DOM, managing route hashes, and organizing the view lifecycle.
     *
     * @class ViewController
     * @extends Module
     * @uses Queue
     * @constructor
     * @param {ViewController} parent  The parent of the view controller if it exists.
     * @param {jQuery|string} target  Either a jQuery DOM reference or a HTML string.
     * @param {Application} [app]  An optional reference to the Application instance.
     */
    initialize: function(parent, target, app) {
    
      /**
       * Stores a reference to the global application.
       * @property _app
       * @type {Application}
       * @default {}
       * @private
       */
      this._app = app;
      
      
      /**
       * Stores a reference to the parent view, or null if the root.
       * @property _parent
       * @type {ViewController}
       * @default null
       * @private
       */
      this._parent = parent;
      
      /**
       * Stores the target jQuery object.
       * @property _target
       * @type {jQuery}
       * @private
       */
      this._target = target;
      
      
      /**
       * Stores the attributes of the target DOM node.
       * @property _attrs
       * @type {object}
       * @default {}
       * @private
       */
      this._attrs = {};
      
      /**
       * Stores references to child view controllers of the current view controller.
       * @property _views
       * @type {object}
       * @default {}
       * @private
       */
      this._views = {};
      
      /**
       * Stores references to child forms of the current view controller.
       * @property _forms
       * @type {object}
       * @default {}
       * @private
       */
      this._forms = {};
      
      /**
       * Stores references to child elements of the current view controller.
       * @property _elems
       * @type {object}
       * @default {}
       * @private
       */
      this._elems = {};
      
    
      /**
       * An object containing references any current binding objects.
       * @property _bindings
       * @type {object}
       * @default {}
       * @private
       */
      this._bindings = {};
      
      /**
       * An object containing references to the source of the target.
       * @property _source
       * @type {string}
       * @private
       */
      this._source = null;
      
      
      /**
       * Whether the view controller has been initialized.
       * @property _isInitialized
       * @type {object}
       * @default {}
       * @private
       */
      this._isInitialized = true;
      
      /**
       * Whether the view controller is loaded.
       * @property _isLoaded
       * @type {object}
       * @default {}
       * @private
       */
      this._isLoaded = false;
      
      /**
       * Whether the view controller is visible.
       * @property _isVisible
       * @type {object}
       * @default {}
       * @private
       */
      this._isVisible = false;
      
      /**
       * Whether the view controller is online.
       * @property _isOnline
       * @type {object}
       * @default {}
       * @private
       */
      this._isOnline = false;
      
    },
    
    /**
     * Returns an data attribute from the DOM target element by name.
     *
     * @method attr
     * @param {string} name  The name of the data attribute.
     * @return {string}  The value of the data attribute.
     */
    attr: function(name) {
    
    },
    
    /**
     * Returns the string represention of the view controller.
     *
     * @method toString
     * @return {string} The string of the view.
     */
    toString: function() {
      return '[' + this.getType() + ' ' + this.data.name + ']';
    },
    
    /**
     * Destroys the view controller and all of its children.
     *
     * @method destroy
     */
    destroy: function() {

    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Configuration Methods
    // ------------------------------------------------------------------------------------------------
    
    /**
     * This is a helper method that stores all event bindings associated with a view controller.
     * Events are bound to child view controllers, child forms, child elements, on the view controller
     * target. This method should return an object keyed by the name of what to bind to (view
     * controller, form, element). The values should be objects themselves, keyed by the event name
     * with a value of the function callback to execute. The view controller will auto proxy itself
     * as the context of each callback. The *$target* keyword can be used in place of a name to
     * bind an event to the entireDOM target. Beware, events bound to view controllers are custom
     * javascript events, events bound to forms and elements are jQuery DOM events.
     *
     * @method getBindings
     * @return {object} The events bindings object.
     */
    getBindings: function() {
    
    },
    
    /**
     * This is a helper method that stores all expected child view controllers, forms, and elements
     * that can be referenced in the view. Implement this for any custom controllers you build, for
     * it will warn the user that they are missing specific required [data-name] outlets in their
     * view. The method should return an object with up to three keys, views, forms, and elements,
     * each with an array of the expected **[data-name]** attribute values.
     *
     * @method getOutlets
     * @return {object} The outlets bindings object.
     */
    getOutlets: function() {
    
    },
    
    /**
     * This is a helper method handles browser hash route transitions. It should return an object
     * keyed by the route fragment for this specific view controller. Route fragments are concatenated
     * for each level of the view controller hierarchy to build the entire hash. As an example, a
     * three level deep view controller hierarchy might have a route of /one/two/three, where *one* is
     * the route passed to the root view controller, *two* is passed to the root view controller's
     * children, and so on. This method should return an object keyed by those partial route, *one*
     * or *two* as an example. Route fragments can also take in custom params. A route of /one:id
     * will pass the value of *2* from the hash /one/2/two/three to the view controller.
     
     * The method should return an object with values as function callbacks for when each route is
     * activated. The function will be passed two arguments, *current* the name of the current view,
     * and params, an object containing the hash custom parameters (like id: 2) if any exist.
     *
     * @method getRoutes
     * @return {object} The routes bindings object.
     */
    getRoutes: function() {
    
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Route Management
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Sets the current hash to the view controller.
     *
     * @method setHash
     * @chainable
     * @param {array} routes  An array of the hash split by its forward slash.
     * @param {string} subhash  The remaining hash string.
     * @return {ViewController}  Returns the view controller for chaining.
     */
    setHash: function(routes, subhash) {
    
    },
    
    /**
     * Sets the current route of the view controller. This can be called from
     * within the view controller to change the route.
     *
     * @method setRoute
     * @chainable
     * @param {string} route  The string of the route to set, excluding any custom parameters.
     * @return {ViewController}  Returns the view controller for chaining.
     */
    setRoute: function(route) {
    
    },
    
    /**
     * Returns the current route for the view controller.
     *
     * @method getRoute
     * @return {string}  The current route minus custom parameters.
     */
    getRoute: function() {
    
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // State Management
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Checks if the view controller has a given state.
     *
     * @method hasState
     * @param {string} state  The name of the state to check
     * @return {bool}  Whether the view controller has that state.
     */
    hasState: function(state) {
    
    },
    
    /**
     * Returns the current states of the view controller.
     *
     * @method getState
     * @return {array}  An array of the current active states.
     */
    getState: function() {
    
    },
    
    /**
     * Sets a state on the view controller. This corresponds to adding a class
     * on the target DOM element.
     *
     * @method setState
     * @chainable
     * @param {string|array} state  A string or array of states to set.
     * @param {int} [wait]  An optional duration to wait in the queue after setting the state.
     * @return {ViewController}  The view controller for chaining.
     */
    setState: function(state, wait) {
    
    },
    
    /**
     * Replaces a state on the view controller.
     *
     * @method replaceState
     * @chainable
     * @param {string} current  A string of the state to replace
     * @param {string} state  A string of the state to replace it with.
     * @param {int} [wait]  An optional duration to wait in the queue after setting the state.
     * @return {ViewController}  The view controller for chaining.
     */
    replaceState: function(current, state, wait) {
    
    },
    
    /**
     * Removes a state from the view controller.
     *
     * @method clearState
     * @chainable
     * @param {string} [state]  An optional state to remove, all states are removed by default.
     * @param {int} [wait]  An optional duration to wait in the queue after setting the state.
     * @return {ViewController}  The view controller for chaining.
     */
    clearState: function(state, wait) {
    
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Chainable State Handlers
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Loads the view controller if it isn't already loaded. This method will cycle through the
     * onWillLoad/onLoad/onDidLoad methods.
     *
     * @method load
     * @chainable
     * @return {ViewController}  The view controller for chaining.
     */
    load: function() {
    
    },
    
    /**
     * Shows the view controller if it isn't already visible. This method will cycle through the
     * onWillAppear/onAppear/onDidAppear methods.
     *
     * @method show
     * @chainable
     * @return {ViewController}  The view controller for chaining.
     */
    show: function() {
    
    },
    
    /**
     * Hides the view controller if it isn't already loaded. This method will cycle through the
     * onWillDisappear/onDisappear/onDidDisappear methods.
     *
     * @method hide
     * @chainable
     * @return {ViewController}  The view controller for chaining.
     */
    hide: function() {
    
    },
    
    /**
     * Unloads the view controller if it isn't already loaded. This method will cycle through the
     * onWillUnload/onUnload/onDidUnload methods.
     *
     * @method unload
     * @chainable
     * @return {ViewController}  The view controller for chaining.
     */
    unload: function() {
    
    },
    
    /**
     * Appends the view controller's target to the DOM.
     *
     * @method append
     * @chainable
     * @beta
     * @param {string} selector  The selector to append the target inside.
     * @return {ViewController}  The view controller for chaining.
     */
    append: function(selector) {
    
    },
    
    /**
     * removes the view controller's target from the DOM.
     *
     * @method remove
     * @chainable
     * @return {ViewController}  The view controller for chaining.
     */
    remove: function() {
    
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Transition Handlers
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Begins the loading sequence for a view controller. Anything that should persist
     * while the view controller is in the background and doesn't need the view controller's children
     * loaded should be setup here.
     *
     * *Beware, forgetting to call `this._super()` in any override will stop the appearing sequence.*
     *
     * @method onWillLoad
     */
    onWillLoad: function() {
    
    },
    
    /**
     * Continues the loading sequence for a view controller. This is where all child view controllers
     * are recursively loaded.
     *
     * @method onLoad
     */
    onLoad: function() {
    
    },
    
    /**
     * Finishes the loading sequence for a view controller. Anything that should persist
     * while the view controller is in the background and needs the view controller's children
     * to be loaded already should be setup here.
     *
     * @method onDidLoad
     * @fires load
     */
    onDidLoad: function() {
    
    },
    
    /**
     * Begins the appearing sequence for a view controller. Anything that should be bound before
     * a view is visible in the DOM should be setup here. Note, custom bindings from the
     * getBindings() method are setup here.
     *
     * *Beware, forgetting to call `this._super()` in any override will stop the appearing sequence.*
     *
     * @method onWillAppear
     */
    onWillAppear: function() {
    
    },
    
    /**
     * Continues the appearing sequence for a view controller. This is where all child view
     * controllers are recursively shown. A class of hidden is removed from the *target*
     * when this method finishes. This style can been implemented in CSS.
     *
     * @method onAppear
     */
    onAppear: function() {
    
    },
    
    /**
     * Finishes the appearing sequence for a view controller. Anything that should be setup after
     * the view is already visible in the DOM should be setup here.
     *
     * @method onDidAppear
     * @fires appear
     */
    onDidAppear: function() {
    
    },
    
    /**
     * Begins the disappearing sequence for a view controller. Anything that should be unbound
     * when a view becomes hidden in the DOM should be setup here (ie. events, plugins, etc).
     * Note, custom bindings from the `getBindings()` method are detached here.
     *
     * *Beware, forgetting to call `this._super()` in any override will stop the disappearing
     * sequence.*
     *
     * @method onWillDisappear
     */
    onWillDisappear: function() {
    
    },
    
    /**
     * Continues the disappearing sequence for a view controller. This is where all child view
     * controllers are recursively hidden. A class of hidden is added to the *target*
     * when this method begins. This style can been implemented in CSS.
     *
     * @method onDisappear
     */
    onDisappear: function() {
    
    },
    
    /**
     * Finishes the disappearing sequence for a view controller. Anything that should be setup
     * after the view has been hidden in the DOM should be setup here.
     *
     * @method onDidDisappear
     * @fires disappear
     */
    onDidDisappear: function() {
    
    },
    
    /**
     * Begins the unloading sequence for a view controller. Anything that should be destroyed
     * when a view unloads from memory should be handled here (ie. models, cleanup, etc).
     *
     * *Beware, forgetting to call `this._super()` in any override will stop the unloading
     * sequence.*
     *
     * @method onWillUnload
     */
    onWillUnload: function() {
    
    },
    
    /**
     * Continues the unloading sequence for a view controller. This is where all child view
     * controllers are recursively unloaded.
     *
     * @method onUnload
     */
    onUnload: function() {
    
    },
    
    /**
     * Finishes the unloading sequence for a view controller. Anything that should be setup
     * after all child views have unloaded should be setup here.
     *
     * @method onDidUnload
     * @fires unload
     */
    onDidUnload: function() {
    
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Reference Handling
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Returns a child view controller instance by the name corresponding to its **[data-name]** tag.
     *
     * @method getView
     * @param {string} name  The name of the view controller.
     * @return {ViewController}  The view controller instance.
     */
    getView: function(name) {
    
    },
    
    /**
     * Returns a child form instance by the name corresponding to its **name=""** attribute.
     *
     * @method getForm
     * @param {string} name  The name of the form.
     * @return {Form}  The form instance.
     */
    getForm: function(name) {
    
    },
    
    /**
     * Returns a element instance by the name corresponding to its **[data-name]** tag.
     *
     * @method getElement
     * @param {string} name  The name of the element.
     * @return {jQuery}  The jQuery object referencing the element.
     */
    getElement: function(name) {
    
    },
    
    /**
     * Checks if a view controller exists with a given name.
     *
     * @method hasView
     * @param {string} name  The name of the view controller.
     * @return {bool}  Whether the view exists as a child of the view controller.
     */
    hasView: function(name) {
    
    },
    
    /**
     * Checks if a form exists with a given name.
     *
     * @method hasForm
     * @param {string} name  The name of the form.
     * @return {bool}  Whether the form exists as a child of the view controller.
     */
    hasForm: function(name) {
    
    },
    
    /**
     * Checks if a element exists with a given name.
     *
     * @method hasElement
     * @param {string} name  The name of the element.
     * @return {bool}  Whether the element exists in the view.
     */
    hasElement: function(name) {
    
    },
    

    // ------------------------------------------------------------------------------------------------
    // Adhoc References
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Adds a new view controller as a child of the current view controller.
     *
     * @method addView
     * @param {string} control  The type of the view controller.
     * @param {string} name  The name to give the view controller.
     * @param {string} path  The path to load the view from.
     * @param {bool} setup  If true, it will be loaded to the same state of the parent.
     * @return {ViewController}  The ViewController that was just added.
     */
    addView: function(control, name, path, setup) {
    
    },
    
    /**
     * Removes a child view controller by name from the current view controller.
     *
     * @method removeView
     * @param {string} name  The name of the view controller to remove.
     */
    removeView: function(name) {
    
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Data Bindings
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Binds data to an element within the view controller. Bindings use the HTML5 microdata
     * tagging system to bind data to the DOM. The **[itemprop]** attribute corresponds to a model
     * field and the **[itemscope]** attribute anticipates receiving a model as its binding.
     *
     * @method bind
     * @param {string} element  The name of the element to bind the data to.
     * @param {object|array|Model|Collection|Date|string|number} data  The data to bind to the DOM.
     * @param {bool} [live]  Whether any model changes should update the DOM automatically.
     */
    bind: function(element, data, live) {
    
    },
    
    /**
     * Unbinds an existing binding from an element by name. Only one binding can exist on an
     * element at a given time.
     *
     * @method unbind
     * @param {string} element  The name of the element to unbind the data from.
     */
    unbind: function(element) {
    
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Connection Management
    // ------------------------------------------------------------------------------------------------
    
    /**
     * Called when the connection state of the application goes online, or manually if the application
     * is not managing connection state. Any changes that should occur to the view when the
     * connection goes offline should be setup here.
     *
     * @method goOnline
     */
    goOnline: function() {
    
    },
    
    /**
     * Called when the connection state of the application goes offline, or manually if the application
     * is not managing connection state. Any changes that should occur to the view when the
     * connection goes offline should be setup here.
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
    
    }
    
    
  }).includes(Queue);
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Finds a view controller by its type string.
   * @method find
   * @static
   * @param {string} type  The type string to lookup on.
   * @return {ViewController}  The class object for the view controller.
   */
   
  /**
   * Extends an existing view controller class.
   * @method extend
   * @static
   * @param {object} def  The definition object for the class.
   * @return {ViewController}  The class object for the new view controller.
   */
   
  /**
   * Includes a mixin in an existing view controller class.
   * @method includes
   * @static
   * @param {object} def  The mixin object to apply.
   * @return {ViewController}  The updated class object for the view controller.
   */
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.ViewController = ViewController;
    
  
}(Orange));


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
   * @event refresh
   * @param {string} model  The type of the model to refresh.
   * @param {string|number} id  The id to update from the service.
   */
  var EVENT_REFRESH = 'refresh';

  
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
      this._id = null;
      
      /**
       * Stores the formatted data of the model.
       * @property _data
       * @type {object}
       * @private
       */
      this._data = {};
      
      /**
       * Stores an array of the updates to the model, for undo purposes.
       * @property _changes
       * @type {array}
       * @private
       */
      this._changes = [];
      
      /**
       * Whether the module is currently changed and has not saved that change
       * to the server.
       * @property _isChanged
       * @type {bool}
       * @private
       */
      this._isChanged = false;
      
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
  // Model Constants
  // ------------------------------------------------------------------------------------------------
  
  Model.Field = {
  
    KEY:       1,
    TEXT:      2,
    URL:       3,
    DATE:      4,
    OBJECT:    5,
    ARRAY:     6,
    MODEL:     8,
    MONEY:     9,
    PERCENT:   10,
    NUMBER:    11
    
  };
  
   
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Model = Model;
    
  
}(Orange));


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
  var Events   = Orange.Events;
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


// -------------------------------------------------------------------------------------------------
// Global Functions
// -------------------------------------------------------------------------------------------------

function noop() {}

function proxy(fn, context) {
  var that = context;
  return function() {
    return fn.apply(that, arguments);
  };
}


// -------------------------------------------------------------------------------------------------
// jQuery Extensions
// -------------------------------------------------------------------------------------------------

jQuery.fn.outerHTML = function(s) {
  return s ? this.before(s).remove() : jQuery('<p>').append(this.eq(0).clone()).html();
};


// -------------------------------------------------------------------------------------------------
// Array Extensions
// -------------------------------------------------------------------------------------------------

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


// -------------------------------------------------------------------------------------------------
// Core Module
// -------------------------------------------------------------------------------------------------

/**
 * The OrangeUI Core Module contains all required base classes, objects
 * and function dependencies.
 *
 * @module Core
 */
(function() {

  var Browser;
  var Class;
  var Deferred;
  var Events;
  var EventTarget;
  var EventHandle;
  var Loader;
  var Log;
  var Orange = {};
  var Promise;
  
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
     * @param {object} def  An object of functions and properties.
     * @return {Class}  The newly created class object.
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
     * @method includes
     * @static
     * @param {object} def  An object of functions and properties.
     * @return {Class}  The class object with the mixin included.
     */
    Class.includes = function(def) {
      
      var key;
      var value;
      
    };
    
    return Class;
  
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // EventTarget Object
  // -------------------------------------------------------------------------------------------------
  
  EventTarget = (function() {
    
    /**
     * The e target object passed to all event callbacks.
     *
     * @class EventTarget
     * @constructor
     * @param {string} type  the name of the event.
     * @param {*} currentTarget  The current target set to each bubble level.
     * @param {*} target  The target that originally fired the event.
     * @param {*} data  The data payload passed along with the event.
     */
    function EventTarget(type, currentTarget, target, data) {
    
    }
    
    /**
     * Stops the event from bubbling to the currentTarget's parent.
     *
     * @method stopPropagation
     */
    EventTarget.prototype.stopPropagation = function() {
    
    };
    
    return EventTarget;
    
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // EventHandle Object
  // -------------------------------------------------------------------------------------------------

  EventHandle = (function() {
  
    /**
     * The handle returned at every event binding (not including once)
     * that maintains a reference to detach the event in the future.
     *
     * @class EventHandle
     * @constructor
     * @param {string} type The name of the event.
     * @param {function} call  The function bound to the event.
     * @param {*} target  The target the event is bound to.
     */
    function EventHandle(type, call, target) {
      
    }
    
    /**
     * Detaches the original event referenced by the EventHandle. This is a one
     * time use class and should be removed following detachment.
     *
     * @method detach
     */
    EventHandle.prototype.detach = function() {
      
    };
    
    return EventHandle;
  
  }());

  
  // -------------------------------------------------------------------------------------------------
  // Events Mixin
  // -------------------------------------------------------------------------------------------------
  
  /**
   * A mixin for adding custom event functionality to an object. Events may be
   * bound, fired, and detached dynamically directly on objects.
   *
   * @class Events
   * @static
   * @requires EventTarget
   */
  Events = {
  
    /**
     * Binds a listener to an object's event with a given context.
     *
     * @method on
     * @requires EventHandle
     * @param {string} ev  The name of the event. An event prefixed with an underscore won't bubble.
     * @param {function} call  The listener to bind to the event.
     * @param {context} [context]  The optional context to bind to the function.
     * @return {EventHandle}  The EventHandle object referencing the bound event.
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
     * @param {string} ev  The name of the event. An event prefixed with an underscore won't bubble.
     * @param {function} call  The listener to bind to the event.
     * @param {context} [context]  The optional context to bind to the function.
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
     * @param {string} ev  The name of the event.
     * @param {*} [data]  The optional data payload to pass to all callbacks.
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
     * @param {string} [ev]  The optional name of the event to unbind.
     * @param {function} [call]  The option listener to unbind.
     */
    detach: function(ev, fn) {
        
      var listeners;
      
    }
    
  };
  
  
  // -------------------------------------------------------------------------------------------------
  // Deferred Object
  // -------------------------------------------------------------------------------------------------
  
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
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.resolve = function() {

    };
    
    /**
     * Rejects the deferred object and executes all of it's fail callbacks.
     *
     * @method reject
     * @chainable
     * @param {*} [args]*  Arguments to pass to the resolve callbacks.
     * @return {Deferred} A chainable reference to the deferred.
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
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.notify = function() {
    
    };
    
    /**
     * Returns a promise for the deferred object.
     *
     * @method promise
     * @chainable
     * @return {Promise} The promise object representing the deferred.
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
     * @return {Deferred} A chainable reference to the deferred.
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
     * @return {Deferred} A chainable reference to the deferred.
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
     * @return {Deferred} A chainable reference to the deferred.
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
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.then = function(done, fail, context) {
    
    };
    
    /**
     * Accepts a callback to bind to the either the deferred's resolve or reject
     * notifications.
     *
     * @method always
     * @chainable
     * @param {function} always*  One or more callbacks to bind to completion.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Deferred} A chainable reference to the deferred.
     */
    Deferred.prototype.always = function() {
    
    };
    
    /**
     * Checks if the deferred is currently resolved.
     *
     * @method isResolved
     * @return {boolean}
     */
    Deferred.prototype.isResolved = function() {
    
    };
    
    /**
     * Checks if the deferred is currently rejected.
     *
     * @method isRejected
     * @return {boolean}
     */
    Deferred.prototype.isRejected = function() {
    
    };
        
    return Deferred;
  
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // Promise Object
  // -------------------------------------------------------------------------------------------------

  Promise = (function() {
    
    /**
     * Provides promise objects to more easily handle asynchronous function calls.
     *
     * @class Promise
     * @constructor
     * @param {Deferred} deferred  A deferred object to listen for
     */
    function Promise(deferred) {
      
      /**
       * Stores the state of the promise object.
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
     * Accepts a callback to bind to the promise's progress notification.
     *
     * @method progress
     * @chainable
     * @param {function} progress*  One or more callbacks to bind to progress.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.progress = Deferred.prototype.progress;
        
    /**
     * Accepts a callback to bind to the promise's resolve notification.
     *
     * @method done
     * @chainable
     * @param {function} done*  One or more callbacks to bind to resolve.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise} =  A chainable promise object.
     */
    Promise.prototype.done = Deferred.prototype.done;
        
    /**
     * Accepts a callback to bind to the promise's reject notification.
     *
     * @method fail
     * @chainable
     * @param {function} fail*  One or more callbacks to bind to reject.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.fail = Deferred.prototype.fail;
        
    /**
     * Accepts a callback to bind to the promise's resolve or reject notifications.
     *
     * @method then
     * @chainable
     * @param {function} done  A callback to execute on resolve.
     * @param {function} fail  A callback to execute on reject.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.then = Deferred.prototype.then;
        
    /**
     * Accepts a callback to bind to the either the promise's resolve or reject
     * notifications.
     *
     * @method always
     * @chainable
     * @param {function} always*  One or more callbacks to bind to completion.
     * @param {*} [context]  An optional context to bind to the callbacks.
     * @return {Promise}  A chainable promise object.
     */
    Promise.prototype.always = Deferred.prototype.always;
        
    /**
     * Checks if the promise is currently resolved.
     *
     * @method isResolved
     * @return {boolean}  Whether the promise is resolved
     */
    Promise.prototype.isResolved = Deferred.prototype.isResolved;
        
    /**
     * Checks if the promise is currently rejected.
     *
     * @method isRejected
     * @return {boolean}  Whether the promise is rejected.
     */
    Promise.prototype.isRejected = Deferred.prototype.isRejected;
      
    return Promise;
  
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // Loader Object
  // -------------------------------------------------------------------------------------------------
  
  /**
   * Handles dependency loading for each module.
   *
   * @class Loader
   */
  Loader = (function() {
    
    /**
     * Stores references to each module and its exports object by name.
     * @property _modules
     * @type {object}
     * @default {}
     * @private
     */
    var _modules = {};

        
    return {
      
      /**
       * Add a given module and its configuration parameters.
       *
       * @method addModule
       * @param {string} name  The name of the module to add.
       * @param {function} fn  The function containing the module's code.
       * @param {array} [required]  An array of required module dependencies.
       */
      addModule: function(name, fn, required) {
        
        var mod;
        
      },
      
      /**
       * Loads a given module and its dependent modules by name.
       *
       * @method loadModule
       * @param {string} name  The name of the module to load.
       */
      loadModule: function(name) {
        
      }
      
    };
    
  }());
  
  
  // -------------------------------------------------------------------------------------------------
  // Log Object
  // -------------------------------------------------------------------------------------------------
  
 
  Log = Class.extend({
  
      
    /**
     * A wrapper around logging. Allows the application to intercept log
     * event messages and display them to the user.
     *
     * @class Log
     * @constructor
     * @uses Events
     */
    initialize: function(name) {
      
      /**
       * Stores the level of the logger.
       * @property _level
       * @type {string}
       * @default DEBUG
       * @private
       */
      this._level = 'DEBUG';
      
    },
    
    /**
     * A wrapper around logging. Allows the application to intercept log
     * event messages and display them to the user.
     *
     * @method setLevel
     * @param {string} level  The level to set the logger to.
     */
    setLevel: function(level) {
    
    },
    
    /**
     * Logs a debug message to the console.
     *
     * @method debug
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    debug: function(message, ex) {
    
    },
    
    /**
     * Logs a info message to the console.
     *
     * @method info
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    info: function(message, ex) {
    
    },
    
    /**
     * Logs a warn message to the console.
     *
     * @method warn
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    warn: function(message, ex) {
    
    },
    
    /**
     * Logs a error message to the console.
     *
     * @method error
     * @param {string} message  The message to log to the console.
     * @param {object} ex  An optional exception or object to log.
     */
    error: function(message, ex) {
    
    }
  
  }).includes(Events);
  
  
  // -------------------------------------------------------------------------------------------------
  // Browser
  // -------------------------------------------------------------------------------------------------
  
  /**
   * The Browser object stores many commonly checked feature detection results.
   *
   * @class Browser
   * @static
   */
  Browser = {};
  
  
  // -------------------------------------------------------------------------------------------------
  // Module Functions
  // -------------------------------------------------------------------------------------------------
  
  /**
   * Adds a new module and it's dependencies by name.
   *
   * @method add
   * @param {string} name  The name of the module.
   * @param {function} fn  The function containing the module's code.
   * @param {array} [required]  An array of required modules to load.
   */
  function add() {

  }
  
  /**
   * Loads a set of modules by name and then executes an optional
   * function using those modules.
   *
   * @method use
   * @param {string} [modules]*  A set of modules to load.
   * @param {function} [fn] An optional function to call using those modules.
   */
  function use() {

  }
  
  /**
   * Includes a module in another and returns the exports object of that module.
   *
   * @method include
   * @param {string} name  The name of the module to include.
   */
  function include(name) {

  }
  
  /**
   * Returns a new deferred object that resolves when two existing promises or
   * deferreds have resolved.
   *
   * @method when
   * @param {Deferred|Promise} deferred*  A set of deferreds to build the new object from.
   * @return {Deferred}  A Deferred object that resolves when the arguments resolve.
   */
  function when() {
  
  }
  
  
  // -------------------------------------------------------------------------------------------------
  // Exports
  // -------------------------------------------------------------------------------------------------
  
  Orange              = this.Orange = { modules: {} };
  Orange.version      = '0.6.0';
  
  Orange.add          = this.add = add;
  Orange.use          = this.use = use;
  Orange.include      = this.include = include;
  Orange.when         = this.when = when;
  
  Orange.Class        = Class;
  Orange.Deferred     = Deferred;
  Orange.Events       = Events;
  Orange.EventHandle  = EventHandle;
  Orange.Loader       = Loader;
  Orange.Log          = new Log();
  Orange.Promise      = Promise;
  

}.call(this));


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


// ------------------------------------------------------------------------------------------------
// View Object
// ------------------------------------------------------------------------------------------------

/**
 * @module UI
 */
(function(Orange) {
  
  /**
   * The static view loader class that asynchronously loads view
   * fragments and caches them on the client for use.
   *
   * @class View
   * @static
   */
  var View = {};
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Definition
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Returns the source for a cached view by a given name. Multiple views can be stored
   * in the same template file. To distingush between them, set the optional parameters control
   * and name that correspond to the **[data-control]** and **[data-name]** attributes on the view.
   * Omitting both will return the first view it finds. Omitting [data-control] will return the
   * first view matching **[data-control]** if more than one exists. Views should have unique
   * **[data-name]** attributes.
   *
   * @method find
   * @static
   * @param path {string}  The path to look up within.
   * @param [control] {string}  The optional ViewController type to lookup.
   * @param [name] {string}  The optional ViewController name to lookup.
   */
  View.find = function(path, control, name) {
  
  };
  
  /**
   * Registers a list of view paths, retrieves the source of each view asynchronously,
   * and caches the view markup for later use. This should be run before your application
   * has launched if you are using any view fragements *(ie. [data-template] attributes)*.
   * By default, the paths registered are relative to the `templates/` directory.
   *
   * @method register
   * @static
   * @param paths {Array} An array of view paths.
   * @return {Promise}  A promise that resolves when the views have been loaded.
   */
  View.register = function(paths) {
  
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.View = View;
  

}(Orange));

