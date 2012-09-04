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
    
    var required = ['getType', 'getFields'];
    for (var i = 0; i < required.length; i++) {
      if (!def.hasOwnProperty(required[i])) {
        throw "Class missing '" + required[i] + "()' implementation";
      }
      m[required[i]] = def[required[i]];
    }
    
    if (!Model.hasOwnProperty('models')) { Model.models = {}; }
    
    Model.models[m.getType()] = m;
    
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