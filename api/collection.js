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

