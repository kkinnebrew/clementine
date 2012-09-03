// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Application;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Cache            = Orange.Cache;
  var Loader           = Orange.Loader;
  var Service          = Orange.Service;
  var Storage          = Orange.Storage;
  var View             = Orange.View;
  var ViewController   = Orange.ViewController;
  
  
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
    
    // features management
    
    loadServices: function() {
    
      // initialize services
      for (var service in this.serviceConfig) {
      
        // lookup service
        var s = Service.get(service);
        
        // get config
        var config = this.serviceConfig[service];
        
        // create new instance
        var svc = new s(config.paths[this.env], config.auth);
        
        // store service
        this.services[service] = svc;
      }
    
    },
    
    authenticate: function(success, failure, context) {
      
      // check for service
      if (this.services.hasOwnProperty(this.authService)) {
        throw 'Cannot load authentication service';
      }
      
      // get service
      var service = this.services[this.authService];
      
      // attempt to authenticate
      service.authenticate(success, failure, context);
      
    },
    
    // environment setup
    
    setEnvironment: function(env) {
      this.env = env;
    },
    
    setLogging: function(levels) {
      this.levels = levels;
    },

    
    // services management
    
    getService: function(name) {
      return this.services[name];
    },
    
    registerService: function(name, auth, paths) {
      this.serviceConfig[name] = {
        auth: auth || null,
        paths: paths || {}
      };
    },
    
    setAuthentication: function(name) {
      this.authService = name;
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
    
    onOnline: function() {
      
      // store connection
      this.online = true;
      
      // pass to services
      for (var service in this.services) {
        this.services[service].goOnline();
      }
      
      // pass to storage
      this.storage.goOnline();
      
      // pass to controllers
      this.root.goOnline();
      
    },
    
    onOffline: function() {
      
      // store connection
      this.online = false;
      
      // pass to services
      for (var service in this.services) {
        this.services[service].goOffline();
      }
      
      // pass to storage
      Storage.goOffline();
      
      // pass to controllers
      this.root.goOffline();
      
    },
    
    onAuthSuccess: function() {
      
      // bind the only event
      window.onload = proxy(this.onReady, this);
      
    },
    
    onAuthFailure: function() {
      
      // redirect to login, or something
      
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
      
      // check network status
      Cache.init(function(online) {
        
        // init services
        this.loadServices();
        
        // set connection
        if (online) {
          this.goOnline();
        } else {
          this.goOffline();
        }
        
        // bind cache event
        Cache.on('online', function(e) {
          
          if (e.data) {
            this.goOnline();
          } else {
            this.goOffline();
          }
          
        }, this);
        
        // authorize the user
        this.authenticate(this.onAuthSuccess, this.onAuthFailure, this);
        
      }, this);
    
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application = Application;
  

}(Orange));