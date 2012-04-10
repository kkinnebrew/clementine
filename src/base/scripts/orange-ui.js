/**
 * orange-ui-0.1.js | OrangeUI 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-commons-0.1, jquery-1.7.2
 * @description adds base controller elements
 */

Orange.add('ui', function(O) {

	O.namespace('UI');
	
	// stores a registry of view controllers by name
	O.UI._views = {};
	
	O.UI.define = function(name, def) {
		return O.UI._views[name] = O.extend(O.ViewController, def);
	};
	
	O.UI.extend = function(name, base, def) {
		return O.UI._views[name] = O.extend(base, def);
	};
	
	
	// template manager
	O.TemplateManager = O.define({
	
		initialize: function() {
		
			
		
		},
		
		destroy: function() {
		
		}
	
	});

	O.ViewController = O.define({
	
		name: '',
		target: null,
		parent: null,
		_source: '',
		_views: {},
		_forms: {}
	
		initialize: function(container) {
			
			// setup target
			var target = $(container).find('[data-view="' + name + '"');
			
			if(!target.length) return;
						
			this.target = target;
			this.container = container;
		
			// get all descendent views with data-view tag
			$(target).find('[data-view]').each(function() {
								
				// get view type
				var name = $(this).attr('data-view');
				
				// check if remote
				var isRemote = $(this).attr('data-remote');
				if(isRemote == 'true') {
					// fetch template
					var source = O.TemplateManager.load('name');
					$(this).replaceWith(source);
				}
				
				if(typeof O.UI._views[type] !== 'undefined') {
					var view = new O.UI._views[type](this);
					this._views.push(view);
				}
				
			});
			
			$(target).find('form').each(function() {
				var form = new O.Form(this);
				this._forms.push(form);
			});
			
			this.onLoad();
		
		},
		
		onLoad: function() {},
		
		set: function(name, value) {
		
		},
		
		setData: function(obj) {
		
		},
		
		getView: function(name) {
		
		},
		
		getForm: function(name) {
		
		},
		
		// binds live data to view
		bind: function(name, datasource) {
		
			this.datasources.push(datasource);
			datasource.on('refresh', this.onRefresh);
		
		},
		
		onRefresh: function() {
		
		},
		
		on: function() {
		
		},
		
		fire: function() {
		
		},
		
		destroy: function() {
		
			// call unLoad
		
			// disable forms
			// hide views
			// unbind events from views
			// call onUnload for forms
			// call onUnload for views
			// destroy forms
			// destroy views
		
			this.target = null;
		}
	
	});
	
	
	// wrapper for form elements
	O.Form = O.define({
	
		initialize: function() {
		
		},
		
		get: function() {
		
		},
		
		destroy: function() {
		
			// unbind events on fields
		
		}
	
	});

}, ['db'], '0.1');