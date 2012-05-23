Orange.add('mvc', function() {

	var Application, Collection, Controller, Form, Element, Model, Source, View, ViewController
			__include = function(def, base) {},
			__extend = function() {};
			
	var Ajax = Orange.import('Ajax'),
			Cache = Orange.import('Cache'),
			Class = Orange.import('Class'),
			EventTarget = Orange.import('EventTarget'),
			Log = Orange.import('Log');


	Application = Class.define({
		
		initialize: function(name, config) {
			this.name = name;
			this.config = config;
			this.isOnline = false;
		},
		
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

	__include(Application, EventTarget);
	
	
	Source = Class.define({

		initialize: function(config) {
			this.config = config;
		},
		
		getName: function() {
			return this.config.name;
		},
		
		getPath: function() {
			return this.config.path;
		},
		
		isPersistent: function() {
			return this.config.isPersistent;
		},
		
		request: function(config) {
		
			if (Cache.isActive() && !Cache.isOnline()) {
				Log.warn('Could not connect to server');
				return;
			}
		
			var success = (typeof config.success === 'function') ? config.success : null;
			var error = (typeof config.error === 'function') ? config.error : null;
		
			if (typeof config.context !== 'undefined') {
				if (success) success = function() { success.apply(context, arguments); };
				if (error) error = function() { error.apply(context, arguments); }
			}
			
			var req = { url: config.url, type: config.type };
			
			if (config.hasOwnProperty('async')) req.async = config.async;
			if (config.hasOwnProperty('data')) req.data = config.data;
			if (config.hasOwnProperty('contentType')) req.contentType = config.contentType;
			if (success) req.success = success;
			if (error) req.error = error;
			
			req.complete = function(t) {
				Log.info('HTTP ' + t.status);
			};
			
			return Ajax(req).responseText;
		
		}
		
	});


	Model = (function() {
	
	})();

	
	Collection = (function() {
	
	})();


	Controller = (function() {
	
	})();
	
	
	ViewController = (function() {
	
	})();
	

	View = (function() {
	
	
	})();
	
	
	Form = (function() {
	
	})();
	
	
	Element = (function() {
	
	})();
	
	
	Orange.Application = Application;
	
	Orange.Source = Source;	
	Orange.Collection = Collection;
	Orange.Model = Model;
	
	Orange.Controller = Controller;
	Orange.View = View;
	
	Orange.ViewController = ViewController;
	Orange.Form = Form;
	Orange.Element = Element;

}, ['mvc'], '1.0.2');