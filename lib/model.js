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
    return !isNaN(data) ? parseFloat(data) : undefined;
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