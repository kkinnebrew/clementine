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