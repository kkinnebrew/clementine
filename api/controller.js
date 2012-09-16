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

