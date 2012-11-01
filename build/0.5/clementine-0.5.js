/**
 * Copyright (c) 2010-12 ClementineJS

 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// ------------------------------------------------------------------------------------------------
// Global Functions
// ------------------------------------------------------------------------------------------------

if (typeof (console) == "undefined") {
  console = {
    log: function() {},
    dir: function() {}
  }
}

function noop() {}

function clone(o) {
  var i, newObj = (o instanceof Array) ? [] : {};
  for (i in o) {
    if (i === 'clone') {
      continue;
    }
    if (o[i] && o[i] instanceof Date) {
      newObj[i] = new Date(o[i]);
    } else if (o[i] && typeof o[i] === "object") {
      newObj[i] = clone(o[i]);
    } else {
      newObj[i] = o[i];
    }
  }
  return newObj;
}

function proxy(fn, context) {
  var that = context;
  return function() {
    return fn.apply(that, arguments);
  };
}

jQuery.fn.childrenTo = function(selector) {
  var childList = [];
  var that = this;
  this.find(selector).each(function() {
    var include = false, parent = $(this).parent();
    while (parent.length !== 0 && !include) {
      if ($(parent).not($(that)).length === 0) {
        include = true; break;
      } else if ($(parent).not('[data-control]').length === 0) {
        include = false; break;
      } parent = $(parent).parent();
    }
    if (include) { childList.push($(this)); }
  });
  return childList;
}

jQuery.fn.outerHTML = function(s) {
  return s ? this.before(s).remove() : jQuery('<p>').append(this.eq(0).clone()).html();
};

String.prototype.trim = function() {
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

// ------------------------------------------------------------------------------------------------
// Core Module
// ------------------------------------------------------------------------------------------------

(function() {

  var Browser;
  var Class;
  var Events;
  var EventTarget;
  var EventHandle;
  var Clementine = {};
  
  var keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g;
  var modFilterRegex = /[^A-Za-z\-_]/g;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Object
  // ------------------------------------------------------------------------------------------------
  
  Class = (function() {
  
    var initializing = false;
    var fnTest = /\b_super\b/;
  
    function ObjectClass() {}
  
    ObjectClass.extend = function(def) {
  
      var prototype;
      var name;
      var _super = this.prototype;
      
      initializing = true;
      prototype = new this();
      initializing = false;
      
      for (name in def) {
        prototype[name] = typeof def[name] === "function" && typeof _super[name] === "function" && fnTest.test(def[name]) ? (function(name, fn) {
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            this._super = tmp;
            return ret;
          };
        }(name, def[name])) : def[name];
      }
      
      function Class() {
        if (!initializing && this.initialize) {
          this.initialize.apply(this, arguments);
        }
      }
  
      Class.prototype = prototype;
      Class.prototype.constructor = Class;
      
      Class.extend = ObjectClass.extend;
      Class.include = ObjectClass.include;
  
      return Class;
  
    };
  
    ObjectClass.include = function(def) {
    
      var key;
      var value;
      var ref;
      
      if (!def) {
        throw 'Missing definition';
      }
      
      for (key in def) {
        value = def[key];
        if (Array.prototype.indexOf.call(['extend', 'include'], key) < 0) {
          this.prototype[key] = value;
        }
      }
        
      return this;
      
    };
  
    return ObjectClass;
  
  }());
  
  
  // ------------------------------------------------------------------------------------------------
  // EventTarget Object
  // ------------------------------------------------------------------------------------------------
  
  EventTarget = (function() {
  
    function EventTarget(type, currentTarget, target, data) {
    
      this.bubbles         = true;
      this.currentTarget   = currentTarget;
      this.data            = data;
      this.target          = target;
      this.type            = type;
      
    }
    
    EventTarget.prototype.stopPropagation = function() {
      this.bubbles = false;
    };
    
    return EventTarget;
  
  }());
  
  
  // ------------------------------------------------------------------------------------------------
  // EventHandle Object
  // ------------------------------------------------------------------------------------------------
  
  EventHandle = (function() {
  
    function EventHandle(target, ev, call) {
    
      this.call      = call;
      this.ev        = ev;
      this.target    = target;
      
    }
    
    EventHandle.prototype.detach = function() {
    
      this.target.detach(this.ev, this.call);
      
      delete this.target;
      delete this.ev;
      delete this.call;
      
    };
    
    return EventHandle;
  
  }());
  
  
  // ------------------------------------------------------------------------------------------------
  // Events Mixin
  // ------------------------------------------------------------------------------------------------
  
  Events = {
  
    on: function(ev, call, context) {
      
      var fn = typeof context !== 'undefined' ? proxy(call, context) : call;
      
      if (!this._listeners) { this._listeners = {}; }
      if (!this._listeners.hasOwnProperty(ev)) { this._listeners[ev] = []; }
      this._listeners[ev].push(fn);
      
      return new EventHandle(this, ev, fn);
      
    },
    
    once: function(ev, call, context) {
    
      var fn = typeof context !== 'undefined' ? proxy(call, context) : call;
    
      var wrap = function() {
        call.apply(this, arguments);
        this.detach(ev, fn);
      };
      
      this.on(ev, wrap);
      
    },
    
    fire: function(ev, data) {
    
      var parent = this._parent || null;
      var evName = ev;
      
      if (typeof ev === 'string') {
        ev = new EventTarget(ev, this, this, data);
      }
      
      if (typeof ev.type !== 'string') {
        throw "Error: Invalid 'type' when firing event";
      }
      
      if (!this._listeners) { this._listeners = {}; }
      if (this._listeners[ev.type] instanceof Array) {
        var listeners = this._listeners[ev.type];
        for (var i = 0, len = listeners.length; i < len; i++) {
          listeners[i].call(this, ev, data);
        }
      }
      
      var ignore = false;
      
      if (this._ignoreEvents instanceof Array) {
        for (var i=0; i<this._ignoreEvents.length; i++) {
          if (this._ignoreEvents[i] === evName) {
            ignore = true;
          }
        }
      }
      
      if (parent != null && !ignore && ev.bubbles && evName[0] !== '_') {
        ev.currentTarget = this._parent;
        parent.fire.call(parent, ev, data);
      }
      
    },
    
    detach: function(ev, fn) {
        
      var listeners = [];
    
      if (!this._listeners) {
        this._listeners = {};
      }
      
      if (typeof ev === 'undefined') {
        this._listeners = {};
      } else if (this._listeners[ev] instanceof Array) {
        if (typeof fn !== 'undefined') {
          listeners = this._listeners[ev];
          for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] === fn) {
              listeners.splice(i, 1);
              break;
            }
          }
        } else {
          this._listeners[ev] = [];
        }
      }
      
    }
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Browser Object
  // ------------------------------------------------------------------------------------------------
  
  Browser = {
    touch: ('ontouchstart' in window) || (window.hasOwnProperty('DocumentTouch') && document instanceof DocumentTouch),
    location: 'geolocation' in navigator
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine              = this.Clementine = { modules: {} };
  Clementine.version      = '0.5.0';
  
  Clementine.Browser      = Browser = Browser;
  Clementine.Class        = this.Class = Class;
  Clementine.Events       = this.Events = Events;
  Clementine.EventHandle  = EventHandle;
    
  
}.call(this));


/** Array Extensions */

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

