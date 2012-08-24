// ------------------------------------------------------------------------------------------------
// Binding Class
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var Binding;
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Collection  = Clementine.Collection;
  var Model       = Clementine.Model;
  
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
      
      if (data instanceof Array) {
        this.bindList(this.target, data);
      } else if (typeof data === 'object') {
        this.bindData(this.target, data);
      } else { return; }
      
      this.loaded = true;
      
      if (typeof callback === 'function') { callback.call(this); }
      
    },
    
    bindList: function(target, list, field) {

      var instance;
      var template;
      var fieldVal;
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
          try {
            fieldVal = list[i][field];
          } catch(e) {
            fieldVal = undefined;
          }
          this.bindData(instance, list[i], fieldVal);
        }
      }
      
      // replace the target
      target.replaceWith(output);
      
    },

    bindData: function(target, data, id) {
      
      var items = [];
      var item;
      var name;
      
      if (id) {
        target.attr('itemid', id);
      }
      
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
  
  Clementine.Binding = Binding;
  

}(Clementine));