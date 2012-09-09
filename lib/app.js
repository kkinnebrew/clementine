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
      if (!config.hasOwnProperty('name')) { throw 'Invalid application'; }
    
      // store configs
      this.name = config.name;
      this.version = config.hasOwnProperty('version') ? config.version : null;
      this.required = config.hasOwnProperty('required') ? config.required : [];
      this.loaded = false;
      this.online = false;
      
      this.env = config.hasOwnProperty('env') ? config.env : 'PROD';
       
      // load dependencies
      for (var i = 0, len = this.required.length; i < len; i++) {
        Loader.loadModule(this.required[i]);
      }
            
      // setup vars
      this.servicePaths = {};
      this.services = {};
      this.serviceConfig = {};
      this.authService = null;
      this.constants = {};
      this.templates = [];
      
      // states
      this.authenticated = false;
      this.viewLoaded = false;
      
    },
    
    
    // features management
    
    loadServices: function() {
    
      // initialize services
      for (var service in this.serviceConfig) {
      
        // lookup service
        var s = Service.get(service);
        
        // get config
        var config = this.serviceConfig[service];
        var params = {};
        
        // get paths
        if (Object.keys(config.paths).length > 0 && typeof config.paths[this.env] !== undefined) {
          params = { path: config.paths[this.env], auth: config.auth };
        } else {
          params = { path: this.servicePaths[this.env], auth: config.auth };
        }
        
        // create new instance
        var svc = new s(params.path, params.auth);
        
        // store service
        this.services[service] = svc;
      }
    
    },
    
    authenticate: function(success, failure, context) {
      
      // check if defined
      if (!this.authService) {
        success.call(context);
        return;
      }
      
      // check for service
      if (!this.services.hasOwnProperty(this.authService)) {
        throw 'Cannot load authentication service';
      }
      
      // get service
      var service = this.services[this.authService];
      
      // attempt to authenticate
      if (typeof service.authenticate === 'function') {
        service.authenticate(success, failure, context);
      } else {
        throw 'Authentication service must implement authenticate()';
      }
      
    },
    
    
    // environment setup
    
    setEnvironment: function(env) {
      this.env = env;
    },
    
    setLogging: function(levels) {
      this.levels = levels;
    },
    
    
    // constant management
    
    setConstant: function(name, value) {
      this.constants[name] = value;
    },
    
    getConstant: function(name) {
      return this.constants.hasOwnProperty(name) ? this.constants[name] : null;
    },
    
    // services management
    
    getService: function(name) {
      return this.services.hasOwnProperty(name) ? this.services[name] : null;
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
    
    registerServicePaths: function(paths) {
      this.servicePaths = paths;
    },
    
    
    // view management
    
    registerViews: function(views) {
      if (views instanceof Array) {
        this.templates = views;
      }
    },
    
    
    // event handling
    
    onHashChange: function(last) {
      
      // get the hash
      var hash = location.hash;
      
      if (hash.substr(0,2) === '#!') {
        hash = hash.replace('#!', '');
      } else {
        hash = hash.replace('#', '');
      }
      
      
      var route = [];
      
      if (hash.charAt(0) === '/') {
        hash = hash.substr(1);
      }
      
      route = hash.split('/');
      
      // set the hash to the root controller
      this.root.setHashRoute(route.slice(0));
    
    },
    
    onOnline: function() {
      
      if (!this.online) {
        console.log('Application: Went online');
      }
      
      // store connection
      this.online = true;
      
      // pass to services
      for (var service in this.services) {
        this.services[service].goOnline();
      }
      
      // pass to storage
      Storage.goOnline();
      
      // pass to controllers
      if (this.root) {
        this.root.goOnline();
      }
      
    },
    
    onOffline: function() {
      
      if (this.online) {
        console.log('Application: Went offline');
      }
      
      // store connection
      this.online = false;
      
      // pass to services
      for (var service in this.services) {
        this.services[service].goOffline();
      }
      
      // pass to storage
      Storage.goOffline();
      
      // pass to controllers
      if (this.root) {
        this.root.goOffline();
      }
      
    },
    
    onAuthSuccess: function() {
      
      if (this.authService) {
        console.log('User: Authenticated successfully');
      }
      
      // find root element
      var rootEl = $('[data-root]');
      
      if (rootEl.length === 0) {
        throw 'Invalid Markup: No [data-root] view found';
      }
      
      var control = rootEl.attr('data-control');
      
      if (!control) {
        throw 'Invalid Markup: Root View missing [data-control]';
      }
      
      // find root controller
      var c = ViewController.get(control);
      
      // initialize root
      this.root = new c(null, rootEl, this);
      
      // load the app
      this.root.load().show();
      
      // set network status
      if (this.online) {
        this.root.goOnline();
      } else {
        this.root.goOffline();
      }
            
      // bind hash change
      $(window).on('hashchange', proxy(this.onHashChange, this));
      
      // trigger hash change
      $(window).trigger('hashchange');
      
      // show the application
      $('body').show();
            
    },
    
    onAuthFailure: function() {
      
      // redirect to login, or something
      console.log("Could not authenticate");
      
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
      
      // handling versioning
      var version = Storage.get('appversion');
      var env = Storage.get('appenv');
      
      if (this.version && (this.version !== version || this.env !== env)) {
        
        // flush storage
        Storage.flush(true);
        
        // store new version and env codes
        Storage.set('appversion', this.version);
        Storage.set('appenv', this.env);
        
      }
      
      // check network status
      Cache.init(function(online) {
        
        // init services
        this.loadServices();
        
        // set connection
        if (online) {
          this.onOnline();
        } else {
          this.onOffline();
        }
        
        // bind cache event
        Cache.on('online', function(e) {
          
          if (e.data) {
            this.onOnline();
          } else {
            this.onOffline();
          }
          
        }, this);
        
        // authenticate the user
        this.authenticate(proxy(function() {
          this.authenticated = true;
          if (this.viewLoaded) {
            this.onAuthSuccess.call(this);
          }
        }, this), this.onAuthFailure, this);
        
        // load the underlying views
        View.register(this.templates, proxy(function() {
          this.viewLoaded = true;
          console.log('Views: loaded and cached');
          if (this.authenticated) {
            this.onAuthSuccess.call(this);
          }
        }, this));
        
      }, this);
    
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Global Functions
  // ------------------------------------------------------------------------------------------------
  
  function config(fn) {
    if (typeof fn === 'function') {
      $(document).ready(function() {
        $('body').hide();
        var config = $('[data-app]').text();
        if (config) {
          config = JSON.parse(config);
          var app = new Application(config);
          fn.call(this, app);
          app.launch();
        }
      });
    }
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application  = Application;
  Orange.config       = config;
  

}(Orange));