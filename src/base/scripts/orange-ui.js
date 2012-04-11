/**
 * orange-ui-0.1.js | OrangeUI 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-commons-0.1, jquery-1.7.2
 * @description adds base controller elements
 */

OrangeUI.add('ui', function(O) {

	O.namespace('UI');
	
	/* private view handling */
	O._views = {};
	
	O.View.define = function(def) {
		if(typeof def.name !== 'string') throw 'Class missing name';
		return O.UI._views[name] = O.extend(O.ViewController, def);
	};
	
	O.View.extend = function(base, def) {
		if(typeof def.name !== 'string') throw 'Class missing name';
		return O.UI._views[name] = O.extend(base, def);
	};
	
	O.View.load = function(type, target) {
		var view;
		if(typeof (view = O._views[O._config + '.' + type]) !== 'undefined') {
			return new view(target);
		} else if(typeof (view = O._views[type]) !== 'undefined') {
			return new view(target);
		} else throw "Error: View not found";
	};
	
	
	/* template management */
	O.Template = (function() {
	
		var _templates = {},
		
		_fetch = function(name) {
			return $.ajax({
					async: false,
			    contentType: "text/html; charset=utf-8",
			    dataType: "text",
			    timeout: 10000,
			    url: "/" + name + ".html",
			    success: function (html) {},
			    error: function (html) {
						throw "Error: template not found";
			    }
			}).responseText;
		};
	
		return {
		
			init: function(templates) {
			
				// loads all templates on init
				for(var i = 0, length = templates.length; i < length; i++) {
					_store(_fetch(templates[i]));
				}
			
			},
		
			load: function(name) {
			
				if(typeof this._templates[name] !== 'undefined') {
					return $(this._templates[name]);
				} else {
					var template = _fetch(name);
					return $(template);
				}
				
				// returns a jQuery object containing the source of the view
				// throws template not found exception
				return $.ajax({
				    contentType: "text/html; charset=utf-8",
				    dataType: "text",
				    timeout: 10000,
				    url: "/" + name + ".html",
				    success: function (html) {
				      callback(html);
				    },
				    error: function (html) {
							throw "Error: template not found";
				    }
				});
			
			}
		
		};
	
	})();
	
	
	/* base view controller */	
	O.ViewController = O.define({
	
		name: 'view',
		
		_views: {},
		_forms: {},
		
		_eventTarget: new O.EventTarget(),
	
		initialize: function(target) {
		
			// store target
			this.target = $(target);
			this.name = this.target.attr('data-name');
			
			// process child views
			this.target.find('[data-view]').each(function() {
				
				var view = $(this); // store reference
				
				if(!view.parents('[data-view]').not(this.target).size()) {
					
					// read attributes
					var name = view.attr('data-name'),
					 		type = view.attr('data-view'),
					 		isRemote = view.attr('data-remote') == 'true';
					
					// if view is remote, load and replace in DOM
					var template = O.Template.load(name);
					view.replaceWith(template);
					 		
					// instaniate view
					var child = O.View.load(type, view);
					
					// push view to view list
					this._views[name] = child;

				}
				
			});
			
			// process form views
			this.target.find('form').each(function() {
				
				var form = $(this); // store reference
				
				if(!form.parents('[data-view]').not(this.target).size()) {
					
					// read attributes
					var name = view.attr('name');
					 		
					// instaniate view
					var child = O.Form(form);
					
					// push view to view list
					this._forms[name] = child;

				}
				
			});
		
		},
		
		onLoad: function() {
		
			// load views
			for(var name in this._views) {
				this._views[name].onLoad();
			}
		
		},
		
		getView: function(name) {
			if(typeof this._views[name] !== 'undefined') {
				return this._views[name];
			} throw 'Error: View "' + name + '" not found';
		},
		
		getForm: function(name) {
			if(typeof this._forms[name] !== 'undefined') {
				return this._forms[name];
			} throw 'Error: Form "' + name + '" not found';
		},
		
		on: function(type, listener) {
			return this._eventTarget.addEventListener(type, listener);
		},
		
		fire: function(event, data) {
			return this._eventTarget.fire(event, data);
		},
		
		onUnload: function() {
		
			// unload views
			for(var name in this._views) {
				this._views[name].onUnload();
			}
		
		},
		
		destroy: function() {
		
			// destroy views
			for(var name in this._views) {
				this._views[name].destroy();
			}
			
			// destroy forms
			for(var name in this._forms) {
				this._forms[name].destroy();
			}
		
		}
	
	});
	
	// a reference management wrapper for form elements
	O.Form = O.define({
	
		_fields: {}
	
		initialize: function(target) {
		
			this.target = $(target);
			this.name = this.target.attr('name');
			
			target.find('input select textarea').each(function() {
				var name = $(this).attr('name');
				this._fields[name] = $(this);
			});
		
		},
		
		get: function(name) {
			if(typeof this._fields[name] !== 'undefined') {
				return this._fields[name];
			}
		},
		
		destroy: function() {
			for(var name in _fields) {
				delete this._fields[name];
			}
		}
	
	});

}, [], '0.1');