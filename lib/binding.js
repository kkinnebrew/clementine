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
    
      // store reference
      this.target = target;
      
      // store template
      this.template = target.html();
      
      // store data reference
      this.data = null;
      
      // event handle
      this.handles = [];
      
      // set state
      this.bound = false;
      this.binding = false;
    
    },
    
    bind: function(data, live) {
      
      // skip if already binding
      if (this.binding) {
        console.log('Error: Already binding');
        return;
      }
      
      // set as binding
      this.binding = true;
      
      // unbind if already bound
      if (this.bound) {
        this.unbind();
      }
      
      // set as bound
      this.bound = true;
      
      // store data
      this.data = data;
      
      // process by type
      if (data instanceof Collection) {
        this.bindCollection(this.target, data);
        this.handles.push(data.on('change', this.onCollectionUpdate, this));
      } else if (data instanceof Array) {
        this.bindList(this.target, data);
      } else if (data instanceof Model) {
        this.bindModel(this.target, data);
        this.handles.push(data.on('change', this.onModelUpdate, this));
      } else if (typeof data === 'object') {
        this.bindData(this.target, data);
      }
      
      // set as done
      this.binding = false;
      
    },
    
    onCollectionUpdate: function(e) {
      
      // remove events
      if (this.handles.length) {
        for (var i=0; i<this.handles.length; i++) {
          this.handles[i].detach();
        }
      }
      
      // clear handles
      this.handles = [];
      
      // replace target
      this.target.html(this.template);
            
      // rebuild list
      this.bindCollection(this.target, this.data);
      
      // rebind event
      this.handles.push(this.data.on('change', this.onCollectionUpdate, this));
          
    },
    
    onModelUpdate: function(e) {
        
      // store deltas
      var deltas = e.data;
      
      // get id
      var id = e.target.getId();
      
      // get type
      var type = e.target.getType();
      
      if (e.target.getItemType()) {
        type = e.target.getItemType();
      }
      
      if (deltas instanceof Array && deltas.length > 0) {
        for (var i=0; i<deltas.length; i++) {
          this.onModelKeyUpdate(deltas[i], id, type);
        }
      }
    
    },
    
    onModelKeyUpdate: function(delta, id, type) {
      
      // store deltas
      var action = delta.action;
      var name = delta.name;
      var value = delta.value;
      
      // set target
      var target;
            
      if (this.target.attr('itemid') === id.toString() && this.target.attr('itemtype') === type) {
        target = this.target;
        if (action === 'id') {
          this.target.attr('itemid', value);
        }
      } else {
        target = this.target.find('[itemid="' + id + '"][itemtype="' + type + '"]');
        if (action === 'id') {
          target.attr('itemid', value);
        }
      }
            
      // get all items
      var items = firstChildren(target, '[itemprop="' + name + '"]');
      
      // process items
      for (var i=0; i<items.length; i++) {
        if (action === 'set') {
          if (value instanceof Date) {
            this.bindItem(items[i], value);
          } else if (typeof data === 'object') {
            this.bindItem(items[i], value);
          } else {
            this.bindItem(items[i], value);
          }
        } else if (action === 'clear') {
          items[i].empty();
        }
      }
    
    },
    
    bindCollection: function(target, collection) {
    
      // bind list
      this.bindList(target, collection.toArray());
    
    },
    
    bindList: function(target, list) {
                  
      // find and store list template
      var itemscope = target.find('[itemscope]:first');
      var template = itemscope.clone();
      var output = target.clone();
      var instance;
      
      // return if not found
      if (!itemscope.length) {
        throw 'Invalid Markup: Cannot bind collection to view missing [itemscope]';
      }
      
      // remove itemscope
      itemscope.remove();
      itemscope = null;
      
      // iterate over list
      for (var i=0; i<list.length; i++) {
        
        // create instance
        instance = template.clone();
        
        // bind individual items
        if (list[i] instanceof Model) {
          this.bindModel(instance, list[i]);
        } else {
          this.bindData(instance, list[i]);
        }
        
        // append to output
        output.append(instance);
      
      }
            
      // replace the target
      target.html(output.html());
            
    },
    
    bindModel: function(target, model) {
    
      if (model.getItemType()) {
        target.attr('itemtype', model.getItemType());
      } else {
        target.attr('itemtype', model.getType());
      }
      
      // add microdata attributes
      target.attr('itemid', model.getId());
      target.attr('itemscope');
      
      // push event
      this.handles.push(model.on('change', this.onModelUpdate, this));
      
      // bind underlying
      this.bindData(target, model.toObject());
    
    },
    
    bindData: function(target, data) {
      
      var items = [];
      var prop;
      
      // if data is string or date, return
      if (typeof data === 'string' && target.has('[itemscope]')) {
        this.bindItem(target, data); return;
      } else if (data instanceof Date) {
        this.bindItem(target, data); return;
      }
      
      // get immediate [itemprop] elements
      items = firstChildren(target, '[itemprop]');
      
      // bind each item
      for (var i=0; i<items.length; i++) {
        prop = items[i].attr('itemprop') || null;
        if (prop && data.hasOwnProperty(prop)) {
          if (data[prop] instanceof Array) {
            this.bindList(items[i], data[prop]);
          } else if (data[prop] instanceof Date) {
            this.bindItem(items[i], data[prop]);
          } else if (typeof data[prop] === 'object') {
            this.bindData(items[i], data[prop]);
          } else {
            this.bindItem(items[i], data[prop]);
          }
        }
      }
      
    },
    
    bindItem: function(target, data) {
    
      if (data instanceof Date) {
            
        // add microdata attributes
        target.attr('datetime', data.toString());
        var format = target.attr('data-format');
        if (format && format.length > 0) {
          target.text(data.format(format.toLowerCase()));
        } else {
          target.text(data.getMonth() + '/' + data.getDate() + '/' + data.getFullYear());
        }
        
      } else if (typeof data === 'string' || typeof data === 'number') {
                
        // apply content attribute if meta tag
        if (target.prop('tagName') === 'META') {
          target.attr('content', data);
        } else {
          target.text(data);
        }
        
      }
    
    },
        
    unbind: function() {
      
      // null out reference
      this.data = null;
      
      // remove events
      if (this.handles.length) {
        for (var i=0; i<this.handles.length; i++) {
          this.handles[i].detach();
        }
      }
      
      // clear handles
      this.handles = [];
      
      // replace target
      this.target.html(this.template);
      
    },
    
    destroy: function() {
      
      delete this.target;
      delete this.template;
      delete this.data;
      delete this.handle;
      delete this.bound;
      delete this.binding;
      
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Binding = Binding;
  

}(Orange));