(function(Clementine) {

  var ViewController;
  
  
  /** Dependencies */
  
  var Browser = window.Browser || Clementine.Browser;
  var Element = Clementine.Element;
  var Queue = Clementine.Queue;
  var View = Clementine.View;


  function cloneAttributes(source, destination) {
    destination = $(destination).eq(0);
    source = $(source).get(0);
    for (var i = 0; i < source.attributes.length; i++) {
      var a = source.attributes[i];
      destination.attr(a.name, a.value);
    }
  }
  
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
  
  
  /** ViewController Definition */
  
  /**
   * @class ViewController
   */
  ViewController = Class.extend({
    
    initialize: function(parent, target, app) {
      
      // mark uninitialized
      this._initialized = false;
      
      // store parent
      this._parent = parent || null;
      
      // store target
      this._target = $(target);
      
      // legacy
      this.target = this._target;
      
      // store app
      this._app = app;
      
      // store params
      this._params = {};
      
      if (!this._target || this._target.length === 0 && typeof this.getDefaultView === 'function') {
        this._target = Clementine.View.get(this.getDefaultView());
      }
      
      // store source
      this._source = this._target.outerHTML();
      
      // prevent bubbling
      this._ignoreEvents = ['load', 'appear', 'disappear', 'unload'];
            
      // store attributes
      this._attrs = this.setupAttributes();
      
      // store children
      this._views = this.setupViews();
      this._elems = this.setupElements();
      
      // store states
      this._loaded = false;
      this._visible = false;
      this._running = false;
      
      // event queue
      this._loadEvts = [];
      this._unloadEvts = [];
      this._showEvts = [];
      this._hideEvts = [];
      
      // queue
      this._queue = [];
      this.state;
      
      // remove target if it exists
      if (typeof this._target === 'object') {
        this._target.addClass('hidden');
      }
      
      // call setup
      this.setup();
      
      // mark initialized
      this._initialized = true;
      
      //console.log('ViewController Initialized: "' + this.attr('name'));
      
    },
    
    
    /** Route Management */
    
    getDefaultRoute: function() {
      return null;
    },
    
    getDefaultView: function() {
      return null;
    },
    
    setRoute: function(states) {
      var first = false;
      if (!states || states.length === 0) {
        if (this.getDefaultRoute()) {
          states = [this.getDefaultRoute()];
        } else {
          states = [];
        }
      }
      var original = states.slice(0);
      var state = states.shift();
      var statesArray = states.slice(0);
      var current = this.state || this.getDefaultRoute();
      var callbacks = this.getRoutes();
      if (Object.keys(callbacks).length === 0) {
        for (var i in this.views) {
          this.getView(i).setRoute(original.slice(0));
        }
        return;
      }
      if (callbacks.hasOwnProperty(state)) {
        console.log('Setting State: "/' + state + (current ? ('" from "' + current) : '') + '" for "' + this.attr('name') + '"'); 
        callbacks[state].call(this, current, statesArray);
      }
      this.state = state;
    },
    
    
    /** Configuration */
    
    getType: function() {
      return 'view';
    },
    
    getBindings: function() {
      return {};
    },
        
    getRoutes: function() {
      return {};
    },
    
    setup: function() {
    
    },
    
    
    /* Model Management */
    
    setModel: function(name, model) {
      if (!this._models) {
        this._models = {};
      }
      this._models[name] = model;
    },
    
    getModel: function(name) {
      if (this._models.hasOwnProperty(name)) {
        return this._models[name];
      } else {
        throw 'Model Not Found';
      }
    },
    
    
    /** Queuing */
    
    add: function(fn, args, wait) {
      this._queue.push({fn: fn, args: args, wait: wait});
      if (!this._running) { this.next(); }
      return this;
    },

    next: function() {
      this._running = true;
      var next = this._queue.shift();
      if (next) {
        next.fn.apply(this, next.args);
        if (next.wait && next.wait > 0) {
          this._process = setTimeout(proxy(function() {
            this.next();
          }, this), next.wait);
        }
      } else {
        this._running = false;
      }
    },
    
    stop: function() {
      this._queue = [];
      if (this._process) {
        clearTimeout(this._process);
        this.next();
      }
      return this;
    },
    
    
    /* CSS Properties */

    addClass: function() {
      this._target.addClass.apply(this._target, arguments);
    },
    
    hasClass: function() {
      this._target.hasClass.apply(this._target, arguments);
    },
    
    removeClass: function() {
      this._target.removeClass.apply(this._target, arguments);
    },
    
    
    /** Chainable State Handlers */
      
    load: function() {
      return this.add(this._load);
    },
    
    show: function() {
      return this.add(this._show);
    },
    
    hide: function() {
      return this.add(this._hide);
    },
    
    unload: function() {
      return this.add(this._unload);
    },
    
    appendTo: function(target) {
      return this.add(this._appendTo, [target]);
    },
    
    append: function(target) {
      return this.add(this._append, [target]);
    },
    
    remove: function() {
      return this.add(this._remove);
    },
    
    run: function(callback, context) {
      return this.add(this._run, arguments);
    },
    
    
    /** Private State Handlers */
    
    _run: function(callback, context, wait) {
      
      if (wait) {
        
        setTimeout(proxy(function() {
          callback.call(context || this);
          this.next();
        }, this), wait);
        
      } else {
      
        callback.call(context || this);
        this.next();
      
      }
      
    },
    
    _load: function() {
            
      // return if already loading
      if (this._loaded) {
        this.next(); // fire the next call in the queue
        return;
      }
      
      this._loadEvts.push(this.on("_load", this.onLoad, this));
      this._loadEvts.push(this.on("_loaded", this.onDidLoad, this));
            
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
      
      this._showEvts.push(this.on("_appear", this.onAppear, this));
      this._showEvts.push(this.on("_appeared", this.onDidAppear, this));
      
      // call onWillAppear
      this.onWillAppear();
      
    },
    
    _hide: function() {
      
      // return if already hidden or hiding
      if (!this._visible) {
        this.next();
        return;
      }
      
      this._hideEvts.push(this.on("_disappear", this.onDisappear, this));
      this._hideEvts.push(this.on("_disappeared", this.onDidDisappear, this));
      
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
      
      this._unloadEvts.push(this.on("_unload", this.onUnload, this));
      this._unloadEvts.push(this.on("_unloaded", this.onDidUnload, this));
      
      // call onWillUnload
      this.onWillUnload();
      
    },
    
    _appendTo: function(target) {
      if (target instanceof ViewController) {
        target._target.append(this._target);
      } else {
        target.append(this._target);
      }
      this.next();
    },
    
    _append: function(target) {
      if (target instanceof ViewController) {
        this._target.append(target._target);
      } else {
        this._target.append(target);
      }
      this.next();
    },
    
    _remove: function() {
      this._target.remove();
      this.next();
    },
    
    
    /** Private State Handlers */
    
    onWillLoad: function() {

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
      
      // mark as loaded
      this._loaded = true;
      
      // unbind events
      for (var i = 0, len = this._loadEvts.length; i < len; i++) {
        this._loadEvts[i].detach();
      }
      
      this._loadEvts = [];
            
      // fire public load event
      this.fire('load');
      
      // run next item
      this.next();
    
    },
    
    onWillUnload: function() {
      
      // fire unload event
      this.fire('_unload');
    
    },
    
    onUnload: function() {
      
      var count = Object.keys(this._views).length;
      
      // unload children
      if (count === 0) {
        this.fire('_unloaded');
      } else {
        for (var name in this._views) {
          var view = this._views[name];
          view.once('unload', proxy(function() {
            count--;
            if (count === 0) {
              this.fire('_unloaded');
            }
          }, this));
          view.unload();
        }
      }
      
    },
    
    onDidUnload: function() {
    
      // mark unloaded
      this._loaded = false;
      
      // unbind events
      for (var i = 0, len = this._unloadEvts.length; i < len; i++) {
        this._unloadEvts[i].detach();
      }
      
      this._unloadEvts = [];
      
      // fire public unload event
      this.fire('unload');
      
      // call next
      this.next();
    
    },
    
    
    // display transitions
    
    onWillAppear: function() {
            
      // bind events
      var bindings = this.getBindings();
      
      // store replacements
      var replaced;
      var matches;
      
      function applyBindings(pattern, events) {
        
        // parse pattern
        var target = pattern.match(/^([#$\.A-Za-z0-9\-_]+)(?:\((.*)\))?/);
        
        var node = target[1];
        var delegate = target[2];
        var eventName;
        
        var touchclick = Browser.touch ? 'touchend' : 'click';

        // if $target
        if (node === '$target') {
          node = this._target;
        } else if (node === '$body') {
          node = $('body');
        } else if (this.hasView(node)) {
          node = this.getView(node);
        } else if (this.hasElement(node)) {
          node = this.getElement(node);
        } else {
          return;
        }

        // bind events
        for (var event in events) {
          if (event === 'touchclick') {
            eventName = touchclick;
          } else {
            eventName = event;
          }
          if (typeof events[event] === 'function') {
            if (delegate && node instanceof jQuery) {
              node.on(eventName, delegate, proxy(events[event], this));
            } else if (node instanceof ViewController) {
              node.on(eventName, events[event], this);
            } else {
              node.on(eventName, proxy(events[event], this));
            }
          }
        }        
      
      }
      
      // bind events
      for (var binding in bindings) {
        applyBindings.call(this, binding, bindings[binding]);
      }
      
      // remove hidden class
      this._target.removeClass('hidden');
      
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

      // mark as visible
      this._visible = true;
  
      // unbind events
      for (var i = 0, len = this._showEvts.length; i < len; i++) {
        this._showEvts[i].detach();
      }
      
      this._showEvts = [];
      
      // fire public appear event
      this.fire('appear');
      
      // call next
      this.next();

    },
    
    onWillDisappear: function() {
            
      // unbind events
      for (var view in this._views) { this.getView(view).detach(); }
      for (var elem in this._elems) { this.getElement(elem).off(); }
            
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
      
      // remove hidden class
      this._target.addClass('hidden');
      
      // unbind events
      for (var i = 0, len = this._hideEvts.length; i < len; i++) {
        this._hideEvts[i].detach();
      }
      
      this._hideEvts = [];
      
      // mark as hidden
      this._visible = false;
      
      // fire public disappear event
      this.fire('disappear');
            
      // call next
      this.next();
    
    },
    
    
    /** Attribute Management */
    
    attr: function() {
      var args = arguments;
      if (args.length === 1) {
        return this._attrs.hasOwnProperty(args[0]) ? this._attrs[args[0]] : false;
      } else if (args.length === 2) {
        this._attrs[args[0]] = args[1];
      }
    },
    
    find: function() {
      return this._target.find.apply(this._target, arguments);
    },
    
    
    /** Service Management */
    
    getService: function(name) {
      return this._app.getService(name);
    },
    
    /** Reference Handling */
    
    getView: function(name) {
      if (name instanceof ViewController) { return name; }
      else if (typeof this._views[name] !== 'undefined') { return this._views[name]; }
      throw new Error('Invalid Request: View "' + name + '" not found');
    },
    
    getElement: function(name) {
      if (typeof this._elems[name] !== 'undefined') { return this._elems[name]; }
      throw new Error('Invalid Request: Element "' + name + '" not found');
    },
    
    
    /** Reference Validation */
  
    hasView: function(name) {
      return typeof this._views[name] !== 'undefined';
    },
    
    hasElement: function(name) {
      return typeof this._elems[name] !== 'undefined';
    },
    
    
    /** Adhoc References */
    
    addView: function(c, control, name, template, location) {
      if (this.hasView(name)) {
        throw new Error('Invalid Request: ViewController ' + name + ' already exists');
      }
      if (!c) {
        throw 'Invalid ViewController';
      }
      var v = Clementine.View.get(template, control, name);
      this._views[name] = new c(this, v, this._app);
      if (location === 'body') {
        $('body').append(this._views[name]._target);
      } else if (location) {
        this._target.append(this._views[name]._target);
      }
    },
    
    removeView: function(name) {
      if (this.hasView(name)) {
        this._views[name].hide().unload().destroy();
        delete this._views[name];
      }
    },
    
    
    /** Parameters */
    
    setParam: function(name, value) {
      this._params[name] = value;
    },
    
    getParam: function(name) {
      return this._params[name];
    },
    
    clearParam: function(name) {
      delete this._params[name];
    },
    
    bindData: function(name, data, multi) {
      var target = (name === '$target') ? this._target : this.getElement(name);
      var children = target.childrenTo('[itemprop]');
      var prop;
      for (var i=0; i<children.length; i++) {
        prop = children[i].attr('itemprop');
        if (prop) {
          if (children[i].get(0).tagName === 'IMG') {
            if (data.hasOwnProperty(prop)) {
              children[i].attr('src', data[prop]);
            }
          } else if (children[i].get(0).tagName === 'SELECT' || children[i].get(0).tagName === 'INPUT') {
            if (data.hasOwnProperty(prop)) {
              children[i].val('');
            }
          } else {
            if (data.hasOwnProperty(prop) && data[prop]) { children[i].text(data[prop]);
            } else if (!multi) { children[i].text(''); }
          }
        }
      }
    },
    
    
    /** Connection Management */
  
    goOnline: function() {
      for (var name in this._views) { this._views[name].goOnline(); }
    },
    
    goOffline: function() {
      for (var name in this._views) { this._views[name].goOffline(); }
    },
    
    
    /** Utilities */
    
    setupAttributes: function() {
          
      if (this._initialized) { return; }
      
      var attrs = stripAttributes(this._target, /data-/);
            
      if (!attrs.hasOwnProperty('name')) {
        attrs.name = attrs.control;
      }

      this._target.addClass('view');
      if (typeof this.typeList !== 'undefined') {
        this._target.addClass(this.typeList);
      }
            
      this._target.addClass(attrs.name);
      
      return attrs;
      
    },
    
    setupViews: function() {
      
      if (this._initialized) { return; }
      
      var children = this._target.childrenTo('[data-control]');
      var views = {}, name, type, source, path, c;
      
      for (var i = 0; i < children.length; i++) {
      
        type = children[i].attr('data-control');
        name = children[i].attr('data-name');
        path = children[i].attr('data-template');
                    
        if (path && path.length > 0) {
          source = Clementine.View.get(path, type, name);
          children[i].html(source.html());
          cloneAttributes(source, children[i]);
          children[i].removeAttr('data-template');
        }
        
        name = name || type;
        
        c = ViewController.get(type);
        views[name] = new c(this, children[i], this._app);
        
      }
      
      return views;
      
    },
    
    setupElements: function() {
      
      if (this._initialized) { return; }
      
      var children = this._target.childrenTo('[data-name]:not([data-control])');
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
    
    toString: function() {
      return '[' + this.getType() + ' ' + this.attr('name') + ']';
    },
    
    destroy: function() {
            
      // destroy views
      for (var view in this._views) { this._views[view].destroy(); delete this._views[view]; }
      for (var elem in this._elems) { this._elems[elem].destroy(); delete this._elems[elem]; }
          
      // clear references
      delete this._views;
      delete this._elems;
      delete this._target;
      delete this._parent;
      delete this._source;
      delete this._queue;
      
    },
  
  }).include(Events);
  
  
  /** Class Methods */
    
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
  
  
  // Exports
  
  Clementine.ViewController = ViewController;
  

}(Clementine));


// ------------------------------------------------------------------------------------------------
// View Object
// ------------------------------------------------------------------------------------------------

(function(Clementine) {
  
  var View = (function() {
    
    var View = {};
    
    var templates = {};
    
    View.get = function(path, control, name) {
    
      var that = this;
      var views = [];
      var output;
      
      if (!path || !templates.hasOwnProperty(path)) {
        throw 'Path ' + path + ' has not been loaded';
      }
      
      $('<div>' + templates[path] + '</div>').children().each(function() {
        views.push($(this));
      });
      
      for (var i=0; i<views.length; i++) {
        if (typeof control !== 'undefined' && views[i].attr('data-control') !== control) { continue; }
        if (typeof name !== 'undefined' && views[i].attr('data-name') !== name) { continue; }
        return views[i].clone();
      }
      throw 'Could not find view ' + control + ' at ' + path;
      
    };
  
    function fetch(path, success, sync) {
    
      return $.ajax({
        async: sync !== true,
        contentType: "text/html; charset=utf-8",
        dataType: "text",
        timeout: 10000,
        url: 'templates/' + path,
        success: function(html) {
          success(path, html);
        },
        error: function() {
          throw "Error: template not found";
        }
      }).responseText;
      
    }
    
    View.register = function(paths, callback) {
      
      var path;
      var count = paths.length;
      
      if (count === 0) {
  		return callback();
      }
      
      function onFetch(path, html) {
        templates[path] = html; count--;
        if (count === 0) { callback(); }
      }
      
      for (var i=0; i<paths.length; i++) {
        path = paths[i];
        fetch(paths[i], proxy(onFetch, this));
      }
      
    };
    
    return View;
  
  }());

  Clementine.View = View;

}(Clementine));


// ------------------------------------------------------------------------------------------------
// Service Class
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var Service = Class.extend({
    
    initialize: function(path) {
      this.path = path;
    },
    
    getType: function() {
      return 'service';
    },
    
    getPrefix: function() {
      return '';
    },
    
    _getPrefix: function() {
      if (!this.path) {
        throw { type: 'Configuration Error', message: 'Missing base url' };
      }
      return (this.path || '') + this.getPrefix();
    },
    
    request: function(path, method, params, map, success, failure, context) {
      if (!success || !failure) {
        throw { type: 'Invalid Request', message: 'Missing callback function' };
      }    
      map = map || function(data) { return data; };
      context = context || this;
      $.ajax({
        url: this._getPrefix() + path,
        type: method,
        timeout: 60000,
        data: params,
        success: function(data) {
          if (data === null || data === 'null' || data === false || data === 'false') {
            failure.call(context);
            return;
          }
          try {
            data = JSON.parse(data);
          } catch(e) {
            failure.call(context);
            return;
          }
          var clean;
          try {
            clean = map.call(context, data);
          } catch(ex) {
            failure.call(context, ex);
            throw ex;
            return;
          }
          success.call(context, clean);
        },
        error: function() {
          failure.call(context, true);
        }
      });
    },  
    
    modelOrId: function(model) {
      if (model && typeof model === 'object' && model.hasOwnProperty('id')) {
        model = model.id;
      }
      if (!model) {
        return;
      } else {
        return model;
      }
    },
    
    destroy: function() {
        delete this.eventTarget
    }
    
  }).include(Clementine.Events);
  
  Service.services = {
      'service': Service
  };
  
  Service.extend = function(e) {
      var b = Class.extend.call(this, e),
          d = e.getType();
      var f = ["getType"];
      for (var c = 0, a = f.length; c < a; c++) {
          if (!e.hasOwnProperty(f[c])) {
              throw "Class missing '" + f[c] + "()' implementation";
          }
          b[f[c]] = e[f[c]];
      }
      b.extend = arguments.callee;
      return Service.services[d] = b;
  };
  
  Service.get = function(a) {
      if (a === "service") {
          return this;
      }
      if (!this.services.hasOwnProperty(a)) {
          throw "Service '" + a + '" not found';
      }
      return this.services[a];
  };
  
  Clementine.Service = Service;

}(Clementine));


// ------------------------------------------------------------------------------------------------
// Loader Class
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var Loader = (function() {
  
    var modules = {};
    var active = {};
    var exports = {};
    Clementine.modules = {};
    
    return {
    
      addModule: function(name, fn, req) {
        if (!name.match(/[\^\-A-Za-z_]/g)) { throw 'Invalid module name'; }
        var mod = {
          name: name,
          fn: fn,
          req: (req !== undefined) ? req : []
        };
        modules[name] = mod;
      },
      
      loadModule: function(name) {        
        if (active.hasOwnProperty(name)) {
          return;
        }
        if (modules[name] !== undefined) {
          active[name] = true;
          for (var i = 0, len = modules[name].req.length; i < len; i++) {
            if (modules[name].req[i] === name) { continue; }
            this.loadModule(modules[name].req[i]);
          }
          modules[name].fn.call(window, exports);
          Clementine.modules[name] = exports;
        }
      }
      
    };
    
  }());
  
  Clementine.add = function() {
    var args = arguments,
      name = args[0],
      fn = ( typeof args[1] === 'function' ) ? args[1] : null,
      req = args[2];
    Clementine.Loader.addModule(name, fn, req);
  }
  
  Clementine.use = function() {
    var args = Array.prototype.slice.call(arguments),
      fn = args[args.length-1],
      req = clone(args).splice(0, args.length-1);
    if (typeof req[0] !== 'function') {
      for (var i = 0, len = req.length; i < len; i++) {
        Clementine.Loader.loadModule(req[i]);
      }
    }
    fn.call(window, Clementine);
  }
  
  function include(name) {
    if (typeof Clementine.modules[name] !== undefined) {
      return Clementine.modules[name];
    } else {
      throw 'Could not require module';
    }
  }
  
  window.include = include;
  
  Clementine.Loader = Loader;

}(Clementine));


// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var Application = Class.extend({
  
    initialize: function(config) {
  
      // store properties
      if (!config.hasOwnProperty('name') || (new RegExp(/[^A-Za-z:0-9_\[\]]/g)).test(config.name)) {
        throw 'Invalid Application Name';
      }
      
      // store configs
      this.config = config;
      
      // store states
      this.ready = false;
      this.loaded = false;
      
      // store name
      this.config.name = config.name;
      
      // store properties
      this.config.required = config.hasOwnProperty('required') ? config.required : [];
      this.config.services = config.hasOwnProperty('services') ? config.services : [];
      this.config.views    = config.hasOwnProperty('views')    ? config.views    : [];
      this.config.paths    = config.hasOwnProperty('paths')    ? config.paths    : {};
      this.config.auth     = config.hasOwnProperty('auth')     ? config.auth     : null;
      
      // set environment
      this.env = config.env || 'DEV';
      
      // load required modules
      for (var i=0; i<this.config.required.length; i++) {
        Clementine.Loader.loadModule(this.config.required[i]);
      }
      
      // setup services
      this.services = {};
      
      // load auth service
      if (this.config.auth) {
        this.authenticate();
      } else {
        this.loadServices();
      }
      
      // store ready listener
      $(document).ready(proxy(this.onReady, this));
      
    },
    
    getPath: function() {
      return this.config.paths[this.env];
    },
    
    authenticate: function() {
      
      // build auth service
      var AuthService = Clementine.Service.get(this.config.auth);
      
      // check for path
      if (!this.config.paths.hasOwnProperty(this.env)) {
        throw 'Invalid Service Path: Missing path for environment';
      }
      
      // get path for environment
      var path = this.config.paths[this.env];
      
      // instantiate service
      this.services[this.config.auth] = new AuthService(path);
      
      // bind to token event
      this.services[this.config.auth].on('token', this.onToken, this);
      
      // get token
      var token = this.services[this.config.auth].getToken();
      
      // check for token
      if (token) {
        
        // load services
        console.log('Token acquired: ' + token);
        
        this.loadServices(token);
        
      } else {
        
        // load services
        console.log('Warning: Token not found: Services unauthenticated'); // TEMP
        
        this.loadServices();
        
      }
  
    },
    
    loadViews: function() {
    
      // store views
      var views = this.config.views;
      
      // check for views
      if (views.length === 0) {
        this.onLoad();
        return;
      }
      
      // register views
      Clementine.View.register(views, proxy(function() {
        this.onLoad();
      }, this));
    
    },
    
    loadServices: function(token) {
      
      // store auth key
      var auth = this.config.auth;
      var services = this.config.services;
      
      // continue if no services
      if (services.length === 0) {
        this.loadViews();
        return;
      }
      
      // check for path
      if (!this.config.paths.hasOwnProperty(this.env)) {
        throw 'Invalid Service Path: Missing path for environment';
      }
      
      // get path for environment
      var path = this.config.paths[this.env];
      
      // store loop vars
      var svc, service;
      
      // load services
      for (var i=0; i<services.length; i++) {
        
        // ignore auth service
        if (auth && services[i] === auth) {
          continue;
        }
        
        // fetch class
        svc = Clementine.Service.get(services[i]);
        
        // initialize service
        service = new svc(path);
        
        // check for token
        if (token && typeof service.getTokenService === 'function') {      
          service.setToken(token);
        }
        
        // store service
        this.services[services[i]] = service;
        
        // TEMP
        console.log('Service Loaded: \'' + service.getType() + '\'');
        
      }
      
      // load views
      this.loadViews();
    
    },
    
    onToken: function(e) {
      
      // store auth
      var auth = this.config.auth;
      
      // validate token
      if (!e.data) {
        return; 
      }
      
      // get token
      var token = e.data;
      
      // set token
      for (var service in this.services) {
        if (service === auth) {
          continue;
        }
        this.services[service].setToken(token);
      }
      
      // load services
      console.log('Token acquired: ' + token);
      
    },
    
    onReady: function() {
    
      // mark as ready
      this.ready = true;
      
      // launch if loaded
      if (this.loaded) {
        this.launch();
      }
        
    },
    
    onLoad: function() {
    
      // mark as loaded
      this.loaded = true;
      
      // launch if ready
      if (this.ready) {
        this.launch();
      }
    
    },
    
    launch: function() {
      
      // lookup root
       var root = $("[data-root]");
       var control = root.attr("data-control");
       var name = root.attr("data-name") || control;
   
       // check for root
       if (!control || !name) {
         throw 'Syntax Error: Root view not found';
       }
       
       // remove root attr
       root.removeAttr('data-root');
       
       // fetch controller
       var RootController = Clementine.ViewController.get(control);
       
       // instantiate controller
       var root = new RootController(null, root, this);
       
       // store reference
       this.root = root;
       
       // bind hash change
       $(window).bind('hashchange', proxy(this.onHashChange, this)); 
       
       // load the controller
       root.on('load', function() {
       
         // trigger first hash change
         $(window).trigger('hashchange');
         
         // show tree
         root.show();
         
       });
       
       // load root
       root.load();
  
       // TEMP
       console.log('Launching App: ' + this.config.name);
      
    },
    
    onHashChange: function() {
      var hash = location.hash;
      if (!hash) {
        this.root.setRoute();
      } else {
        this.root.setRoute(hash.replace('#', '').split('/'));
      }
    },
    
    getService: function(name) {
      return this.services[name];
    }
  
  });
  
  Clementine.config = function(config) {
    $(document).ready(function() {
      if (config) {
        window.Application = new Clementine.Application(config);
      }
    });
  }
  
  Clementine.Application = Application;

}(Clementine));