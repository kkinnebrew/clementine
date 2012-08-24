// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var Application;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Loader           = Clementine.Loader;
  var View             = Clementine.View;
  var ViewController   = Clementine.ViewController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Application = Class.extend({
      
    // constructors
    
    initialize: function(config) {
          
      // validate configs
      if (!config.hasOwnProperty('name') || !config.hasOwnProperty('required')) { throw 'Invalid application'; }
    
      // store configs
      this.name = config.name;
      this.required = config.required;
      this.loaded = false;
      this.online = false;
      this.env = 'PROD';
       
      // load dependencies
      for (var i = 0, len = this.config.required.length; i < len; i++) {
        Loader.loadModule(this.config.required[i]);
      }
      
    },
    
    // environment setup
    
    setEnvironment: function(env) {
      this.env = env;
    },
    
    setLogging: function(levels) {
      this.levels = levels;
    },

    // view management
    
    registerViews: function(views) {
      View.load(views); // handle callback
    },
    
    // event handling
    
    onHashChange: function(last) {
    
      // parse the hash
      var hash = location.hash.replace('#').split('/');
      
      // pass to controllers
      this.root.setRoute(hash, last);
    
    },
    
    onReady: function() {
      
      // find root element
      this.rootEl = $('[data-root]');
      
      // find root controller
      var c = ViewController.get(this.rootEl.attr('data-control'));
      
      // initialize root
      this.root = new c(null, this.rootEl, this);
      
      // load the app
      this.root.load().show();
      
      // set network status
      if (this.online) {
        this.root.goOnline();
      } else {
        this.root.goOffline();
      }
      
      // set route if it exists
      this.onHashChange();
      
    },
    
    // application execution
    
    launch: function() {
    
      // prevent duplicate launches
      if (this.loaded) { return; }
      
      // set levels
      if (!this.levels || !this.levels.hasOwnProperty(this.env)) {
        Log.setLevel('DEBUG');
      } else {
        Log.setLevel(this.levels[this.env]);
      }
    
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine.Application = Application;
  

}(Clementine));