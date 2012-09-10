// ------------------------------------------------------------------------------------------------
// Collection Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Collection;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Model       = Orange.Model;

  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Collection = Class.extend({

    initialize: function(data) {
    
      // store source
      this._source = data || [];
      
      // store data
      this.data = {};
      
      // store list
      this.list = [];
      
      // store event targets
      this.handles = [];
      
      // build keyed dictionary
      for (var i=0; i<data.length; i++) {
        this.data[data[i].getId()] = data[i];
        this.list.push(data[i]);
        if (data[i] instanceof Model) {
          this.handles.push(data[i].on('change', this.onModelUpdate, this));
        }
      }
      
      // store sort direction
      this.direction = 1;
      
      // sort key
      this.sortFields = [];
    
    },
    
    onModelUpdate: function(e) {
      this.sort(this.sortFields, this.direction);
    },
    
    get: function(id) {
      return this.data.hasOwnProperty(id) ? this.data[id] : null;
    },
    
    sort: function(field, direction, suppress) {
      
      if (!field) {
        return;
      }
      
      if (!direction) {
        direction = this.direction;
      }
      
      if (field instanceof Array) {
        this.sortFields = field;
      } else {
        this.sortFields = [field];
      }
      
      var up = 1*direction;
      var down = -1*direction;
      
      function compareTo(a, b) {
        
        if (a instanceof Date && b instanceof Date) {
          if (a === b) { return 0; }
          return (a > b) ? up : down;
        } else if (!isNaN(a) && !isNaN(b)) {
          try {
            if (parseFloat(a) === parseFloat(b)) { return 0; }
            return (parseFloat(a) > parseFloat(b)) ? up : down;
          } catch(e) {}
          return false;
        } else {
          try {
            if (a.toLowerCase() === b.toLowerCase()) { return 0; }
            return (a.toLowerCase() > b.toLowerCase()) ? up : down;
          } catch(e) {}
          return false;
        }
      
      }
      
      function sortBy(a, b) {
        var result = 0;
        for (var i=0; i<this.sortFields.length; i++) {
          result = compareTo(a.get([this.sortFields[i]]), b.get([this.sortFields[i]]));
          if (result) {
            return result;
          }
        }
        return 0;
      }

      // sort list
      this.list.sort(proxy(sortBy, this));
      
      // fire sorted event
      if (!suppress) {
        this.fire('change');
      }
      
      return this;
      
    },
    
    filter: function(field, value) {
      
      if (!value || value === '') {
        this.clearFilters();
        return;
      }
      
      var all = arguments.length === 1;
      var result = [], data;
      var pattern = new RegExp(all ? field : value, 'i');
      
      for (var i=0; i<this.list.length; i++) {
                
        if (this.list[i] instanceof Model) {
          data = this.list[i].toObject();
        } else {
          data = this.list[i];
        }
        
        if (all) {
          for (var prop in data) {
            if (pattern.test(data[prop])) {
              result.push(this.list[i]);
              break;
            }
          }
        } else {
          if (pattern.test(data[field])) {
            result.push(this.list[i]);
            break;
          }
        }
      
      }
      
      // replace list
      delete this.list;
      this.list = result;
      
      this.fire('change');
      
      return this;
    
    },
    
    clearFilters: function(suppress) {
      
      delete this.list;
      
      this.list = [];
      
      for (var i=0; i<this._source.length; i++) {
        this.list.push(this._source[i]);
      }
      
      if (this.sort) {
        this.sort(this.sort, this.direction, true);
      }
      
      // fire filtered event
      if (!suppress) {
        this.fire('change');
      }
      
      return this;
      
    },
    
    count: function() {
      return this.list.length;
    },
    
    toObject: function() {
      
      var obj = {};
      
      for (var i=0; i<this.list.length; i++) {
        obj[this.list[i].getId()] = this.list[i];
      }
      
      return obj;
      
    },
    
    toArray: function() {
      return this.list;
    },
    
    destroy: function() {
      
      // remove events
      if (this.handles.length) {
        for (var i=0; i<this.handles.length; i++) {
          this.handles[i].detach();
        }
      }
      
      // clear handles
      this.handles = [];
      
      // delete elements
      delete this._source;
      delete this.data;
      delete this.list;
      delete this.sort;
      
    }
  
  }).include(Events);

  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Collection = Collection;


}(Orange));