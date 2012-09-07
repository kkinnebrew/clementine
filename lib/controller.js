// ------------------------------------------------------------------------------------------------
// ViewController Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var ViewController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Binding     = Orange.Binding;
  var Browser     = Orange.Browser;
  var Form        = Orange.Form;
  var View        = Orange.View;
  
  
  // ------------------------------------------------------------------------------------------------
  // Functions
  // ------------------------------------------------------------------------------------------------
  
  /**
   * @param source       the node to copy from
   * @param destination  the node to copy to
   */
  function cloneAttributes(source, destination) {
    destination = $(destination).eq(0);
    source = $(source)[0];
    for (var i = 0; i < source.attributes.length; i++) {
      var a = source.attributes[i];
      destination.attr(a.name, a.value);
    }
  }
  
  /**
   * @param obj      the object to operate on
   * @param match    the regex expression to match
   * @return object  the attributes stripped
   */
  function stripAttributes(obj, match) {
    var target = $(obj).get(0), attrs = {}, names = [];
    for (var i = 0, len = target.attributes.length; i < len; i++) {
      if (target.attributes[i].name.match(match)) {
        attrs[target.attributes[i].name.replace(match, '')] = target.attributes[i].value;
        names.push(target.attributes[i].name);
      }
    }
    for (var j = 0; j < names.length; j++) {
      $(obj).removeAttr(names[j]);
    }
    return attrs;
  }
  
  /**
   * @param obj       the object to operate on
   * @param selector  the selector to look for
   * @return array    the array of child $() objects found
   */
  function firstChildren(obj, selector) {
    var childList = [];
    obj.find(selector).each(function() {
      var include = false, parent = $(this).parent();
      while (parent.length !== 0 && !include) {
        if ($(parent).not($(obj)).length === 0) {
          include = true; break;
        } else if ($(parent).not('[data-control]').length === 0) {
          include = false; break;
        } parent = $(parent).parent();
      }
      if (include) { childList.push($(this)); }
    });
    return childList;
  }
  
  /**
   * returns the route string for a given key
   * @param key  the key to lookup
   * @return string
   */
  function getRouteForKey(key) {
  
    var callbacks = this.getRoutes();
    var alt;
    
    for (var route in callbacks) {
      if (route.match('/')) {
        if (route.split('/').shift() === key) {
          return route;
        } else if (route.split('/').shift() === this.getParam('default')) {
          alt = route;
        }
      } else if (route === key) {
        return route;
      } else if (route === this.getParam('default')) {
        alt = route;
      }
    }
    return route;
  }
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  ViewController = Class.extend({
  
  
    // ------------------------------------------------------------------------------------------------
    // Internal Methods
    // ------------------------------------------------------------------------------------------------
  
    /**
     * initializes a new ViewController from
     * a given view and parent
     * @param parent  the parent controller
     * @param target  html view or reference
     */
    initialize: function(parent, target) {
      
      // mark uninitialized
      this._initialized = false;
      
      // store references
      this.parent = parent || null;
      this.target = $(target);
      
      // store children
      this._views = this.setupViews();
      this._forms = this.setupForms();
      this._elems = this.setupElements();
      
      // store attributes
      this._attrs = this.setupAttributes();
      
      // validate view
      this.validateOutlets();
      
      // store source
      this._source = this.target.outerHTML();
      
      // setup queue
      this._queue = [];
      
      // store states
      this._loaded = false;
      this._visible = false;
      
      // setup events
      this.setupTransitions();
      
      // remove target if it exists
      if (typeof this.target === 'object') {
        this.target.addClass('hidden');
      }
      
      // call setup
      this.setup();
      
      // mark initialized
      this._initialized = true;
      
    },
    
    /**
     * processes and removes all [data] prefixed
     * attributes
     * @returns object  a dictionary of [data] attributes
     */
    setupAttributes: function() {
      
      if (this._initialized) { return; }
      
      var attrs = stripAttributes(this.target, /data-/);
      
      if (!attrs.hasOwnProperty('name')) {
        attrs.name = attrs.control;
      }
      
      if (attrs.hasOwnProperty('state')) {
        this._state = attrs.state;
        this.target.addClass(attrs.state);
      } else {
        this._state = null;
      }

      this.target.addClass('view');
      if (typeof this.typeList !== 'undefined') {
        this.target.addClass(this.typeList);
      }
      
      this.target.addClass(attrs.name);
      
      return attrs;
      
    },
    
    /**
     * processes all immediate child views and returns
     * their references as instances of a ViewController
     * @returns object  a dictionary of view controllers
     */
    setupViews: function() {
      
      if (this._initialized) { return; }
      
      var children = firstChildren(this.target, '[data-control]');
      var views = {}, name, type, source, path, c;
            
      for (var i = 0; i < children.length; i++) {
      
        type = children[i].attr('data-control');
        name = children[i].attr('data-name') || type;
        path = children[i].attr('data-template');

        if (path && path.length > 0) {
          source = View.get(path, type, name);
          children[i].html(source.html());
          cloneAttributes(source, children[i]);
          children[i].removeAttr('data-template');
        }
        
        c = ViewController.get(type);
        views[name] = new c(this, children[i]);
        
      }
      
      return views;
      
    },
    
    /**
     * processes all immediate child forms and returns
     * their references as instances of a Form
     * @returns object  a dictionary of forms
     */
    setupForms: function() {
      
      if (this._initialized) { return; }
      
      var children = firstChildren(this.target, 'form');
      var forms = {}, name, child;
      
      for (var i = 0, len = children.length; i < len; i++) {
        name = children[i].attr('name');
        child = new Form(children[i]);
        forms[name] = child;
      }
      
      return forms;
      
    },
    
    /**
     * processes all immediate child elements as given
     * by their [data-name] attribute and stores references
     * to their jQuery objects
     * @returns object  a dictionary of elements
     */
    setupElements: function() {
      
      if (this._initialized) { return; }
      
      var children = firstChildren(this.target, '[data-name]:not([data-control])');
      var elements = {}, name;
      
      for (var i = 0; i < children.length; i++) {
        name = children[i].attr('data-name');
        if (name.length > 0) {
          elements[name] = children[i];
          children[i].removeAttr('data-name').addClass(name);
        }
      }
      
      return elements;
      
    },
    
    /**
     * validates all aspects of a view adhere to the
     * interface of the view
     */
    validateOutlets: function() {
      
      // get outlets
      var outlets = this.getOutlets();
      var errors = [];
      var ex;
            
      // manage outlets
      for (var name in outlets) {
        switch (outlets[name]) {
          case 'view':
            if (!this.hasView(name)) {
              errors.push(name);
            }
            break;
          case 'form':
            if (!this.hasForm(name)) {
              errors.push(name);
            }
            break;
          case 'element':
            if (!this.hasElement(name)) {
              errors.push(name);
            }
            break;
          default:
            break;
        }
      }
            
      // print errors
      if (errors.length > 0) {
        throw ('Invalid Syntax: ViewController "' + this.getParam('name') + '" missing outlets [' + errors.join(', ') + ']');
      }
      
      // get routes
      var routes = this.getRoutes();
      
      if (!this.getParam('default') && Object.keys(routes).length > 0) {
        throw ('Invalid Markup: ViewController "' + this.getParam('name') + '" implements routes but is missing [data-default]');
      }
      
    },
    
    /**
     * sets up all events for managing state transitions
     */
    setupTransitions: function() {
            
      if (this._initialized) { return; }
    
      this.on('_load', this.onLoad, this);
      this.on('_loaded', this.onDidLoad, this);
      this.on('_appear', this.onAppear, this);
      this.on('_appeared', this.onDidAppear, this);
      this.on('_disappear', this.onDisappear, this);
      this.on('_disappeared', this.onDidDisappear, this);
      this.on('_unload', this.onUnload, this);
      this.on('_unloaded', this.onDidUnload, this);
      
    },
    
    /**
     * returns a string representation of the controller
     */
    toString: function() {
      return '[' + this.getType() + ' ' + this.data.name + ']';
    },
    
    /**
     * destroys the view controller and all of its children
     */
    destroy: function() {
            
      // destroy views
      for (var view in this._views) { this._views[view].destroy(); delete this._views[view]; }
      for (var form in this._forms) { this._forms[form].destroy(); delete this._forms[form]; }
      for (var elem in this._elems) { delete this._elems[elem]; }
          
      // clear references
      delete this.target;
      delete this.parent;
      delete this._source;
      delete this._queue;
      
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Configuration Methods
    // ------------------------------------------------------------------------------------------------
    
    /**
     * implement to name the view controller type
     * @required
     * @returns string  the name of the view controller
     */
    getType: function() {
      return 'view';
    },
    
    /**
     * implement to automate event bindings
     * @returns object  a configuration of event bindings
     */
    getBindings: function() {
      return {};
    },
    
    /**
     * implement to automate view integrity checks
     * @returns object  a configuration of expected views
     */
    getOutlets: function() {
      return {};
    },
    
    /**
     * implement to automate state transitions
     * @returns object  a configuration of state callbacks
     */
    getRoutes: function() {
      return {};
    },
    
    /**
     * called after the view controller is initialized
     */
    setup: function() {},
    
    
    // ------------------------------------------------------------------------------------------------
    // Queuing Methods
    // ------------------------------------------------------------------------------------------------
    
    /**
     * adds a new function to the queue
     * @param fn    the function to execute
     * @param args  optional arguments array to pass the function
     * @param wait  a duration to wait after the callback finishes
     */
    add: function(fn, args, wait) {
      this._queue.push({fn: fn, args: args, wait: wait});
      if (!this._running) { this.next(); }
    },
    
    /**
     * executes the next item in the queue
     */
    next: function() {
      this._running = true;
      var next = this._queue.shift();
      if (next) {
        next.fn.apply(this, next.args);
        if (next.fn === this._setState || next.fn === this._clearState) {
          setTimeout(proxy(function() {
            this.next();
          }, this), next.wait);
        }
      } else {
        this._running = false;
      }
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Route Management
    // ------------------------------------------------------------------------------------------------
  
    setRoute: function(route) {
      this.add(this._setRoute, [route], 0);
      return this;
    },
    
    getRoute: function() {
      return this.route;
    },
  
    /**
     * handles internal state management of views
     */
    _setRoute: function(route) {
            
      var key = getRouteForKey.call(this, route);
      
      if (this.route === route) {
        this.next();
        return;
      }
      
      var callbacks = this.getRoutes();
      var params = {};
      
      // get route params
      if (key.match('/')) {
        var parts = key.split('/');
        for (var i=1; i<parts.length; i++) {
          params[parts[i].replace(':', '')] = this.getParam(parts[i].replace(':', '')) || null;
        }
      }
      
      var hash = '#' + this._routes + (this._routes ? '/' : '') + route;
      location.hash = hash;
      
      this.next();
    
    },
    
    setHashRoute: function(routes, subhash) {
      this.add(this._setHashRoute, [routes, subhash], 0);
      return this;
    },
  
    /**
     * handles history management of views
     * @param routes  an array of states
     */
    _setHashRoute: function(routes, subhash) {
    
      // store route history
      var i = 0;
      var view;
      
      subhash = subhash ? subhash : '';
    
      if (this.getParam('default')) {
        if (!routes || routes.length === 0) {
          routes = [this.getParam('default')];
        }
      } else {
        for (view in this._views) {
          this.getView(view).setHashRoute(routes.slice(0), subhash);
        }
        this.next();
        return;
      }
            
      var route = routes.shift();
      
      var key = getRouteForKey.call(this, route);
      var callbacks = this.getRoutes();
      var params = {};
      var param;
      var empty = 0;
      
      // get route params
      if (key.match('/')) {
        var parts = key.split('/');
        for (i=1; i<parts.length; i++) {
          param = routes.shift();
          params[parts[i].replace(':', '')] = param || 'null';
          this.setParam(parts[i].replace(':', ''), param || null);
          if (!param) { empty++; }
        }
      }

      this._routes = subhash || '';
      
      subhash += (subhash.length > 0) ? ('/' + route) : route;

      for (var p in params) {
        subhash += '/' + params[p];
      }
            
      if (callbacks.hasOwnProperty(key)) {
        callbacks[key].call(this, this.route, params);
      }

      for (view in this._views) {
        this.getView(view).setHashRoute(routes.slice(0), subhash);
      }
      
      this.route = route;
      this.next();
      
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // State Management
    // ------------------------------------------------------------------------------------------------
  
    getState: function() {
      return this._state;
    },
    
    setState: function(state, wait) {
      this.add(this._setState, [state], wait || 0);
      return this;
    },
    
    clearState: function(wait) {
      this.add(this._clearState, [], wait || 0);
      return this;
    },
    
    _setState: function(state, force) {
      if ((this.hasState(state) || !this._loaded) && !force) {
        return;
      }
      this.target.removeClass(this._state);
      this.target.addClass(state);
      this._state = state;
    },
    
    _clearState: function() {
      this.target.removeClass(this._state);
      this._state = null;
    },
  
    hasState: function(state) {
      return this._state === state;
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Chainable State Handlers
    // ------------------------------------------------------------------------------------------------
    
    load: function() {
      this.add(this._load);
      return this;
    },
    
    show: function() {
      this.add(this._show);
      return this;
    },
    
    hide: function() {
      this.add(this._hide);
      return this;
    },
    
    unload: function() {
      this.add(this._unload);
      return this;
    },
    
    append: function() {
      this.add(this._append);
      return this;
    },
    
    remove: function() {
      this.add(this._remove);
      return this;
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Private State Handlers
    // ------------------------------------------------------------------------------------------------
    
    _load: function() {
      
      // return if already loading
      if (this._loaded) {
        this.next(); // fire the next call in the queue
        return;
      }
      
      // set default state if it exists
      
      // call onWillLoad
      this.onWillLoad();
      
    },
    
    _show: function() {
      
      // return if already visible
      if (this._visible) {
        this.next();
        return;
      } else if (!this._loaded) {
        throw new Error('Invalid Request: Cannot show unloaded ViewController');
      }

      // call onWillAppear
      this.onWillAppear();
      
    },
    
    _hide: function() {
      
      // return if already hidden or hiding
      if (!this._visible) {
        this.next();
        return;
      }
      
      // call onWillDisappear
      this.onWillDisappear();
      
    },
    
    _unload: function() {
      
      // return if already unloading
      if (!this._loaded) {
        this.next();
        return;
      } else if (this._visible) {
        throw new Error('Invalid Request: Cannot unload visible ViewController');
      }
      
      // call onWillUnload
      this.onWillUnload();
      
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Private Transition Handlers
    // ------------------------------------------------------------------------------------------------
    
    onWillLoad: function() {
          
      // DEBUG
      console.log(this.getParam('name') + ' ' + "Will Load");
      
      // fire load event
      this.fire('_load');
      
    },
    
    onLoad: function() {
      
      var count = Object.keys(this._views).length;
      
      // load children
      if (count === 0) {
        this.fire('_loaded');
      } else {
        for (var name in this._views) {
          var view = this._views[name];
          view.once('load', proxy(function() {
            count--;
            if (count === 0) {
              this.fire('_loaded');
            }
          }, this));
          view.load();
        }
      }

    },
    
    onDidLoad: function() {

      // DEBUG
      console.log(this.getParam('name') + ' ' + "Did Load");
      
      // mark as loaded
      this._loaded = true;
      
      // fire public load event
      this.fire('load');
      
      // run next item
      this.next();
    
    },
    
    onWillUnload: function() {
    
      // run functions
      console.log(this.getParam('name') + ' ' + "Will Unload");
      
      // ex. clear data
      
      // fire unload event
      this.fire('_unload');
    
    },
    
    onUnload: function() {
      
      var count = Object.keys(this._views).length;
      
      // unload children
      if (count === 0) {
        this.target.remove();
        this.fire('_unloaded');
      } else {
        for (var name in this._views) {
          var view = this._views[name];
          view.once('unload', proxy(function() {
            count--;
            if (count === 0) {
              this.target.remove();
              this.fire('_unloaded');
            }
          }, this));
          view.unload();
        }
      }
      
    },
    
    onDidUnload: function() {
    
      // run functions
      console.log(this.getParam('name') + ' ' + "Did Unload");

      // mark unloaded
      this._loaded = false;
      
      // fire public unload event
      this.fire('unload');
      
      // call next
      this.next();
    
    },
    
    
    // display transitions
    
    onWillAppear: function() {
            
      // run functions
      console.log(this.getParam('name') + ' ' + "Will Appear");
            
      // bind events
      var views = this.getBindings();
      
      for (var view in views) {
        var events = views[view];
        for (var event in events) {
          var func = null;
          if (typeof events[event] === "function") { func = events[event]; }
          else if (this.hasOwnProperty(events[event])) { func = this[events[event]]; }
          if (event === 'touchclick') { event = Browser.touch ? 'touchend' : 'click'; }
          if (func === null) {
            var name = event.charAt(0).toUpperCase() + event.slice(1);
            func = (events[event] === true && typeof this['on' + name] === 'function') ? this['on' + name] : null;
          }
          if (view === '$target') {
            this.target.on(event, proxy(func, this));
          } else if (func !== null && this.hasView(view)) {
            this.getView(view).on(event, proxy(func, this));
          } else if (func !== null && this.hasForm(view)) {
            this.getForm(view).on(event, proxy(func, this));
          } else if (func !== null && this.hasElement(view)) {
            this.getElement(view).on(event, proxy(func, this));
          }
        }
      }
      
      // remove hidden class
      this.target.removeClass('hidden');
      
      // fire appear event
      this.fire('_appear');
      
    },
    
    onAppear: function(e) {
                  
      var count = Object.keys(this._views).length;
      
      // show children
      if (count === 0) {
        this.fire('_appeared');
      } else {
        for (var name in this._views) {
          var view = this._views[name];
          view.once('appear', proxy(function() {
            count--;
            if (count === 0) {
              this.fire('_appeared');
            }
          }, this));
          view.show();
        }
      }
      
    },
    
    onDidAppear: function(e) {
        
      // run functions
      console.log(this.getParam('name') + ' ' + "Did Appear");
      
      // mark as visible
      this._visible = true;
      
      // fire public appear event
      this.fire('appear');
      
      // call next
      this.next();

    },
    
    onWillDisappear: function() {
      
      // run functions
      console.log(this.getParam('name') + ' ' + "Will Disappear");
      
      // unbind events
      for (var view in this._views) { this.getView(view).detach(); }
      for (var form in this._forms) { this.getForm(form).detach(); }
      for (var elem in this._elems) { this.getElement(elem).unbind(); }
      
      // fire disappear event
      this.fire('_disappear');
      
    },
    
    onDisappear: function(e) {
            
      var count = Object.keys(this._views).length;
      
      // hide children
      if (count === 0) {
        this.fire('_disappeared');
      } else {
        for (var name in this._views) {
          var view = this._views[name];
          view.once('disappear', proxy(function() {
            count--;
            if (count === 0) {
              this.fire('_disappeared');
            }
          }, this));
          view.hide();
        }
      }
      
    },
    
    onDidDisappear: function(e) {
      
      // run functions
      console.log(this.getParam('name') + ' ' + "Did Disappear");
      
      // remove hidden class
      this.target.addClass('hidden');
      
      // mark as hidden
      this._visible = false;
      
      // fire public disappear event
      this.fire('disappear');
      
      // call next
      this.next();
    
    },
        
    
    // ------------------------------------------------------------------------------------------------
    // Attribute Management
    // ------------------------------------------------------------------------------------------------
    
    setParam: function(name, value) {
      console.log(this.getParam('name') + ': ' + name + ' = "' + value + '"');
      this._attrs[name] = value;
    },
    
    getParam: function(name) {
      return this._attrs.hasOwnProperty(name) ? this._attrs[name] : null;
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Reference Handling
    // ------------------------------------------------------------------------------------------------
    
    getViews: function() {
      return this._views;
    },
    
    getView: function(name) {
      if (name instanceof ViewController) { return name; }
      else if (typeof this._views[name] !== 'undefined') { return this._views[name]; }
      throw new Error('Invalid Request: View "' + name + '" not found');
    },
    
    getForm: function(name) {
      if (this._forms[name] instanceof Form) { return this._forms[name]; }
      throw new Error('Invalid Request: Form "' + name + '" not found');
    },
  
    getElement: function(name) {
      if (typeof this._elems[name] !== 'undefined') { return this._elems[name]; }
      throw new Error('Invalid Request: Element "' + name + '" not found');
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Reference Validation
    // ------------------------------------------------------------------------------------------------
  
    hasView: function(name) {
      return typeof this._views[name] !== 'undefined';
    },
    
    hasForm: function(name) {
      return typeof this._forms[name] !== 'undefined';
    },
    
    hasElement: function(name) {
      return typeof this._elems[name] !== 'undefined';
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Adhoc References
    // ------------------------------------------------------------------------------------------------
    
    addView: function(control, name, template) {
      if (this.hasView(name)) {
        throw new Error('Invalid Request: ViewController ' + name + ' already exists');
      }
      var c = ViewController.get(control);
      var v = View.get(template, control, name);
      if (c) {
        this._views[name] = new c(this, v, this.app);
      }
      return this._views[name];
    },
    
    removeView: function(name) {
      if (this.hasView(name)) {
        this._views[name].hide().unload().destroy();
        delete this._views[name];
      }
    },
    
    
    // ------------------------------------------------------------------------------------------------
    // Data Bindings
    // ------------------------------------------------------------------------------------------------
    
    bind: function(element, data) {
    
      if (!this.hasElement(element)) {
        throw ('Invalid Resource: Element "' + element + '" is not defined');
      }
      
      if (this.bindings.hasOwnProperty(element)) {
       this.bindings[element].unbind();
       delete this.bindings[element];
      }
      
      this.bindings[element] = new Binding(this.getElement(element));
      this.bindings[element].bind(data);
      
    },
  
    unbind: function(element) {
    
      if (!this.hasElement(element)) {
        throw ('Invalid Resource: Element "' + element + '" is not defined');
      }
      
      if (this.bindings.hasOwnProperty(element)) {
       this.bindings[element].unbind();
       delete this.bindings[element];
      }
      
    },
      
    
    // ------------------------------------------------------------------------------------------------
    // Connection Management
    // ------------------------------------------------------------------------------------------------
    
    goOnline: function() {
      for (var name in this._views) { this._views[name].goOnline(); }
    },
    
    goOffline: function() {
      for (var name in this._views) { this._views[name].goOffline(); }
    }
    
    
  }).include(Events);

  
  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  ViewController.views = {
    'view': ViewController
  };
  
  ViewController.extend = function(def) {
    
    if (!def.hasOwnProperty('getType')) {
      throw ('Missing Implementation: ViewController missing "getType" implementation');
    }
    
    var control = Class.extend.call(this, def);
    var type = def.getType();
    
    if (ViewController.views.hasOwnProperty(type)) {
      throw ('Duplicate Class: ViewController "' + type + '" is already defined');
    }
    
    if (control.prototype.typeList) {
      control.prototype.typeList += ' ' + type;
    } else {
      control.prototype.typeList = type;
    }

    control.extend = ViewController.extend;
            
    return ViewController.views[type] = control;
    
  };
  
  ViewController.get = function(name) {
    if (this.views.hasOwnProperty(name)) {
      return this.views[name];
    }
    throw ('Invalid Resource: ViewController "' + name + '" not defined');
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.ViewController = ViewController;
  

}(Orange));