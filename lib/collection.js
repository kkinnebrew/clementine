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