/**
 * ClementineJS | 0.3.1 | 09.27.2012
 * https://github.com/brew20k/clementine
 * Copyright (c) 2012 Kevin Kinnebrew
 */

// ------------------------------------------------------------------------------------------------
// Global Functions
// ------------------------------------------------------------------------------------------------

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

jQuery.fn.outerHTML = function(s) {
  return s ? this.before(s).remove() : jQuery('<p>').append(this.eq(0).clone()).html();
};


// ------------------------------------------------------------------------------------------------
// Core Module
// ------------------------------------------------------------------------------------------------

(function() {
  
  var Browser;
  var Class;
  var Deferred;
  var Events;
  var EventTarget;
  var EventHandle;
  var Loader;
  var Clementine = {};
  
  var keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g;
  var modFilterRegex = /[^A-Za-z\-_]/g;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Object
  // ------------------------------------------------------------------------------------------------
  
  Class = (function() {
  
    var initializing = false;
    var fnTest = /\b_super\b/;
  
    function Class() {}
  
    Class.extend = function(def) {
  
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
      
      function c() {
        if (!initializing && this.initialize) {
          this.initialize.apply(this, arguments);
        }
      }
  
      c.prototype = prototype;
      c.prototype.constructor = c;
      
      c.extend = Class.extend;
      c.include = Class.include;
  
      return c;
  
    };
  
    Class.include = function(def) {
    
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
  
    return Class;
  
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
    
      var parent = this.parent || null;
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
      
      if (parent != null && ev.bubbles && evName[0] !== '_') {
        ev.currentTarget = this.parent;
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
  // Loader Object
  // ------------------------------------------------------------------------------------------------

  Loader = (function() {
    
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
  
  
  // ------------------------------------------------------------------------------------------------
  // Deferred Object
  // ------------------------------------------------------------------------------------------------
  
  Deferred = (function() {
  
    function Deferred(context) {
      this.context = context;
      this.resolved = false;
      this.bindings = [];
    }
    
    Deferred.prototype.resolve = function() {
      this.resolved = true;
      for (var i=0; i<this.bindings.length; i++) {
        this.bindings[i].fn.apply(this.context, this.bindings[i].args);
      }
      this.bindings = [];
    };
    
    Deferred.prototype.then = function(fn, args) {
      if (this.resolved) {
        fn.apply(this.context, args || []);
      } else {
        this.bindings.push({ fn: fn, args: args || [] });
      }
    };
  
    return Deferred;
  
  }());
  
  function when() {
  
    var deferred = new Deferred(this);
    var count = arguments.length;
      
    function resolve() {
      if (--count === 0) {
        deferred.resolve();
      }
    }
    
    for (var i=0; i<arguments.length; i++) {
      arguments[i].then(resolve);
    }
    
    return deferred;
  
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Browser Object
  // ------------------------------------------------------------------------------------------------
  
  Browser = {
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    location: 'geolocation' in navigator
  };
  
    
  // ------------------------------------------------------------------------------------------------
  // Module Functions
  // ------------------------------------------------------------------------------------------------
  
  function add() {
    var args = arguments,
      name = args[0],
      fn = ( typeof args[1] === 'function' ) ? args[1] : null,
      req = args[2];
    Clementine.Loader.addModule(name, fn, req);
  }
  
  function use() {
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
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine            = this.Clementine = {};
  Clementine.version    = '0.5.0';
  
  Clementine.add        = add;
  Clementine.use        = use;
  Clementine.include      = this.include = include;
  Clementine.when         = when;
  
  Clementine.Browser    = Browser = Browser;
  Clementine.Class      = this.Class = Class;
  Clementine.Deferred       = Deferred;
  Clementine.Events     = this.Events = Events;
  Clementine.Loader     = Loader;
    
  
}.call(this));


// ------------------------------------------------------------------------------------------------
// Array Extensions
// ------------------------------------------------------------------------------------------------

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
// ------------------------------------------------------------------------------------------------
// ViewController Class
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var ViewController;
  

  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Binding  = Clementine.Binding;
  var Browser  = Clementine.Browser;
  var View     = Clementine.View;


  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  ViewController = Class.extend({
    initialize: function (q, l) {
        var j = this,
            r = [],
            d = [];
        this.loading = false;
        this.unloading = false;
        this.loaded = false;
        this.visible = false;
        this.appearing = false;
        this.disappearing = false;
        this.changing = false;
        this.loadEvts = [];
        this.unloadEvts = [];
        this.showEvts = [];
        this.hideEvts = [];
        this.views = {};
        this.elements = {};
        this.events = [];
        this.data = {};
        this.params = {};
        this.source = l.clone();
        if (typeof l !== "undefined") {
            this.target = $(l);
            var f = $(l).get(0)
        } else {
            this.target = View.get(this.getDefaultView());
            if(this.target === null) {
              throw "Invalid target"
            }
        }
        this.parent = (typeof q !== "undefined") ? q : null;
        if (this.parent === null) {
            this.target.removeAttr("data-root")
        }
        for (var h = 0, k = f.attributes.length; h < k; h++) {
            if (f.attributes[h].name.match(/data-/)) {
                this.data[f.attributes[h].name.replace(/data-/, "")] = f.attributes[h].value
            }
        }
        var b = function (c) {
            var t = [];
            this.target.find(c).each(function () {
                var u = false,
                    v = $(this).parent();
                while (v.length !== 0 && !u) {
                    if ($(v).not($(j.target)).length === 0) {
                        u = true;
                        break
                    } else {
                        if ($(v).not("[data-control]").length === 0) {
                            u = false;
                            break
                        }
                    }
                    v = $(v).parent()
                }
                if (u) {
                    t.push(this)
                }
            });
            return t
        };
        r = b.call(this, "[data-control]");
        d = b.call(this, "[data-name]:not([data-control])");
        if (!this.data.name) this.data.name = this.data.control;
        console.log(this.data.name + " Initialized");
        for (var h = 0, k = r.length; h < k; h++) {
            var p = $(r[h]),
                e = p.attr("data-name"),
                n = p.attr("data-control"),
                s = p.attr("data-template"),
                o = (typeof s !== "undefined" && s.length > 0);
            if (o) {
                var a = View.get(s);
                p.html($(a).html());
                cloneAttributes(a, p);
                p.removeAttr("data-template")
            }
            var m = ViewController.get(n);
            if (!e) { e = n; }
            this.views[e] = new m(this, p)
        }
        for (var h = 0, k = d.length; h < k; h++) {
            var g = $(d[h]),
                e = g.attr("data-name");
            if (typeof e !== "undefined" && e.length > 0) {
                this.elements[e] = g.removeAttr("data-name").addClass(e)
            }
        }
        this.addClasses();
        this.target.removeAttr("data-control").removeAttr("data-name");
        this.target.addClass("hidden");
        this.type = this.getType();
        this.name = this.data.name;
        this.setup();
    },
    setup: function() {},
    getType: function () {
        return "ui-view"
    },
    getStates: function() {
      return {};
    },
    getDefaultState: function() {
      return null;
    },
    getDefaultView: function() {
      return null;
    },
    setState: function(states) {
      if (!states || states.length === 0) {
        if (this.getDefaultState()) {
          states = [this.getDefaultState()];
        } else {
          states = [];
        }
      }
      var original = states.slice(0);
      var state = states.shift();
      var statesArray = states.slice(0);
      var current = this.state || this.getDefaultState();
      var callbacks = this.getStates();
      if (Object.keys(callbacks).length === 0) {
        for (var i in this.views) {
          this.getView(i).setState(original.slice(0));
        }
        return;
      }
      if (callbacks.hasOwnProperty(state)) {
        callbacks[state].call(this, current, statesArray);
      }
      this.state = state;
    },
    addClasses: function () {
      this.target.addClass(this.target.get(0).className + ' ' + this.types + ' ' + this.data.name);
    },
    getTriggers: function () {
        return []
    },
    getBindings: function () {
        return {}
    },
    load: function () {
        if (this.loading || this.loaded) {
            return
        }
        this.loading = true;
        this.loadEvts.push(this.on("_load", this.onLoad, this));
        this.loadEvts.push(this.on("_loaded", this.onDidLoad, this));
        this.onWillLoad();
        return this
    },
    onWillLoad: function () {
        this.fire("_load")
    },
    onLoad: function () {
        for (var a in this.views) {
            this.views[a].load()
        }
        this.fire("_loaded")
    },
    onDidLoad: function () {
        for (var b = 0, a = this.loadEvts.length; b < a; b++) {
            this.loadEvts[b].detach()
        }
        this.loadEvts = [];
        this.loading = false;
        this.loaded = true;
        this.fire("load")
    },
    unload: function () {
        if (this.unloading || !this.loaded) {
            return
        }
        if (this.visible && !this.disappearing) {
            this.vEvt = this.on("disappear", function (a) {
                this.unload();
                this.vEvt.detach()
            }, this);
            this.hide();
            return
        }
        this.unloadEvts.push(this.on("_unload", this.onUnload, this));
        this.unloadEvts.push(this.on("_unloaded", this.onDidUnload, this));
        this.unloading = true;
        this.onWillUnload();
        return this
    },
    onWillUnload: function () {
        this.fire("_unload")
    },
    onUnload: function () {
        for (var a in this.views) {
            this.views[a].unload()
        }
        //this.target.remove();
        this.fire("_unloaded")
    },
    onDidUnload: function () {
        for (var b = 0, a = this.unloadEvts.length; b < a; b++) {
            this.unloadEvts[b].detach()
        }
        this.unloadEvts = [];
        this.unloading = false;
        this.loaded = false;
        this.fire("unload")
    },
    show: function () {
        if (this.visible || this.appearing) {
            return
        }
        this.appearing = true;
        this.showEvts.push(this.on("_appear", this.onAppear, this));
        this.showEvts.push(this.on("_appeared", this.onDidAppear, this));
        this.onWillAppear();
        return this
    },
    onWillAppear: function () {
        var b = this.getBindings();
        var replaced;
        var matches;
        for (var a in b) {
            var d = b[a];
            for (var f in d) {
                var e = null;
                if (typeof d[f] === "function") { e = d[f]; }
                else if (this.hasOwnProperty(d[f])) { e = this[d[f]]; }
                if (f == "touchclick") {
                    f = (Browser && Browser.touch) ? "touchend" : "click"
                }
                if (e === null) {
                    var c = f.charAt(0).toUpperCase() + f.slice(1);
                    e = (d[f] === true && typeof this["on" + c] === "function") ? this["on" + c] : null
                }
                matches = a.match(/\(.+\)/gi);
                if (a.match(/\$target/)) {
                  if (matches && matches.length > 0) {
                    this.target.on(f, matches.pop().replace(/[()]/g, ''), $.proxy(e, this));
                  } else {
                    this.target.on(f, $.proxy(e, this));
                  }
                } else if (e !== null && this.views.hasOwnProperty(a)) {
                    this.getView(a).on(f, $.proxy(e, this))
                } else if (e !== null) {
                  if (matches && matches.length > 0) {
                    replaced = a.replace(/\(.+\)/gi, '');
                    this.getElement(replaced).on(f, matches.pop().replace(/[()]/g, ''), $.proxy(e, this));
                  } else if (this.elements.hasOwnProperty(a)) {
                    this.getElement(a).on(f, $.proxy(e, this))
                  }
                }
            }
        }
        this.fire("_appear")
    },
    onAppear: function () {
        for (var a in this.views) {
            this.views[a].show()
        }
        this.target.removeClass("hidden");
        this.fire("_appeared")
    },
    onDidAppear: function () {
        for (var b = 0, a = this.showEvts.length; b < a; b++) {
            this.showEvts[b].detach()
        }
        this.showEvts = [];
        this.appearing = false;
        this.visible = true;
        this.fire("appear")
    },
    hide: function () {
        if (!this.visible || this.disappearing) {
            return
        }
        this.disappearing = true;
        this.hideEvts.push(this.on("_disappear", this.onDisappear, this));
        this.hideEvts.push(this.on("_disappeared", this.onDidDisappear, this));
        this.onWillDisappear();
        return this
    },
    onWillDisappear: function () {
        for (var a in this.views) {
            this.getView(a).detach()
        }
        for (var b in this.elements) {
            this.getElement(b).unbind()
        }
        this.fire("_disappear")
    },
    onDisappear: function () {
        this.target.addClass("hidden");
        for (var a in this.views) {
            this.views[a].hide()
        }
        this.fire("_disappeared")
    },
    onDidDisappear: function () {
        for (var b = 0, a = this.hideEvts.length; b < a; b++) {
            this.hideEvts[b].detach()
        }
        this.hideEvts = [];
        this.disappearing = false;
        this.visible = false;
        this.fire("disappear")
    },
    getView: function (a) {
        if (a instanceof ViewController) {
            return a
        } else {
            if (typeof this.views[a] !== "undefined") {
                return this.views[a]
            }
        }
        throw 'Error: View "' + a + '" not found'
    },
    getElement: function (a) {
        if (typeof this.elements[a] !== "undefined") {
            return this.elements[a]
        }
        throw 'Error: Element "' + a + '" not found'
    },
    hasView: function (a) {
        return typeof this.views[a] !== "undefined"
    },
    hasElement: function (a) {
        return typeof this.elements[a] !== "undefined"
    },
    setView: function (b, a) {
        console.log(this);
        if (this.views.hasOwnProperty(b)) {
            throw "View already exists"
        }
        this.views[b] = a
    },
    clearView: function (a) {
        if (this.views.hasOwnProperty(a)) {
            this.views[a].destroy();
            delete this.views[a]
        }
    },
    bindData: function(name, data, multi) {
      var target = (name === '$target') ? this.target : this.getElement(name);
      var children = firstChildren(target, '[itemprop]');
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
              children[i].val(data[prop]);
            }
          } else {
            if (data.hasOwnProperty(prop)) { children[i].text(data[prop]);
            } else if (!multi) { children[i].text(''); }
          }
        }
      }
    },
    setParam: function(name, value) {
      this.params[name] = value;
    },
    getParam: function(name) {
      return this.params[name];
    },
    clearParam: function(name) {
      delete this.params[name];
    },
    toString: function () {
        return "[" + this.getType() + " " + this.data.name + "]"
    },
    find: function (a) {
        return $(this.target).find(a)
    },
    destroy: function () {
        for (var a in this._views) {
            this.views[a].destroy()
        }
        for (var a in this._elements) {
            delete this.elements[a]
        }
        delete this.target;
        delete this.parent;
    }
  }).include(Events);


  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  ViewController.views = {
    view: ViewController
  };
  
  ViewController.prototype.types = "ui-view ";
  
  ViewController.extend = function(e) {
    var b = Class.extend.call(this, e),
      d = e.getType();
    var f = ["getType"];
    for (var c = 0, a = f.length; c < a; c++) {
      if (!e.hasOwnProperty(f[c])) {
        throw "Class missing '" + f[c] + "()' implementation"
      }
      b[f[c]] = e[f[c]]
    }
    b.prototype.types += d + " ";
    b.extend = arguments.callee;
    return ViewController.views[d] = b
  };
  
  ViewController.get = function(a) {
    if (a == "ui-view") {
      return this
    }
    if (!this.views.hasOwnProperty(a)) {
      throw "View '" + a + '" not found'
    }
    return this.views[a]
  };


  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine.ViewController = ViewController;


}(Clementine));
// ------------------------------------------------------------------------------------------------
// View Object
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var View = {};
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Definition
  // ------------------------------------------------------------------------------------------------
  
  var templates = {};
  
  View.get = function(path, control, name) {
  
    var that = this;
    var views = [];
    var output;
    
    if (!templates.hasOwnProperty(path)) {
      throw 'Path ' + path + ' has not been loaded';
    }
    
    $('<div>' + templates[path] + '</div>').children().each(function() {
      views.push($(this));
    });
    
    for (var i=0; i<views.length; i++) {
      if (typeof control !== 'undefined' && views[i].attr('data-control') !== control) { continue; }
      if (typeof name !== 'undefined' && views[i].attr('data-name') !== name) { continue; }
      return views[i];
    }
    throw 'Could not find view ' + control + ' at ' + path;
    
  };
  
  View.fetch = function(path, success, sync) {
    return $.ajax({
      async: sync !== true,
      cache: false,
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
  };
  
  View.load = function(paths, callback) {
    
    var path;
    var count = paths.length;
    
    function onFetch(path, html) {
      templates[path] = html; count--;
      if (count === 0) { callback(); }
    }
    
    for (var i=0; i<paths.length; i++) {
      path = paths[i];
      this.fetch(paths[i], proxy(onFetch, this));
    }
  };
    
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine.View = View;
  

}(Clementine));
// ------------------------------------------------------------------------------------------------
// View Object
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var Service = {};

  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Service = Class.extend({
  
    initialize: function(prefix) {
      this.prefix = prefix;
    },
  
    setPrefx: function(prefix) {
      this.prefix = prefix;
    },
    
    getPrefix: function() {
      if (!this.prefix) {
        throw { type: 'Configuration Error', message: 'Missing base url' };
      }
      return this.prefix;
    },
  
    request: function(path, method, params, map, success, failure, context) {
    
      if (!success || !failure) {
        throw { type: 'Invalid Request', message: 'Missing callback function' };
      }
      
      map = map || function(data) { return data; };
      
      context = context || this;
    
      $.ajax({
        url: this.getPrefix() + path,
        type: method,
        timeout: 30000,
        data: params,
        success: function (data) {
          if (data === null) {
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
            clean = map(data);
          } catch(ex) {
            failure.call(context, ex);
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
    }
  
  });
    
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine.Service = Service;
  

}(Clementine));
// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Application;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Loader           = Orange.Loader;
  var Service          = Orange.Service;
  var View             = Orange.View;
  var ViewController   = Orange.ViewController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Application = Class.extend({
      initialize: function (a) {
          if (!a.hasOwnProperty("name") || (new RegExp(/[^A-Za-z:0-9_\[\]]/g)).test(a.name)) {
              throw "Invalid application name";
          }
          this.loaded = false;
          this.registered = false;
          this.config = a;
          if (a.hasOwnProperty('views')) {
            View.register(a.views, Class.proxy(function() {
              this.registered = true;
              if (this.loaded) { this.onLoad(); }
            }, this));
          }
          window.onload = Class.proxy(function() {
            this.loaded = true;
            if (this.registered) { this.onLoad(); }
          }, this);
      },
      onLoad: function () {
          var b = $("[data-root]"),
              e = b.attr("data-control"),
              d = b.attr("data-name");
          if (typeof e === "undefined" || typeof d === "undefined") {
              throw "Root view not found";
          }
          b.removeAttr("data-root");
          var f = ViewController.get(e);
          var a = new f(null, b);
          a.on("load", function () {
              a.show();
          });
          a.load();
          this.root = a;
          $(window).bind('hashchange', Class.proxy(this.onHashChange, this));
          $(window).trigger('hashchange');
      },
      onHashChange: function() {
        var hash = location.hash;
        if (!hash) {
          this.root.setState();
        } else {
          this.root.setState(hash.replace('#', '').split('/'));
        }
      }
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application  = Application;
  

}(Clementine));