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
  
  function cloneAttributes(source, destination) {
    destination = $(destination).eq(0);
    source = $(source)[0];
    for (var i = 0; i < source.attributes.length; i++) {
      var a = source.attributes[i];
      destination.attr(a.name, a.value);
    }
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  ViewController = Class.extend({
      
    // constructors
    
    initialize: function(parent, target, app) {
      
      // set vars
      var that = this, views = [], forms = [], elements = [];
      
      // store application
      this.app = app;
      
      // states
      this.views = {};
      this.forms = {};
      this.elements = {};
      this.data = {};
      this.source = target.clone();
      this.state = '';
      
      // set load statuses
      this.loading = false;
      this.unloading = false;
      this.loaded = false;
      
      // setup display statuses
      this.visible = false;
      this.appearing = false;
      this.disappearing = false;
      
      // create arrays
      this.loadEvts = [];
      this.unloadEvts = [];
      this.showEvts = [];
      this.hideEvts = [];
      
      // event queue
      this.queue = [];
      this.running = false;
      
      // bindings
      this.bindings = {};
      
      
      // validate target
      var _target;
      if (typeof target !== 'undefined') {
        this.target = $(target);
        _target = $(target).get(0);
      } else {
        throw 'Invalid target';
      }
      
      // check if parent
      this._parent = (typeof parent !== 'undefined') ? parent : null;
      if (this._parent === null) { this.target.removeAttr('data-root'); }
      
      // validate arguments
      for (var i = 0, len = _target.attributes.length; i < len; i++) {
        if (_target.attributes[i].name.match(/data-/)) {
          this.data[_target.attributes[i].name.replace(/data-/, '')] = _target.attributes[i].value;
        }
      }
      
      // copy name
      if (!this.data.hasOwnProperty('name')) { this.data.name = this.data.control; }
      
      // finds immediate descendant children
      var childFunc = function(selector) {
        var childList = [];
        this.target.find(selector).each(function() {
          var include = false, parent = $(this).parent();
          while (parent.length !== 0 && !include) {
            if ($(parent).not($(that.target)).length === 0) {
              include = true; break;
            } else if ($(parent).not('[data-control]').length === 0) {
              include = false; break;
            } parent = $(parent).parent();
          }
          if (include) { childList.push(this); }
        });
        return childList;
      };
      
      // populate child views
      views = childFunc.call(this, '[data-control]');
      forms = childFunc.call(this, 'form');
      elements = childFunc.call(this, '[data-name]:not([data-control])');
      
      // DEBUG
      console.log(this.data.name + ' ' + "Initialized");
      
      // process views
      for (i = 0, len = views.length; i < len; i++) {
        var view = $(views[i]), name = view.attr('data-name'),
            type = view.attr('data-control'), path = view.attr('data-template'),
            isRemote = (typeof path !== 'undefined' && path.length > 0);
        
        if (!name) { name = view.attr('data-control'); }
        if (isRemote) {
          var source = View.get(path, type, name);
          view.html($(source).html());
          cloneAttributes(source, view);
          view.removeAttr('data-template');
        }
        
        var c = ViewController.get(type);
        this.views[name] = new c(this, view, app);
      }
      
      // process forms
      for (i = 0, len = forms.length; i < len; i++) {
        var form = $(forms[i]), formName = form.attr('name'), child = new Form(form);
        this.forms[formName] = child;
      }
      
      // process elements
      for (i = 0, len = elements.length; i < len; i++) {
        var el = $(elements[i]), elName = el.attr('data-name');
        if (typeof elName !== 'undefined' && elName.length > 0) {
          this.elements[elName] = el.removeAttr('data-name').addClass(elName);
        }
      }
      
      // store for debugging
      this.type = this.getType();
      this.data.name = this.data.name || this.data.control;
      if (this.data.state) { this.state = this.data.state; }
      
      // process types
      this.target.addClass(this.getClasses());
      this.target.removeAttr('data-control').removeAttr('data-name').removeAttr('data-state');

    },
    
    
    // queue handling
    
    add: function(fn, args, wait) {
      this.queue.push({fn: fn, args: args, wait: wait});
      if (!this.running) { this.next(); }
    },
    
    next: function() {
      this.running = true;
      var next = this.queue.shift();
      if (next) {
        next.fn.apply(this, next.args);
        if (next.fn === this._setState) {
          setTimeout(proxy(function() {
            this.next();
          }, this), next.wait);
        }
      } else {
        this.running = false;
      }
    },
    
    
    // configuration
    
    getType: function() {
      return 'view';
    },

    getClasses: function() {
      var classes = typeof this.typeList !== 'undefined' ? this.typeList : '';
      return classes + ' ' + this.data.name ? this.data.name : '';
    },

    getBindings: function() {
      return {};
    },
  
    getRoutes: function() {
      return {};
    },
    
    
    // route management
    
    setRoute: function(url, last) {
      var routes = this.getRoutes(), hash = url.clone(), route = hash.shift();
      if (routes.hasOwnProperty(route)) {
        var views = routes[route];
        for (var view in views) {
          var sequence = views[view];
          if (last) { sequence = [sequence.pop()]; }
          for (var i=0; i<sequence.length; i++) {
            var state = sequence[i];
            if (typeof state === 'object') {
              var name = Object.keys(state).pop();
              this.getView(view).setState(name, state[name]);
            } else if (typeof state === 'string') {
              this.getView(view).setState(state);
            }
          }
          if (hash.length > 0) { this.getView(view).setRoute(hash, last); }
        }
      }
    },
    
    
    // state management
    
    getState: function() {
      return this.state;
    },
    
    setState: function(state, wait) {
      this.add(this._setState, [state], wait || 0);
      return this;
    },
    
    _setState: function(state, force) {
      if ((this.hasState(state) || !this.loaded) && !force) { return; }
      if (state) { console.log(this.data.name + ' state is ' + state); }
      this.target.removeClass(this.state);
      this.target.addClass(state);
      this.state = state;
    },
  
    hasState: function(state) {
      return this.state === state;
    },
    
    
    // state handlers
    
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
    
    remove: function() {
      this.add(this._remove);
      return this;
    },
    
    _load: function() {
      
      // return if already loading
      if (this.loading || this.loaded) {
        this.next(); // fire the next call in the queue
        return;
      }
      
      // set statuses
      this.loading = true;
      
      // set default state if it exists
      this._setState(this.state, true);
      
      // bind event handlers
      this.loadEvts.push(this.on('_load', this.onLoad, this));
      this.loadEvts.push(this.on('_loaded', this.onDidLoad, this));
      
      // call onWillLoad
      this.onWillLoad();
      
    },
    
    _show: function() {
      
      // return if already visible or appearing
      if (this.visible || this.appearing || !this.loaded) {
        this.next();
        return;
      }
      
      // set statuses
      this.appearing = true;
      
      // bind event handlers
      this.showEvts.push(this.on('_appear', this.onAppear, this));
      this.showEvts.push(this.on('_appeared', this.onDidAppear, this));
      
      // call onWillAppear
      this.onWillAppear();
      
    },
    
    _hide: function() {
      
      // return if already hidden or hiding
      if (!this.visible || this.disappearing) {
        this.next();
        return;
      }
      
      // set statuses
      this.disappearing = true;
      
      this.hideEvts.push(this.on('_disappear', this.onDisappear, this));
      this.hideEvts.push(this.on('_disappeared', this.onDidDisappear, this));
      
      // call onWillDisappear
      this.onWillDisappear();
      
    },
    
    _unload: function() {
      
      // return if already unloading
      if (this.unloading || !this.loaded) {
        this.next();
        return;
      }
      
      // hide first if visible
      if (this.visible && !this.disappearing) {
        this.hide().unload();
        return;
      }
      
      // bind event handlers
      this.unloadEvts.push(this.on('_unload', this.onUnload, this));
      this.unloadEvts.push(this.on('_unloaded', this.onDidUnload, this));
      
      // set statuses
      this.unloading = true;
      
      // call onWillUnload
      this.onWillUnload();
      
    },
    
    _remove: function() {
    
    },
    
    // state transitions
    
    onWillLoad: function() {
      
      // DEBUG
      console.log(this.data.name + ' ' + "Will Load");
      
      // fire load event
      this.fire('_load');
      
    },
    
    onLoad: function() {
      
      var count = Object.keys(this.views).length;
      
      // load children
      if (count === 0) {
        this.fire('_loaded');
      } else {
        for (var name in this.views) {
          var view = this.views[name];
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
    
      // unbind all event handlers
      for (var i = 0, len = this.loadEvts.length; i < len; i++) {
        this.loadEvts[i].detach();
      }
      
      // DEBUG
      console.log(this.data.name + ' ' + "Did Load");
      
      // allow unloading
      this.loadEvts = [];
      this.loading = false;
      this.loaded = true;
      
      // fire public load event
      this.fire('load');
      
      // run next item
      this.next();
    
    },
    
    onWillUnload: function() {
    
      // run functions
      console.log(this.data.name + ' ' + "Will Unload");
      
      // ex. clear data
      
      // fire unload event
      this.fire('_unload');
    
    },
    
    onUnload: function() {
      
      var count = Object.keys(this.views).length;
      
      // unload children
      if (count === 0) {
        this.target.remove();
        this.fire('_unloaded');
      } else {
        for (var name in this.views) {
          var view = this.views[name];
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
      console.log(this.data.name + ' ' + "Did Unload");
      
      // unbind all event handlers
      for (var i = 0, len = this.unloadEvts.length; i < len; i++) {
        this.unloadEvts[i].detach();
      }
      
      // allow loading
      this.unloadEvts = [];
      this.unloading = false;
      this.loaded = false;
      
      // fire public unload event
      this.fire('unload');
      
      // call next
      this.next();
    
    },
    
    
    // display transitions
    
    onWillAppear: function() {
            
      // run functions
      console.log(this.data.name + ' ' + "Will Appear");
      
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
            this.target.on(event, $.proxy(func, this));
          } else if (func !== null && this.views.hasOwnProperty(view)) {
            this.getView(view).on(event, $.proxy(func, this));
          } else if (func !== null && this.forms.hasOwnProperty(view)) {
            this.getForm(view).on(event, $.proxy(func, this));
          } else if (func !== null && this.elements.hasOwnProperty(view)) {
            this.getElement(view).on(event, $.proxy(func, this));
          }
        }
      }
      
      // fire appear event
      this.fire('_appear');
      
    },
    
    onAppear: function(e) {
                  
      var count = Object.keys(this.views).length;
      
      // show children
      if (count === 0) {
        this.fire('_appeared');
      } else {
        for (var name in this.views) {
          var view = this.views[name];
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
      console.log(this.data.name + ' ' + "Did Appear");
      
      // unbind all event handlers
      for (var i = 0, len = this.showEvts.length; i < len; i++) {
        this.showEvts[i].detach();
      }
      
      // allow hiding
      this.showEvts = [];
      this.appearing = false;
      this.visible = true;
      
      // fire public appear event
      this.fire('appear');
      
      // call next
      this.next();

    },
    
    onWillDisappear: function() {
      
      // run functions
      console.log(this.data.name + ' ' + "Will Disappear");
      
      // unbind events
      for (var view in this.views) { this.getView(view).detach(); }
      for (var form in this.forms) { this.getForm(form).detach(); }
      for (var el in this.elements) { this.getElement(el).unbind(); }
      
      // fire disappear event
      this.fire('_disappear');
      
    },
    
    onDisappear: function(e) {
            
      var count = Object.keys(this.views).length;
      
      // hide children
      if (count === 0) {
        this.fire('_disappeared');
      } else {
        for (var name in this.views) {
          var view = this.views[name];
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
      console.log(this.data.name + ' ' + "Did Disappear");
      
      // unbind all event handlers
      for (var i = 0, len = this.hideEvts.length; i < len; i++) {
        this.hideEvts[i].detach();
      }
      
      // allow showing
      this.hideEvts = [];
      this.disappearing = false;
      this.visible = false;
      
      // fire public disappear event
      this.fire('disappear');
      
      // call next
      this.next();
    
    },
    
    
    // reference handling
    
    getViews: function() {
      return this.views;
    },
    
    getView: function(name) {
      if (name instanceof ViewController) { return name; }
      else if (typeof this.views[name] !== 'undefined') { return this.views[name]; }
      throw 'Error: View "' + name + '" not found';
    },
    
    getForm: function(name) {
      if (this.forms[name] instanceof Form) { return this.forms[name]; }
      throw 'Error: Form "' + name + '" not found';
    },
  
    getElement: function(name) {
      if (typeof this.elements[name] !== 'undefined') { return this.elements[name]; }
      throw 'Error: Element "' + name + '" not found';
    },
    
    
    // reference merging
    
    addView: function(control, name, template) {
      var c = ViewController.get(control);
      var v = View.get(template, control, name);
      if (c) {
        this.views[name] = new c(this, v, this.app);
      }
      return this.views[name];
    },
    
    removeView: function(name) {
      if (this.hasView(name)) {
        this.views[name].hide().unload().destroy();
        delete this.views[name];
      }
    },
    
    
    // reference validation
    
    hasView: function(name) {
      return typeof this.views[name] !== 'undefined';
    },
    
    hasForm: function(name) {
      return typeof this.forms[name] !== 'undefined';
    },
    
    hasElement: function(name) {
      return typeof this.elements[name] !== 'undefined';
    },
    
    
    // data bindings
    
    bind: function(element, data) {
      if (!this.hasElement(element)) { return; }
      if (this.bindings.hasOwnProperty(element)) {
       this.bindings[element].unbind();
       delete this.bindings[element];
      }
      this.bindings[element] = new Binding(this.getElement(element));
      this.bindings[element].bind(data);
    },
  
    unbind: function(element) {
      if (!this.hasElement(element)) { return; }
      if (this.bindings.hasOwnProperty(element)) {
       this.bindings[element].unbind();
       delete this.bindings[element];
      }
    },
    
    
    // connection management
    
    goOnline: function() {
      for (var name in this.views) { this.views[name].goOnline(); }
    },
    
    goOffline: function() {
      for (var name in this.views) { this.views[name].goOffline(); }
    },
    
    
    // common methods and destructors
    
    toString: function() {
      return '[' + this.getType() + ' ' + this.data.name + ']';
    },
    
    destroy: function() {
            
      // destroy views
      for (var view in this.views) { this.views[view].destroy(); delete this.views[view]; }
      for (var form in this.forms) { this.forms[form].destroy(); delete this.forms[form]; }
      for (var element in this.elements) { delete this.elements[element]; }
          
      // clear references
      delete this.target;
      delete this._parent;
      
    }
  
  }).include(Events);
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  ViewController.views = { 'view': ViewController };
  
  ViewController.prototype.typeList = '';
  
  ViewController.extend = function(def) {
  
    var m = Class.extend.call(this, def),
        type = def.getType();
  
    var required = ['getType'];
    for (var i = 0, len = required.length; i < len; i++) {
      if (!def.hasOwnProperty(required[i])) { throw "Class missing '" + required[i] + "()' implementation"; }
      m[required[i]] = def[required[i]];
    }
    m.prototype.typeList += ((m.prototype.typeList === '') ? '' : ' ') + type;
    m.extend = ViewController.extend;
    
    return ViewController.views[type] = m;
  
  };
  
  ViewController.get = function(name) {
    if (name === 'view') { return this; }
    if (!this.views.hasOwnProperty(name)) { throw "View '" + name + '" not found'; }
    return this.views[name];
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.ViewController = ViewController;
  

}(Orange));