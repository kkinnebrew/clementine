/**
 * OrangeUI | 0.5.0 | 09.09.2012
 * https://github.com/brew20k/orangeui
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

jQuery.fn.outerHTML = function(s) {
  return s ? this.before(s).remove() : jQuery('<p>').append(this.eq(0).clone()).html();
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
  var Loader;
  var Log;
  var Orange = {};
  
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
        if (Array.prototype.indexOf.call(['extend', 'mixin'], key) < 0) {
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
    
    Orange.modules = {};
    
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
          Orange.modules[name] = exports;
        }
        
      }
      
    };
    
  }());
  
  
  // ------------------------------------------------------------------------------------------------
  // Log Object
  // ------------------------------------------------------------------------------------------------
  
  Log = (function() {
  
    var levels = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
    
    function logMessage(type, msg, ex) {
    
      if (this.level > type) {
        this.fire('msg', { message: msg, ex: ex });
        if (ex) {
          console.log('[' + levels[type] + ']', msg, ex); }
        else {
          console.log('[' + levels[type] + ']', msg);
        }
      }
      
    }
  
    function Log() {
      this.level = 1;
    }
    
    for (var i in Events) {
      Log[i] = Events[i];
    }
    
    Log.prototype.setLevel = function(level) {
      
      if (level in levels) {
        switch (level) {
          case 'DEBUG':
            level = 4; break;
          case 'INFO':
            level = 3; break;
          case 'WARN':
            level = 2; break;
          case 'ERROR':
            level = 1; break;
          default:
            level = 0;
        }
      }
      
    };
    
    Log.prototype.debug = function(msg, ex) {
      logMessage.call(this, 4, msg, ex);
    };
    
    Log.prototype.info = function(msg, ex) {
      logMessage.call(this, 3, msg, ex);
    };
    
    Log.prototype.warn = function(msg, ex) {
      logMessage.call(this, 2, msg, ex);
    };

    Log.prototype.error = function(msg, ex) {
      logMessage.call(this, 1, msg, ex);
    };
    
    return Log;
  
  }());
  
  
  // ------------------------------------------------------------------------------------------------
  // Browser Object
  // ------------------------------------------------------------------------------------------------
  
  Browser = {
    touch: ('ontouchstart' in window) || (window.hasOwnProperty('DocumentTouch') && document instanceof DocumentTouch),
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
    Orange.Loader.addModule(name, fn, req);
  }
  
  function use() {
    var args = Array.prototype.slice.call(arguments),
      fn = args[args.length-1],
      req = clone(args).splice(0, args.length-1);
    if (typeof req[0] !== 'function') {
      for (var i = 0, len = req.length; i < len; i++) {
        Orange.Loader.loadModule(req[i]);
      }
    }
    fn.call(window, Orange);
  }
  
  function include(name) {
    if (typeof Orange.modules[name] !== undefined) {
      return Orange.modules[name];
    } else {
      throw 'Could not require module';
    }
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange              = this.Orange = { modules: {} };
  Orange.version      = '0.5.0';
  
  Orange.add          = add;
  Orange.use          = use;
  Orange.include      = this.include = include;
  
  Orange.Browser      = Browser = Browser;
  Orange.Class        = this.Class = Class;
  Orange.Events       = this.Events = Events;
  Orange.EventHandle  = EventHandle;
  Orange.Loader       = Loader;
  Orange.Log          = this.Log = new Log();
    
  
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
// ------------------------------------------------------------------------------------------------
// Cache Object
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Cache = {};
  
  var active = null;
  var poll = false;
  var online = false;
  var loaded = false;
  var inited = false;
  
  
  function stop() {
    if (active !== null) {
       clearTimeout(active);
       active = null;
    }
  }
  
  function statusCallback(callback) {
    
    var id = Math.floor(Math.random() * 10000);
    
    if (navigator.onLine && !loaded) {
    
      online = true;
      loaded = true;
      
      Cache.fire('online', true);
      
      if (callback) {
        callback(true);
      }
      if (poll) {
        setTimeout(statusCallback, 10 * 1000);
      }
      return;
    }
    
    stop();
    
    active = setTimeout(function() {
    
      if (navigator.onLine && !loaded) {
      
        online = true;
        loaded = true;
        Cache.fire('online', true);
        
      } else if (navigator.onLine) {
      
        $.ajax({
          url: 'ping.js?q='+id,
          type: "GET",
          success: function() {
            if (online === false) {
              online = true;
              Cache.fire('online', true);
            }
          },
          error: function() {
            if (online === true) {
              online = false;
              Cache.fire('online', false);
            }
          }
        });
      
      } else {
      
        setTimeout(function() {
          if (online === true) {
            online = false;
            Cache.fire('online', false);
          }
        }, 100);
      
      }
      
      active = null;
      
      if (poll) { setTimeout(statusCallback, 10 * 1000); }
      
    }, (loaded ? 100 : 0));
    
  }
  
  function onUpdateReady() {
  
    window.applicationCache.swapCache();
    Log.debug("Cache updated and ready");
    window.location.reload(true);
    
  }
  
  for (var i in Events) {
    Cache[i] = Events[i];
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Cache Methods
  // ------------------------------------------------------------------------------------------------
  
  Cache.init = function(callback, context) {
  
    if (inited) { return; }
    poll = false;
    inited = true;
    
    $(window).bind('offline', statusCallback);
    $(window).bind('online', statusCallback);
    $(window).bind('updateready', onUpdateReady);
    
    statusCallback.call(Cache, proxy(callback, context));
  
  };
  
  Cache.updateNetworkStatus = function(callback) {
    statusCallback.call(Cache);
  };
  
  Cache.isActive = function() {
    return inited;
  };
  
  Cache.isOnline = function() {
    return online;
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------

  Orange.Cache = Cache;


}(Orange));
// ------------------------------------------------------------------------------------------------
// Collection Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Collection;
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Collection = Class.extend({
  
    initialize: function(model, data) {
    
      this.model = model;
      this.data = data;
      this.active = data;
      this.list = this.toArray();
      this.events = [];
      
      this.events.push(this.model.on('datachange', Class.proxy(this.mergeDeltas, this)));
      this.events.push(this.model.on('datasync', Class.proxy(this.syncDeltas, this)));
    
    },
    
    mergeDeltas: function(e) {
    
      var delta = e.data;
      
      if (delta.action === 'set') {
        this.data[delta.id] = delta.item;
        if (this.active.hasOwnProperty(delta.id)) {
          this.active[delta.id] = delta.item;
        }
      } else if (delta.action === 'delete') {
        if (this.data.hasOwnProperty(delta.id)) {
          delete this.data[delta.id];
        }
        if (this.active.hasOwnProperty(delta.id)) {
          delete this.active[delta.id];
        }
      }
      
      this.list = this.toArray();
    
    },
    
    syncDeltas: function(e) {
      
      var delta = e.data;
      
      if (this.data.hasOwnProperty(delta.oldId)) {
      
        var item = this.data['c' + delta.oldId];
        
        delete this.data['c' + delta.oldId];
        
        this.data[delta.id] = item;
        this.data[delta.id][this.model.getKey()] = delta.id;
        
        if (this.data[delta.id]['_unsaved']) {
          delete this.data[delta.id]['_unsaved'];
        }
        if (this.active.hasOwnProperty(delta.oldId)) {
          delete this.active[delta.oldId];
          this.active[delta.id] = item;
        }
        
        this.list = this.toArray();
      }
    
    },
    
    count: function() {
      return this.list.length;
    },
    
    get: function(id) {
      return this.data.hasOwnProperty(id) ? new this.model(this.data[id]) : null;
    },
    
    filter: function(callback) {
      if (typeof callback === 'function' && this.active !== undefined) {
        for(var id in this.active) {
          if (!callback.call(this, this.active[id] || {})) {
            delete this.active[id];
          }
        }
      }
    },
    
    clearFilters: function() {
      this.active = this.data;
    },
    
    toArray: function() {
      var output = [];
      for (var id in this.active) {
        output.push(this.active[id]);
      }
      return output;
    },
    
    toObject: function() {
      return this.active;
    },
    
    getModel: function() {
      return this.model;
    },
    
    destroy: function() {
      for (var i = 0, len = this.events.length; i < len; i++) {
        this.events[i].detach();
      }
      this.events = [];
    }
  
  }).include(Events);

  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Collection = Collection;


}(Orange));
// ------------------------------------------------------------------------------------------------
// Form Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Form;
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Model = Orange.Model;
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Form = Class.extend({
  
    initialize: function(target) {
      
      // store context
      var that = this;
      var model;
      var modelClass;
      
      // store target
      this.target = target;
      this.fields = {};
            
      // validate fields
      this.target.find('input, select, textarea, checkbox').not('input[type="submit"]').not('input[type="button"]').each(function() {
        var name = $(this).attr('name');
        if (name) { that.fields[name] = $(this); }
      });
      
      // check for model
      model = this.target.attr('data-model');
      if (model) {
        modelClass = Model.load(model);
        if (modelClass) { this.build(modelClass); }
      }
      
      // bind submit event
      this.target.submit(proxy(this.$onSubmit, this));
        
    },
    
    get: function(name) {
      if (this.fields.hasOwnProperty(name)) {
        return this.fields[name].val();
      }
    },
    
    set: function(name, value) {
      if (this.fields.hasOwnProperty(name)) {
        this.fields[name].val(value);
      }
    },
    
    clear: function(name) {
      if (this.fields.hasOwnProperty(name)) {
        this.fields[name].val('');
      }
    },
    
    disable: function() {
      for (var name in this.fields) {
        this.fields[name].attr('disabled', 'disabled');
      }
    },
    
    enable: function() {
      for (var name in this.fields) {
        this.fields[name].removeAttr('disabled');
      }
    },
    
    build: function(model) {
      var schema = model.getSchema();
    },
    
    getData: function() {
      var data = {};
      for (var name in this.fields) {
        data[name] = this.fields[name].val();
      }
      return data;
    },
    
    setData: function(data) {
      for (var name in this.fields) {
        if (data.hasOwnProperty(name)) {
          this.fields[name].val(data[name]);
        }
      }
    },
    
    $onSubmit: function(e) {
            
      // check if form manually posts
      var action = this.target.attr('action');
      if (typeof action !== 'undefined') { return; }
      
      // prevent default submit
      e.preventDefault();
      
      // fire event
      this.fire('submit', this.getData());
      
    },
    
    destroy: function() {
      for (var name in this.fields) {
        delete this.fields[name];
      }
    }
    
  }).include(Events);
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------

  Orange.Form = Form;
  

}(Orange));
// ------------------------------------------------------------------------------------------------
// Location Object
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Location = {};
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Browser     = Orange.Browser;
  
  
  // ------------------------------------------------------------------------------------------------
  // Functions
  // ------------------------------------------------------------------------------------------------
  
  var location = null;
  var timestamp = null;
  var ttl = 60 * 60 * 1000;
  
  function isExpired() {
    return ((new Date()).getTime() - timestamp) > ttl;
  }
  
  function onCurrentPosition(success, position) {
    timestamp = (new Date().getTime());
    location = position.coords;
    
    // call success function
    if (typeof success === 'function') { success(position.coords); }
    
  }
  
  function onError(ex) {
    switch (ex.code) {
      case ex.TIMEOUT:
        Log.warn('Location services timeout'); break;
      case ex.POSITION_UNAVAILABLE:
        Log.warn('Position unavailable'); break;
      case ex.PERMISSION_DENIED:
        Log.warn('Please Enable Location Services'); break;
      default:
        Log.info('Unknown location services error'); break;
    }
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Location Methods
  // ------------------------------------------------------------------------------------------------
  
  Location.get = function(success, failure) {
  
    if (!Browser.location) {
      failure.call(this);
      return;
    }
    
    if (typeof success !== 'function') {
      return;
    }
    
    if (location && !isExpired()) {
      return success(location);
    }
    
    var errorFn = function(ex) {
      onError(ex);
      if (failure) { failure.call(this); }
    }, successFn = function(position) {
      onCurrentPosition(success, position);
    };
    
    navigator.geolocation.getCurrentPosition(successFn, errorFn);
  
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Location = Location;
  

}(Orange));
// ------------------------------------------------------------------------------------------------
// Model Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Model;
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Collection           = Orange.Collection;
  var Events               = Orange.Events;
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
    
  Model = Class.extend({
  
    initialize: function(data) {
      
      // get keys
      var key = this.getKey();
      
      // store data
      this._id = null;
      this._data = {};
      this._changed = false;
      
      var isKey = false;
            
      // fetch fields
      var fields = this.getFields();
      
      // process data
      for (var i in fields) {
        isKey = fields[i].type === Model.Field.KEY;
        if (data.hasOwnProperty(i) && typeof data[i] !== 'undefined') {
          if (isKey) {
            this._id = Model.clean(data[i], fields[i]);
          } else {
            this._data[i] = Model.clean(data[i], fields[i]);
          }
        } else if (fields[i].hasOwnProperty('required') && fields[i].required || isKey) {
          throw 'Field Missing: "' + i + '" on model "' + this.getType() + '"';
        }
      }
          
    },
    
    getType: function() {
      throw 'Cannot instantiate model';
    },
    
    getKey: function() {
      var fields = this.getFields();
      for(var field in fields) {
        if (fields[field].type === Model.Field.KEY) {
          return field;
        }
      }
    },
    
    getFields: function() {
      throw 'Cannot instantiate model';
    },
    
    get: function(name) {
      var fields = this.getFields();
      if (!fields.hasOwnProperty(name)) {
        throw 'Invalid Input: Field for model "' + name + '" does not exist';
      }
      return this._data[name];
    },
    
    set: function(name, value) {
      var fields = this.getFields();
      if (!fields.hasOwnProperty(name)) {
        throw 'Invalid Input: Field for model "' + name + '" does not exist';
      }
      value = Model.clean(value, fields[name]);
      if (typeof value === 'undefined') {
        throw 'Invalid Input: Value is undefined for field "' + name + '"';
      }
      this._data[name] = value;
      this._changed = true;
    },
    
    clear: function(name) {
      var fields = this.getFields();
      if (!fields.hasOwnProperty(name)) {
        throw 'Invalid Input: Field for model "' + name + '" does not exist';
      }
      delete this._data[name];
      this._changed = true;
    },
    
    getId: function() {
      return this._id;
    },
    
    getModel: function() {
      return this.constructor;
    },
    
    isChanged: function() {
      return this._changed;
    },
    
    toObject: function() {
      var obj = clone(this._data);
      obj[this.getKey()] = this._id;
      return obj;
    },
    
    destroy: function() {
      delete this._id;
      delete this._data;
      delete this._changed;
    }
  
  }).include(Events);
  
  
  // ------------------------------------------------------------------------------------------------
  // Model Class Methods
  // ------------------------------------------------------------------------------------------------
  
  Model.get = function(name) {
    
    if (Model.models.hasOwnProperty(name)) {
      return Model.models[name];
    } else {
      throw 'No model exists with name "' + name + '"';
    }
    
  };
  
  Model.registerType = function(key, callback) {
    
    if (!Model.hasOwnProperty('types')) {
      Model.types = {};
    }
    
    Model.types[key] = callback;
    
  };
  
  Model.clean = function(data, params) {
    
    if (!Model.hasOwnProperty('types')) {
      Model.types = {};
    }
    
    if (Model.types.hasOwnProperty(params.type) && typeof Model.types[params.type] === 'function') {
      return Model.types[params.type].call(this, data, params);
    } else {
      return data;
    }
    
  };
  
  Model.extend = function(def) {
        
    var m = Class.extend.call(this, def);
    
    var required = ['getType', 'getFields'];
    for (var i = 0; i < required.length; i++) {
      if (!def.hasOwnProperty(required[i])) {
        throw "Class missing '" + required[i] + "()' implementation";
      }
      m[required[i]] = def[required[i]];
    }
    
    var fields = def.getFields();
    for (var field in fields) {
      if (!fields[field].hasOwnProperty('type')) {
        throw 'Invalid Field: Missing type declaration';
      }
    }
    
    if (!Model.hasOwnProperty('models')) { Model.models = {}; }
    
    Model.models[m.getType()] = m;
        
    return m;
    
  };
  
  
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
  // Model Validators
  // ------------------------------------------------------------------------------------------------
  
  Model.registerType(Model.Field.KEY, function(data, params) {
    if (params.hasOwnProperty('numeric')) {
      data = !isNaN(data) ? parseInt(data, 10) : undefined;
    }
    if (!data) {
      throw 'Invalid Data: Missing primary key';
    }
    return data;
  });
  
  Model.registerType(Model.Field.TEXT, function(data, params) {
    return typeof data === 'string' ? data : undefined;
  });
  
  Model.registerType(Model.Field.URL, function(data, params) {
    return typeof data === 'string' ? data : undefined;
  });
  
  Model.registerType(Model.Field.DATE, function(data, params) {
    var date;
    try {
      date = new Date(data);
    } catch(e) {
      console.log('date parse failed');
    }
    return date instanceof Date ? date : undefined;
  });
  
  Model.registerType(Model.Field.OBJECT, function(data, params) {
    return typeof data === 'object' ? data : undefined;
  });
  
  Model.registerType(Model.Field.ARRAY, function(data, params) {
    return data instanceof Array ? data : undefined;
  });
  
  Model.registerType(Model.Field.MODEL, function(data, params) {
    return data;
  });
  
  Model.registerType(Model.Field.MONEY, function(data, params) {
    if (typeof data === 'string') {
      data = data.replace(/[$,]/g, '');
    }
    return !isNaN(data) ? parseFloat(data) : undefined;
  });
  
  Model.registerType(Model.Field.PERCENT, function(data, params) {
    if (typeof data === 'string') {
      data = data.replace(/[%]/g, '');
    }
    if (!isNaN(data)) {
      data = parseFloat(data);
    } else {
      return undefined;
    }
    if (params.hasOwnProperty('basis')) {
      if (params.basis === 'percent') {
        data = Math.round(data*10000)/1000000;
      } else if (params.basis === 'bip') {
        data = Math.round(data*10000)/100000000;
      }
    }
    return data;
  });
  
  Model.registerType(Model.Field.NUMBER, function(data, params) {
    if (typeof data === 'string') {
      data = data.replace(/[,]/g, '');
    }
    return !isNaN(data) ? parseFloat(data) : undefined;
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Model = Model;
  

}(Orange));
// ------------------------------------------------------------------------------------------------
// Storage Object
// ------------------------------------------------------------------------------------------------

(function(Orange) {
  
  var Storage = {};
  
  var db = window.localStorage;
  var supported = false;
  var online = false;
  
  
  // ------------------------------------------------------------------------------------------------
  // Feature Detection
  // ------------------------------------------------------------------------------------------------
  
  if ('localStorage' in window) {
    try {
      window.localStorage.setItem('_test', 1);
      supported = true;
      window.localStorage.removeItem('_test');
    } catch (e) {}
  }
  
  if (supported) {
    try {
      if (window.localStorage) {
        db = window.localStorage;
      }
    } catch (e) {}
  } else if ('globalStorage' in window) {
    try {
      if (window.globalStorage) {
        db = window.globalStorage[window.location.hostname];
        supported = true;
      }
    } catch(e) {}
  }
  
  if (!JSON && !JSON.hasOwnProperty('stringify')) {
    supported = false;
  }
  
  if (!supported) {
    Log.warn('No native JSON parser found');
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Storage Methods
  // ------------------------------------------------------------------------------------------------
  
  Storage.get = function(key) {
  
    if (!supported) { return; }
    
    try {
      var item = JSON.parse(db.getItem(key));
      if (item !== undefined && item.data !== undefined) {
        if (online && item.ttl !== -1 && ((new Date()).getTime() - item.timestamp) > item.ttl) {
          db.removeItem(key);
        }
        return item.data;
      }
    } catch(e) {
      Log.error("Error fetching object from localStorage");
    }
  
  };
  
  Storage.set = function(key, value, ttl) {
  
    if (!supported || typeof value === 'undefined' || !!key.match(/[^A-Za-z:0-9_\[\]]/g)) {
      return false;
    }
        
    var obj = {
      data: value,
      timestamp: (new Date()).getTime(),
      ttl: ttl ? ttl : (24 * 60 * 60 * 1000)
    };
    
    try {
      db.setItem(key, JSON.stringify(obj));
      return true;
    } catch (e) {
      if (e === QUOTA_EXCEEDED_ERR) {
        Log.error("Storage quota has been exceeded", e);
      }
    }
    return false;
    
  };
  
  Storage.remove = function(key) {
    if (!supported) { return false; }
    db.removeItem(key);
  };
  
  Storage.flushExpired = function(force) {
    if (!supported || (online === false && force !== true)) { return; }
    for (var key in db) {
      Storage.get(key);
    }
  };
  
  Storage.flush = function(force) {
    if (!supported || (online === false && force !== true)) { return; }
    db.clear();
    Log.info("Clear: Local storage cleared");
  };
  
  Storage.isSupported = function() {
    return supported;
  };
  
  Storage.goOnline = function() {
    online = true;
  };
  
  Storage.goOffline = function() {
    online = false;
  };
    
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Storage = Storage;
  

}(Orange));
// ------------------------------------------------------------------------------------------------
// Service Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Service;
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Collection  = Orange.Collection;
  var Model       = Orange.Model;
  var Storage     = Orange.Storage;
  
  
  // ------------------------------------------------------------------------------------------------
  // Private Functions
  // ------------------------------------------------------------------------------------------------
  
  function validateConfiguration(conf) {
    var params = ['map', 'from', 'to', 'offline', 'cache', 'callback'];
    for (var i=0; i<params.length; i++) {
      if (!conf.hasOwnProperty(params[i])) {
        return false;
      }
      if (params[i] === 'map') {
        if (!validateMap(conf[params[i]])) {
          return false;
        }
      }
    }
    return true;
  }
  
  function validateMap(map) {
    if (!map.hasOwnProperty('model') || !Model.get(map.model) || !map.hasOwnProperty('params')) {
      return false;
    }
    return true;
  }
  
  function mapArrayToCollection(map, data) {
    
    var objects = [];
    var object;
  
    if (!(data instanceof Array)) {
      return false;
    }
    
    for (var i=0; i<data.length; i++) {
      object = mapObjectToModel(map, data[i]);
      if (object) {
        objects.push(object);
      }
    }
    
    return objects;
    
  }
  
  function mapObjectToCollection(map, data) {
    
    var list = [];
    for (var i in data) {
      list.push(data[i]);
    }
    
    return mapArrayToCollection(map, list);
    
  }
  
  function mapObjectToModel(map, data) {
    
    var mappedObj = {};
    var model;
    var result;
    
    for (var field in map.params) {
      if (data.hasOwnProperty(map.params[field])) {
        mappedObj[field] = data[map.params[field]];
      }
    }
    
    model = Model.get(map.model);
    result = new model(mappedObj);
    
    return result || false;
  
  }
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Service = Class.extend({
    
    initialize: function(path, auth) {
      
      // set online
      this.isOnline = false;
      
      // set local cache
      this.cache = [];
      
      // store config
      this.auth = auth || null;
      this.path = path || '';

    },
    
    getType: function() {
      throw 'Cannot instantiate service';
    },
    
    getPath: function() {
      return '';
    },
    
    goOnline: function() {
      this.isOnline = true;
    },
    
    goOffline: function() {
      this.isOnline = false;
    },
    
    request: function(path, method, params, conf, success, failure, context) {
      
      // build request url
      var base = this.getPath();
      
      var url = (base.charAt(0) === '/' ? base.substr(1) : base) + path;
      var response;
      
      // validate method
      if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) === -1) {
        throw 'Invalid method type';
      }
      
      // validate conf
      if (!validateConfiguration(conf)) {
        throw 'Invalid configuration';
      }
      
      // build key
      var keys = Object.keys(params).sort();
      var key = 'service:' + this.getType() + ':';
      
      for (var i=0; i<keys.length; i++) {
        key += keys[i] + ':' + md5(params[keys[i]]) + ':';
      }
            
      // build error function
      function onError(err, e) {
        
        var msg;
        
        switch(err) {
          case 'parse':
            msg = 'Error parsing response';
            break;
          case 'offline':
            msg = 'Service offline';
            break;
          default:
            msg = 'Service error';
        }
        
        // call failure
        failure.call(context || this, e);
        
      }
      
      // check if cached
      if (conf.cache && this.cache.hasOwnProperty(key)) {
        
        // check if expired
        if (this.cache[key] > new Date().getTime()) {
          
          try {
                    
            // look for cached response
            response = this.retrieveResponse(key, conf.map.model, params);

          } catch(e) {}
          
          // if it exists, call success
          if (response) {
            success.call(context || this, response);
            return;
          }
          
        }
        
      }
      
      // check the connection
      if (!this.isOnline) {
      
        // check offline support
        if (conf.offline && method === 'GET') {

          try {
          
            // look for cached response
            response = this.retrieveResponse(key, conf.map.model, params);

          } catch(e) {}
          
          // if it exists, call success
          if (response) {
            success.call(context || this, response);
            return;
          }
          
        }
        
        // call error
        onError('offline');
        return;
      
      }
      
      // build success function
      function onSuccess(data) {
        
        try {
        
          var exists = !!data;
        
          // process result
          data = conf.callback(data);
          
          var existsAfter = !!data;
          
          if (existsAfter !== exists) {
            throw 'Invalid Mapping: Service callback returning no data';
          }
            
          // map result
          if (conf.from === 'array' && conf.to === 'collection') {
            if (data instanceof Array) {
              data = mapArrayToCollection(conf.map, data);
            } else {
              throw 'Invalid Response: Service "' + url + '" expected an array';
            }
          } else if (conf.from === 'object' && conf.to === 'collection') {
            if (typeof data === 'object' && !(data instanceof Array)) {
              data = mapObjectToCollection(conf.map, data);
            } else {
              throw 'Invalid Response: Service "' + url + '" expected an object';
            }
          } else if (conf.from === 'object' && conf.to === 'model') {
            if (typeof data === 'object') {
              data = mapObjectToModel(conf.map, data);
            } else {
              throw 'Invalid Response: Service "' + url + '" expected an object';
            }
          }
          
          // cache result
          if (conf.cache && method === 'GET') {
          
            // push results to cache
            this.cacheResponse(key, data);
            
          }
        
        } catch(e) {
          onError('parse', e);
          return;
        }
        
        // call success
        success.call(context || this, data);
      
      }
      
      // call service
      $.ajax({
        url: url,
        type: method,
        data: params,
        success: proxy(onSuccess, this),
        error: onError
      });
      
    },
    
    cacheResponse: function(key, response) {
    
      var cache;
      var type = 'object';
      
      // build cache object
      if (response instanceof Array) {
        cache = [];
        for (var i=0; i<response.length; i++) {
          if (response[i] instanceof Model) {
            cache.push(response[i].getId());
            Storage.set(response[i].getType() + ':' + response[i].getId(), response[i].toObject());
            type = 'collection';
          } else {
            cache.push(response[i]);
            type = 'array';
          }
        }
      } else if (response instanceof Model) {
        cache = response.getId();
        Storage.set(response.getType() + ':' + cache, response.toObject());
        type = 'model';
      } else {
        cache = response;
      }
      
      this.cache[key] = new Date().getTime() + 1000*60;
      
      // set key
      return Storage.set(key, {
        type: type,
        data: cache
      });
    
    },
    
    retrieveResponse: function(key, model, method) {

      // fetch key
      var cache = Storage.get(key);
      var modelClass = Model.get(model);
      
      // validate type
      var type = cache.type;
      var data = cache.data;
      
      if (type === 'model') {
        var item = Storage.get(model + ':' + data);
        var m = new modelClass(item);
        return m || null;
      } else if (type === 'collection') {
        var objs = [];
        var obj;
        for (var i=0; i<cache.length; i++) {
          obj = new modelClass(Storage.get(model + ':' + cache[i]));
          if (obj) {
            objs.push(obj);
          }
        }
        return objs;
      }
      
      // return object
      return cache || null;
      
    },
    
    modelOrId: function(object) {
      if (object instanceof Model) {
        return object.getId();
      } else if (typeof object !== 'object') {
        return object;
      } else {
        throw new Error('Invalid Input: Expecting model or id', object);
      }
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  Service.get = function(name) {
    
    if (!Service.hasOwnProperty('services')) {
      Service.services = {};
    }
    
    if (Service.services.hasOwnProperty(name)) {
      return Service.services[name];
    }
  
  };
  
  Service.extend = function(def) {
    
    var s = Class.extend.call(this, def);
    
    if (!Service.hasOwnProperty('services')) {
      Service.services = {};
    }
    
    var required = ['getType'];
    for (var i = 0; i < required.length; i++) {
      if (!def.hasOwnProperty(required[i])) {
        throw "Class missing '" + required[i] + "()' implementation";
      }
      s[required[i]] = def[required[i]];
    }
    
    Service.services[s.getType()] = s;
    
    return s;
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Service = Service;
  

}(Orange));
// ------------------------------------------------------------------------------------------------
// View Object
// ------------------------------------------------------------------------------------------------

(function(Orange) {

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

  function fetch(path, success, sync) {
    return $.ajax({
      async: sync !== true,
      contentType: "text/html; charset=utf-8",
      dataType: "text",
      timeout: 10000,
      url: path,
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
 
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.View = View;
  

}(Orange));
// ------------------------------------------------------------------------------------------------
// Binding Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Binding;
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Collection  = Orange.Collection;
  var Model       = Orange.Model;
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Binding = Class.extend({
    
    initialize: function(target) {
      
      // store target
      this.target = target;
      this.template = target.clone();
      this.loaded = false;
      
    },
    
    bind: function(data, callback) {
    
      if (this.loaded) {
        this.unbind();
      }
      
      if (data instanceof Collection) {
        this.bindList(this.target, data.toArray(), data.getModel().getId());
      } else if (data instanceof Array) {
        this.bindList(this.target, data);
      } else if (data instanceof Model) {
        this.bindModel(this.target, data.toObject(), data.getModel().getId());
      } else if (typeof data === 'object') {
        this.bindData(this.target, data);
      } else { return; }
      
      this.loaded = true;
      
      if (typeof callback === 'function') { callback.call(this); }
      
    },
    
    bindList: function(target, list, id) {

      var instance;
      var template;
      var itemscope = target.find('[itemscope]:first');
      var output = target.clone().empty();
      
      if (!itemscope.length) {
        target.remove();
        return;
      }
          
      // clone the template, remove the root
      itemscope.remove();
      template = itemscope.clone();
            
      if (list instanceof Array) {
        for (var i=0; i<list.length; i++) {
          instance = template.clone();
          output.append(instance);
          if (id) { this.bindModel(instance, list[id], id); }
          else { this.bindData(instance, list[i]); }
        }
      }
      
      // replace the target
      target.replaceWith(output);
      
    },
    
    bindModel: function(target, model, id) {
    
      this.target.attr('itemid', model[id]);
      this.target.attr('itemscope');
      this.bindData(model);
      
    },
    
    bindData: function(target, data) {
      
      var items = [];
      var item;
      var name;
      
      function childFunc(selector) {
      
        var childList = [];
        target.find(selector).each(function() {
        
          var include = false;
          var parent = $(this).parent();
          
          while (parent.length !== 0 && !include) {
            if ($(parent).not(target).length === 0) {
                include = true; break;
            } else if ($(parent).not('[data-control]').length === 0) {
              include = false; break;
            } parent = $(parent).parent();
          }
          
          if (include) { childList.push($(this)); }
          
        });
        
        return childList;
        
      }
      
      if (typeof data === 'string' && target.has('[itemscope]')) {
        target.text(data);
        return;
      }
      
      items = childFunc.call(this, '[itemprop]');
            
      for (var i=0; i<items.length; i++) {
      
        item = items[i];
        name = item.attr('itemprop');
        
        if (data.hasOwnProperty(name)) {
          if (data[name] instanceof Array) {
            this.bindList(item, data[name]);
          } else if (typeof data[name] === 'object') {
            this.bindData(item, data[name]);
          } else if (typeof data[name] === 'string') {
            item.text(data[name]);
          }
        } else {
          item.remove();
        }
      }
      
      
      
    },
    
    unbind: function() {
      this.target.replaceWith(this.template.clone());
    },
    
    destroy: function() {
      delete this.target;
      delete this.template;
      delete this.loaded;
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Binding = Binding;
  

}(Orange));
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
  function getRouteForKey(key, skip) {
  
    var routes = this.getRoutes();
    var def;
    var base;
    
    if (key && key.charAt(0) === '/') {
      key = key.substr(1);
    }
    
    for (var route in routes) {
      base = route.substr(1).split('/').shift();
      if (base.indexOf(':') !== -1 || !base) {
        def = '/' + base;
      }
      if (base === key) {
        return route;
      }
    }
    
    return skip ? null : def;
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
      
      // setup bindings
      this._bindings = {};
      
      // store states
      this._loaded = false;
      this._visible = false;
      this._stopping = false;
      
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
      
      var def = getRouteForKey.call(this, '');
            
      if (!def && !this.getParam('default') && Object.keys(routes).length > 0) {
        throw ('Invalid Syntax: View Controller "' + this.getParam('name') + '" must define either a [data-default] or generic / route');
      }
      
      for (var route in routes) {
        if (route.charAt(0) !== '/') {
          throw ('Invalid Syntax: Route "' + route + '" in ' + this.getParam('name') + ' must begin with forward slash');
        }
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
      
      if (route.substr(0, 1) !== '/') {
        route = '/' + route;
      }
      
      var key = getRouteForKey.call(this, route);
            
      if (this.route === route) {
        this.next();
        return;
      }
            
      var base = key.match(/[^:]*/).pop();

      if (base.charAt(base.length-1) === '/') {
          base = base.slice(0, -1);
      }
      
      var hash = '#!' + this._routes + base;
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
      
      function updateChildren(routes, subhash) {
        for (var view in this._views) {
          this.getView(view).setHashRoute(routes.slice(0), subhash);
        }
      }
      
      // store subhash
      subhash = subhash ? subhash : '';
      
      // get routes
      var callbacks = this.getRoutes();
      
      // check if controller implements routes
      if (Object.keys(callbacks).length === 0) {
        updateChildren.call(this, routes, subhash);
        this.next();
        return;
      }
      
      // get next route
      var route = routes.slice(0).shift();
      var key = getRouteForKey.call(this, route, true);
      
      if (key) {
        routes.shift();
      } else {
        key = getRouteForKey.call(this, route);
        route = '';
      }
      
      if (!key) {
        key = getRouteForKey.call(this, this.getParam('default'));
      }
      
      var parts = key.substr(1).split('/');
      var params = {};
      var param;
      
      // store routes
      this._routes = subhash || '';
      
      // append subhash
      if (route) {
        subhash += ('/' + route);
      }
      
      // fetch params
      for (var i=0; i<parts.length; i++) {
        if (parts[i].charAt(0) === ':') {
          param = routes.shift() || null;
          params[parts[i].substr(1)] = param;
          this.setParam(parts[i].substr(1), param);
          subhash += '/' + param;
        }
      }
      
      // execute callback
      if (callbacks.hasOwnProperty(key)) {
        callbacks[key].call(this, this.route, params);
      }
      
      // update children
      updateChildren.call(this, routes, subhash);
      
      // store new route
      this.route = route;
      
      // trigger the queue
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
      
      if (this._bindings.hasOwnProperty(element)) {
        this.unbind(element);
      }
      
      this._bindings[element] = new Binding(this.getElement(element));
      this._bindings[element].bind(data);
      
    },
  
    unbind: function(element) {
    
      if (!this.hasElement(element)) {
        throw ('Invalid Resource: Element "' + element + '" is not defined');
      }
      
      if (this._bindings.hasOwnProperty(element)) {
       this._bindings[element].unbind();
       delete this._bindings[element];
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
// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Application;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Cache            = Orange.Cache;
  var Loader           = Orange.Loader;
  var Service          = Orange.Service;
  var Storage          = Orange.Storage;
  var View             = Orange.View;
  var ViewController   = Orange.ViewController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Application = Class.extend({
      
    // constructors
    
    initialize: function(config) {
                  
      // validate configs
      if (!config.hasOwnProperty('name')) { throw 'Invalid application'; }
    
      // store configs
      this.name = config.name;
      this.required = config.hasOwnProperty('required') ? config.required : [];
      this.loaded = false;
      this.online = false;
      this.env = config.hasOwnProperty('env') ? config.env : 'PROD';
       
      // load dependencies
      for (var i = 0, len = this.required.length; i < len; i++) {
        Loader.loadModule(this.required[i]);
      }
      
      // setup vars
      this.servicePaths = {};
      this.services = {};
      this.serviceConfig = {};
      this.authService = null;
      this.constants = {};
      this.templates = [];
      
      // states
      this.authenticated = false;
      this.viewLoaded = false;
      
    },
    
    
    // features management
    
    loadServices: function() {
    
      // initialize services
      for (var service in this.serviceConfig) {
      
        // lookup service
        var s = Service.get(service);
        
        // get config
        var config = this.serviceConfig[service];
        var params = {};
        
        // get paths
        if (Object.keys(config.paths).length > 0 && typeof config.paths[this.env] !== undefined) {
          params = { path: config.paths[this.env], auth: config.auth };
        } else {
          params = { path: this.servicePaths[this.env], auth: config.auth };
        }
        
        // create new instance
        var svc = new s(params.path, params.auth);
        
        // store service
        this.services[service] = svc;
      }
    
    },
    
    authenticate: function(success, failure, context) {
      
      // check if defined
      if (!this.authService) {
        success.call(context);
        return;
      }
      
      // check for service
      if (!this.services.hasOwnProperty(this.authService)) {
        throw 'Cannot load authentication service';
      }
      
      // get service
      var service = this.services[this.authService];
      
      // attempt to authenticate
      if (typeof service.authenticate === 'function') {
        service.authenticate(success, failure, context);
      } else {
        throw 'Authentication service must implement authenticate()';
      }
      
    },
    
    
    // environment setup
    
    setEnvironment: function(env) {
      this.env = env;
    },
    
    setLogging: function(levels) {
      this.levels = levels;
    },
    
    
    // constant management
    
    setConstant: function(name, value) {
      this.constants[name] = value;
    },
    
    getConstant: function(name) {
      return this.constants.hasOwnProperty(name) ? this.constants[name] : null;
    },
    
    // services management
    
    getService: function(name) {
      return this.services.hasOwnProperty(name) ? this.services[name] : null;
    },
    
    registerService: function(name, auth, paths) {
      this.serviceConfig[name] = {
        auth: auth || null,
        paths: paths || {}
      };
    },
    
    setAuthentication: function(name) {
      this.authService = name;
    },
    
    registerServicePaths: function(paths) {
      this.servicePaths = paths;
    },
    
    
    // view management
    
    registerViews: function(views) {
      if (views instanceof Array) {
        this.templates = views;
      }
    },
    
    
    // event handling
    
    onHashChange: function(last) {
      
      // get the hash
      var hash = location.hash;
      
      if (hash.substr(0,2) === '#!') {
        hash = hash.replace('#!', '');
      } else {
        hash = hash.replace('#', '');
      }
      
      
      var route = [];
      
      if (hash.charAt(0) === '/') {
        hash = hash.substr(1);
      }
      
      route = hash.split('/');
      
      // set the hash to the root controller
      this.root.setHashRoute(route.slice(0));
    
    },
    
    onOnline: function() {
      
      // store connection
      this.online = true;
      
      // pass to services
      for (var service in this.services) {
        this.services[service].goOnline();
      }
      
      // pass to storage
      Storage.goOnline();
      
      // pass to controllers
      if (this.root) {
        this.root.goOnline();
      }
      
    },
    
    onOffline: function() {
      
      // store connection
      this.online = false;
      
      // pass to services
      for (var service in this.services) {
        this.services[service].goOffline();
      }
      
      // pass to storage
      Storage.goOffline();
      
      // pass to controllers
      if (this.root) {
        this.root.goOffline();
      }
      
    },
    
    onAuthSuccess: function() {
      
      // find root element
      var rootEl = $('[data-root]');
      
      if (rootEl.length === 0) {
        throw 'Invalid Markup: No [data-root] view found';
      }
      
      var control = rootEl.attr('data-control');
      
      if (!control) {
        throw 'Invalid Markup: Root View missing [data-control]';
      }
      
      // find root controller
      var c = ViewController.get(control);
      
      // initialize root
      this.root = new c(null, rootEl);
      
      // load the app
      this.root.load().show();
      
      // set network status
      if (this.online) {
        this.root.goOnline();
      } else {
        this.root.goOffline();
      }
            
      // trigger hash change
      $(window).trigger('hashchange');
      
      // show the application
      $('body').show();
            
    },
    
    onAuthFailure: function() {
      
      // redirect to login, or something
      console.log("Could not authenticate");
      
    },
    
    // application execution
    
    launch: function() {
    
      // prevent duplicate launches
      if (this.loaded) { return; }
      
      // set levels
      if (!this.levels || !this.levels.hasOwnProperty(this.env)) {
        Log.setLevel('DEBUG');
      } else {
        Log.setLevel(this.levels[this.env]);
      }
      
      // check network status
      Cache.init(function(online) {
        
        // init services
        this.loadServices();
        
        // set connection
        if (online) {
          this.onOnline();
        } else {
          this.onOffline();
        }
        
        // bind cache event
        Cache.on('online', function(e) {
          
          if (e.data) {
            this.onOnline();
          } else {
            this.onOffline();
          }
          
        }, this);
        
        // authenticate the user
        this.authenticate(proxy(function() {
          this.authenticated = true;
          if (this.viewLoaded) {
            this.onAuthSuccess.call(this);
          }
        }, this), this.onAuthFailure, this);
        
        // load the underlying views
        View.register(this.templates, proxy(function() {
          this.viewLoaded = true;
          if (this.authenticated) {
            this.onAuthSuccess.call(this);
          }
        }, this));
        
      }, this);
    
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Global Functions
  // ------------------------------------------------------------------------------------------------
  
  function config(fn) {
    if (typeof fn === 'function') {
      $(document).ready(function() {
        $('body').hide();
        var config = $('[data-app]').text();
        if (config) {
          config = JSON.parse(config);
          var app = new Application(config);
          fn.call(this, app);
          app.launch();
        }
      });
    }
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application  = Application;
  Orange.config       = config;
  

}(Orange));