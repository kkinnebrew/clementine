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
    
    var required = ['getType'];
    for (var i = 0; i < required.length; i++) {
      if (!def.hasOwnProperty(required[i])) {
        throw "Class missing '" + required[i] + "()' implementation";
      }
      s[required[i]] = def[required[i]];
    }
    
    if (!Service.hasOwnProperty('services')) { Service.services = {}; }
    
    Service.services[s.getType()] = s;
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Service = Service;
  

}(Orange));