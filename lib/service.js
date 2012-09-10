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
    
    return new Collection(objects);
    
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