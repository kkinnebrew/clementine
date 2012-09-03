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