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