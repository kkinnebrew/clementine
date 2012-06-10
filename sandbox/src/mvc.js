/**
 * mvc.js | Orange MVC Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2
 * @description base model-view-controller classes
 */

Orange.add('mvc', function(O) {

	var Application, Controller, View;
	
	// import dependencies
	var Ajax 			= __import('Ajax'),
			Cache 		= __import('Cache'),
			Events 		= __import('Events'),
			Loader 		= __import('Loader'), 
			Location 	= __import('Location'),
			Storage 	= __import('Storage');

	/**
	 * the application stores all the configuration and
	 * initial loading logic. the onLoad() method should be
	 * overriden for a custom application.
	 */
	Application = Class.extend({
	
		initialize: function(name, config) {
			
			this.name = name.replace(/[^A-Za-z:0-9_\[\]]/g);
			this.config = config;
			this.isOnline = false;
			this.isLoaded = false;
			
			// load dependencies
			for (var i = 0, len = this.config.required.length; i < len; i++) {
				Loader.loadModule(this.config.required[i]);
			}
			
			// bind onload to window
			window.onload = Class.proxy(function() {
				this.isLoaded = true;
				this.onLoad();
				Cache.init();
			}, this);
			
			// set logging
			if (this.config.hasOwnProperty('logging')) Log.setLevel(this.config.logging);
			
			// bind offline events
			Cache.on('statusChange', Class.proxy(function(e) {
								
				if (!this.isLoaded) return;
				
				if (e.data == 1) {
					Storage.goOnline();
					if (this.config.location) Location.get();
					this.onOnline.call(this);
				} else {
					Storage.goOffline();
					this.onOffline.call(this);
				}
				
			}, this));
				
			// handle versioning
			if (Storage.get('appVersion') !== this.config.version) {
				Storage.set('appVersion', this.config.version)
			}

		},
		
		onLoad: function() {}, // run at first load before anything else
		onOffline: function() {}, // run before the application goes offline
		onOnline: function() {}, // run before the application comes online
		
		goOnline: function() {
			this.isOnline = true;
		},
		
		goOffline: function() {
			this.isOnline = false;
		},
		
		isOnline: function() {
			return this.isOnline;
		}
	
	});
	
	/**
	 * this is the base controller class
	 * which will be overriden by other controllers
	 */
	Controller = Class.extend({
	
		initialize: function() {},
		destroy: function() {}
	
	});
	
	/**
	 * views can be stored externally and loaded dynamically
	 * via a given path. when loading different views from the
	 * same file, a type and or name should be included. for overriding
	 * default views, only the last view will be used if duplicates exist.
	 */
	View = (function() {
	
		var views = {};
	
		var fetch = function(path) {
						
			if (views.hasOwnProperty(path)) return views[path];
			
			var view = $.ajax({
				async: false,
		    contentType: "text/html; charset=utf-8",
		    dataType: "text",
		    timeout: 10000,
		    url: path,
		    success: function() {},
		    error: function() {
					throw "Error: template not found";
		    }
			}).responseText;
			
			views[path] = view;
			
			return view;
			
		};
	
		return {
		
			load: function(path, type, name) {
				
				if (typeof path === 'undefined' || path == '') return;

				var source = fetch(path), views, view;
				
				if ($(source).length > 1) views = $('<div>' + source + '</div>');
				else if (typeof type == 'undefined' && typeof name == 'undefined') return $(source);

				if (typeof type !== 'undefined' && typeof name !== 'undefined') {
					view = views.find('[data-control="' + type + '"][data-name="' + name + '"]:last');
				} else if (typeof type !== 'undefined') {
					view = views.find('[data-control="' + type + '"]:last');
				} else throw 'View not found';
								
				if (view.length) return view;
				else throw 'View not found';
				
			}
			
		}
	
	})();

	/**
	 * the base source class is overridden to
	 * provide custom handling of different types of
	 * data sources. the config.name property is required.
	 */
	Source = Class.extend({
	
		initialize: function(config) {
			if (typeof config === 'undefined') return;
			this.config = config;
		},
		
		getName: function() {
			return (this.config || {}).hasOwnProperty('name') ? this.config.name : 'source';
		},
		
		supportsModels: function() {
			return false;
		},
		
		isPersistent: function() {
			return false;
		}
	
	});
	
	/**
	 * overrides the base data source to allow for data requests
	 * via ajax
	 */
	AjaxSource = Source.extend({
		
		request: function(config) {
		
			if (Cache.isActive() && !Cache.isOnline()) {
				Log.warn('Could not connect to server');
				return;
			}
		
			var success = (typeof config.success === 'function') ? config.success : null;
			var error = (typeof config.error === 'function') ? config.error : null;
			var complete = (typeof config.complete === 'function') ? config.complete : null;
		
			if (typeof config.context !== 'undefined') {
				if (success) success = function() { success.apply(context, arguments); };
				if (error) error = function() { error.apply(context, arguments); }
				if (complete) complete = function() { complete.apply(context, arguments); }
			}
			
			var req = { url: config.url, type: config.type };
			
			if (config.hasOwnProperty('async')) req.async = config.async;
			if (config.hasOwnProperty('data')) req.data = config.data;
			if (config.hasOwnProperty('dataType')) req.dataType = config.dataType;
			if (config.hasOwnProperty('contentType')) req.contentType = config.contentType;
			if (success) req.success = success;
			if (error) req.error = error;
			if (complete) req.complete;
			
			return Ajax.load(req);
		}
	
	});

	O.Application = Application;
//	O.Collection	= Collection;
	O.Controller	= Controller;
//	O.Model				= Model;
//	O.Source			= Source;
	O.View				= View;
//	
	O.AjaxSource 								= AjaxSource;
//	O.LocalStorageSource 				= LocalStorageSource;
//	O.RestSource 								= RestSource;
//	O.PersistenceManager				= PersistenceManager;
//	O.PersistentStorageSource		= PersistentStorageSource;
	
}, [], '0.3');