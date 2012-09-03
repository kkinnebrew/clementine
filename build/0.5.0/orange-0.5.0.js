/**
 * OrangeUI | 0.5.0 | 09.03.2012
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
    if (o[i] && typeof o[i] === "object") {
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
      
      if (parent != null && ev.bubbles && evName[0] !== '_') {
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
    poll = true;
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
      
      // setup config
      this.id = (data || {}).hasOwnProperty(key) ? data[key] : null;
      this.data = {};
      this.fields = this.getFields();
      this.hasChanges = false;
      
      // process data
      var fields = this.getFields();
      for (var field in fields) {
        if (data.hasOwnProperty('field')) {
          this.data[field] = data[field];
        }
      }
      
    },
    
    getName: function() {
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
    
    get: function(field) {
      if (!this.fields.hasOwnProperty(name)) {
        throw "Field does not exist";
      }
      return this.data[name];
    },
    
    set: function(field, value) {
      if (!this.fields.hasOwnProperty(name)) {
        throw "Field does not exist";
      }
      this.data[name] = value;
      this.hasChanges = true;
    },
    
    clear: function(field) {
      if (!this.fields.hasOwnProperty(name)) {
        throw "Field does not exist";
      }
      delete this.data[name];
      this.hasChanges = true;
    },
    
    getId: function() {
      return this.id;
    },
    
    getModel: function() {
      return this.constructor;
    },
    
    toObject: function() {
      return this.data;
    },
    
    destroy: function() {
      delete this.id;
      delete this.data;
      delete this.fields;
      delete this.hasChanges;
    }
    
  }).include(Events);
  
  Model.get = function(name) {
    
    if (Model.models.hasOwnProperty(name)) {
      return Model.models[name];
    } else {
      throw 'No model exists with name "' + name + '"';
    }
    
  };
  
  Model.extend = function(def) {
    
    var m = Class.extend.call(this, def);
    
    var required = ['getName', 'getFields'];
    for (var i = 0; i < required.length; i++) {
      if (!def.hasOwnProperty(required[i])) {
        throw "Class missing '" + required[i] + "()' implementation";
      }
      m[required[i]] = def[required[i]];
    }
    
    Model.models[m.getName()] = m;
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Model Constants
  // ------------------------------------------------------------------------------------------------
  
  Model.Field = {
  
    KEY:       1,
    TEXT:      2,
    URL:       3,
    ASSET:     4,
    OBJECT:    5,
    ARRAY:     6,
    MAP:       7,
    MODEL:     8
    
  };
  
  Model.Asset = {
    IMAGE: 1
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Model = Model;
  

}(Orange));
// ------------------------------------------------------------------------------------------------
// Service Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Service;
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Model                = Orange.Model;
  var Storage              = Orange.Storage;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Service = Class.extend({
    
    initialize: function(config) {
      
      // store base url
      if (config.hasOwnProperty('baseUrl')) {
        if (config.baseUrl[config.baseUrl.length-1] === '/') {
          this.baseUrl = config.baseUrl.substr(0, config.baseUrl.length-1);
        } else {
          this.baseUrl = config.baseUrl;
        }
      } else {
        throw 'Cannot instantiate service';
      }

    },
    
    getName: function() {
      throw 'Cannot instantiate service';
    },
    
    getPath: function() {
      throw 'Cannot instantiate service';
    },

    mapStatus: function(data) {
      return data;
    },
    
    mapError: function(data) {
      return data;
    },
    
    mapErrorMessage: function(data) {
      return data;
    },
    
    mapResponse: function(data) {
      return data;
    },
    
    goOnline: function() {
      this.isOnline = true;
    },
    
    goOffline: function() {
      this.isOnline = false;
    },
    
    request: function(path, method, params, conf, success, failure) {
      
      // build request url
      var url = this.baseUrl + path;
      
      // validate method
      if (!(method in ['GET', 'POST', 'PUT', 'DELETE'])) {
        throw 'Invalid method type';
      }
      
      // validate conf
      if (!this.validateConf(conf)) {
        throw 'Invalid configuration';
      }
      
      // build error function
      function onError(err) {
        
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
        failure(msg);
        
      }
      
      // check the connection
      if (!this.isOnline) {
      
        // check offline support
        if (conf.offline && method === 'GET') {
          
          // look for cached response
          var response = this.retrieveResponse(path, method, params);
          
          // if it exists, call success
          if (response) {
            success(response);
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
        
          // process result
          data = conf.callback(data);
          
          // map result
          if (conf.from === 'array' && conf.to === 'collection') {
            data = this.parseArrayToCollection(data, conf.map);
          } else if (conf.from === 'object' && conf.to === 'collection') {
            data = this.parseObjectToCollection(data, conf.map);
          } else if (conf.from === 'object' && conf.to === 'model') {
            data = this.parseObjectToModel(data, conf.map);
          }
          
          // cache result
          if (conf.cache) {
          
            // push results to cache
            this.cacheResponse(path, method, data);
            
          }
          
          // call success
          success(data);
        
        } catch(e) {
          onError('parse');
        }
      
      }
      
      // call service
      $.ajax({
        url: url,
        type: method,
        data: params,
        success: onSuccess,
        error: onError
      });
      
    },
    
    validateConf: function(conf) {
      var params = ['map', 'from', 'to', 'offline', 'cache', 'callback'];
      for (var i=0; i<params.length; i++) {
        if (!conf.hasOwnProperty(params[i])) {
          return false;
        }
        if (params[i] === 'map') {
          if (!this.validateMap(conf[params[i]])) {
            return false;
          }
        }
      }
    },
    
    validateMap: function(map) {
      var valid = true;
      if (!map.hasOwnProperty('model')) {
        valid = false;
      } else {
        if (!Model.get(map.model)) {
          valid = false;
        }
      }
      if (!map.hasOwnProperty('params')) {
        valid = false;
      }
      return valid;
    },
    
    parseObjectToModel: function(obj, map) {
      
      var mappedObj = {};
      var model;
      var result;
      
      for (var field in map.params) {
        if (obj.hasOwnProperty(map.params[field])) {
          mappedObj[field] = obj[map.params[field]];
        }
      }
      
      model = Model.get(map.model);
      result = new model(mappedObj);
      
      return result || false;
      
    },
    
    parseArrayToCollection: function(obj, map) {
    
      var objects = [];
      var object;
    
      if (typeof obj !== 'Array') {
        return false;
      }
      
      for (var i=0; i<obj.length; i++) {
        object = this.parseObjectToModel(obj, map);
        if (object) {
          objects.push(object);
        }
      }
      
      return objects;
    
    },
    
    parseObjectToCollection: function(obj, map) {
      var list = [];
      for (var i in obj) {
        list.push(obj);
      }
      this.parseArrayToCollection(list, map);
    },
    
    cacheResponse: function(path, method, response) {
    
      var cache;
    
      // build cache object
      if (response instanceof Array) {
        cache = [];
        for (var i=0; i<response.length; i++) {
          if (response[i] instanceof Model) {
            cache.push({
              model: response[i].getModel().getType(),
              id: response[i].getId()
            });
          } else {
            cache.push(response[i]);
          }
        }
      } else if (response instanceof Model) {
        
        cache = {
          model: response.getModel().getType(),
          id: response.getId()
        };
        
      } else {
        cache = response;
      }
      
      // build key
      var key = this.getName() + ':' + method + ':' + path;
      
      // fetch key
      return Storage.set(key, cache);
    
    },
    
    retrieveResponse: function(path, method) {
    
      // build key
      var key = this.getName() + ':' + method + ':' + path;
      
      // fetch key
      var cache = Storage.get(key);
      
      // return object
      return cache || null;
      
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
    
    var required = ['getName', 'getPath', 'getAuth'];
    for (var i = 0; i < required.length; i++) {
      if (!def.hasOwnProperty(required[i])) {
        throw "Class missing '" + required[i] + "()' implementation";
      }
      s[required[i]] = def[required[i]];
    }
    
    Service.services[s.getName()] = s;
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Service = Service;
  

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
  
    if (!supported || typeof value === 'undefined' || !key.match(/[^A-Za-z:0-9_\[\]]/g)) {
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
      this.env = 'PROD';
       
      // load dependencies
      for (var i = 0, len = this.required.length; i < len; i++) {
        Loader.loadModule(this.required[i]);
      }
      
    },
    
    // features management
    
    loadServices: function() {
    
      // initialize services
      for (var service in this.serviceConfig) {
      
        // lookup service
        var s = Service.get(service);
        
        // get config
        var config = this.serviceConfig[service];
        
        // create new instance
        var svc = new s(config.paths[this.env], config.auth);
        
        // store service
        this.services[service] = svc;
      }
    
    },
    
    authenticate: function(success, failure, context) {
      
      // check for service
      if (this.services.hasOwnProperty(this.authService)) {
        throw 'Cannot load authentication service';
      }
      
      // get service
      var service = this.services[this.authService];
      
      // attempt to authenticate
      service.authenticate(success, failure, context);
      
    },
    
    // environment setup
    
    setEnvironment: function(env) {
      this.env = env;
    },
    
    setLogging: function(levels) {
      this.levels = levels;
    },

    
    // services management
    
    getService: function(name) {
      return this.services[name];
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
    
    // view management
    
    registerViews: function(views) {
      View.load(views); // handle callback
    },
    
    // event handling
    
    onHashChange: function(last) {
    
      // parse the hash
      var hash = location.hash.replace('#').split('/');
      
      // pass to controllers
      this.root.setRoute(hash, last);
    
    },
    
    onReady: function() {
      
      // find root element
      this.rootEl = $('[data-root]');
      
      // find root controller
      var c = ViewController.get(this.rootEl.attr('data-control'));
      
      // initialize root
      this.root = new c(null, this.rootEl, this);
      
      // load the app
      this.root.load().show();
      
      // set network status
      if (this.online) {
        this.root.goOnline();
      } else {
        this.root.goOffline();
      }
      
      // set route if it exists
      this.onHashChange();
      
    },
    
    onOnline: function() {
      
      // store connection
      this.online = true;
      
      // pass to services
      for (var service in this.services) {
        this.services[service].goOnline();
      }
      
      // pass to storage
      this.storage.goOnline();
      
      // pass to controllers
      this.root.goOnline();
      
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
      this.root.goOffline();
      
    },
    
    onAuthSuccess: function() {
      
      // bind the only event
      window.onload = proxy(this.onReady, this);
      
    },
    
    onAuthFailure: function() {
      
      // redirect to login, or something
      
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
          this.goOnline();
        } else {
          this.goOffline();
        }
        
        // bind cache event
        Cache.on('online', function(e) {
          
          if (e.data) {
            this.goOnline();
          } else {
            this.goOffline();
          }
          
        }, this);
        
        // authorize the user
        this.authenticate(this.onAuthSuccess, this.onAuthFailure, this);
        
      }, this);
    
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application = Application;
  

}(Orange));