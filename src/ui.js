/**
 * ui.js | OrangeUI 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2
 * @description base view and controllers
 */

Orange.add('ui', function(O) {

	/* view handling */

	O.View = (function() {
	
		var _views = {};
		
		return {
		
			define: function(def) {
				var c = O.extend(O.ViewController, def), type = def.type;
				c.prototype.typeList = 'ui-view ' + type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _views[type] = c;
			},
			
			extend: function(base, def) {
				var c = O.extend(base, def), type = def.type;
				c.prototype.typeList += ' ' + type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _views[type] = c;
			},
			
			load: function(name) {
				var view;
				if (name === 'ui-view') {
					return O.ViewController;
				}
				else if (typeof (view = _views[name]) !== 'undefined') {
					return view;
				} else throw "Error: View '" + name + "' not found";
			}
		
		};
	
	})();
	

	O.ViewController = O.define({
	
		type: 'ui-view',
	
		initialize: function(parent, target) {
				
			var that = this;
					
			this.target = $(target);
			this.name = this.target.attr('data-name');
			
			if (this.target.length === 0) throw 'Invalid view source';
			
			this._views = {};
			this._forms = {};
			this._elements = {};
			this._eventTarget = new O.EventTarget(parent, this);
			
			var viewList = [];
			
			this.target.find('[data-view]').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					parent = $(parent).parent().not(that.target);
					if ($(parent).not('[data-view]').length === 0) count++;
				}
				if (count === 0) viewList.push(this);
			});
						
			for(var i=0, len = viewList.length; i < len; i++) {
				var view = $(viewList[i]),
						name = view.attr('data-name'),
				 		type = view.attr('data-view'),
				 		isRemote = (typeof view.attr('data-template') !== 'undefined') ? view.attr('data-template').length > 0 : false,
				 		path = view.attr('data-template');
				 						
				if (isRemote) {
					var source = O.TemplateManager.load('templates/' + path);
					view.html($(source).html());
					cloneAttributes(source, view);
					view.removeAttr('data-remote');
				}
														 		
				var c = O.View.load(type);
				var child = new c(this, view);
				
				that._views[name] = child;
			}
			
			var formList = [];
					
			this.target.find('form').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					if ($(parent).not('[data-view]').length === 0) count++;
					parent = $(parent).parent().not(that.target);
				}
				if (count === 0) formList.push(this);
			});
						
			for(var i=0, len = formList.length; i < len; i++) {
				var form = $(formList[i]),
						name = form.attr('name'),
						child = new O.Form(form);
				this._forms[name] = child;
			}
			
			var elementList = [];
					
			this.target.find('[data-element]').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					if ($(parent).not('[data-view]').length === 0) count++;
					parent = $(parent).parent().not(that.target);
				}
				if (count === 0) elementList.push(this);
			});
						
			for(var i=0, len = elementList.length; i < len; i++) {
				var el = $(elementList[i]),
						name = el.attr('data-name'),
				 		type = el.attr('data-element'),
				 		isRemote = (typeof el.attr('data-template') !== 'undefined') ? el.attr('data-template').length > 0 : false,
				 		path = el.attr('data-template');
				 						
				if (isRemote) {
					var source = O.TemplateManager.load('elements/' + path);
					el.html($(source).html());
					cloneAttributes(source, el);
					el.removeAttr('data-template');
				}
														 		
				var c = O.Element.load(type);
				var child = new c(this, el);
				
				that._elements[name] = child;
			}
						
			this.target.addClass(this.typeList);
						
			console.log("[INFO] View '" + this.name + "' of type '" + this.type + "' initialized");
		
		},
		
		getView: function(name) {
			if (typeof this._views[name] !== 'undefined') return this._views[name];
			throw 'Error: View "' + name + '" not found';
		},
		
		getForm: function(name) {
			if (this._forms[name] instanceof O.Form) return this._forms[name];
			throw 'Error: Form "' + name + '" not found';
		},
		
		on: function() {
			return this._eventTarget.on.apply(this._eventTarget, arguments);
		},
		
		detach: function() {
			return this._eventTarget.detach.apply(this._eventTarget, arguments);
		},
		
		fire: function() {
			return this._eventTarget.fire.apply(this._eventTarget, arguments);
		},
		
		find: function(selector) {
			return $(this.target).find(selector);
		},
		
		onLoad: function() {
			this.target.removeAttr('data-name');
			this.target.removeAttr('data-view');
			for (var name in this._views) {
				this._views[name].onLoad();
			}
			for (var name in this._elements) {
				this._elements[name].onLoad();
			}
		},
		
		onUnload: function() {
			for (var name in this._views) {
				this._views[name].onUnload();
			}
		},
		
		destroy: function() {
			for (var name in this._views) {
				this._views[name].destroy();
			}
			for (var name in this._forms) {
				this._forms[name].destroy();
			}
			for (var name in this._elements) {
				this._elements[name].destroy();
			}
		}
	
	});
	
	
	/* element handling */
	
	O.Element = (function() {
	
		var _elements = {};
		
		return {
		
			define: function(def) {
				var c = O.extend(O.ElementController, def), type = def.type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _elements[type] = c;
			},
			
			extend: function(base, def) {
				var c = O.extend(base, def), type = def.type;
				if(typeof type === 'undefined') throw "Error: Class not named";
				return _elements[type] = c;
			},
			
			load: function(name) {
				var el;
				if (name === 'ui-element') {
					return O.ElementController;
				}
				else if (typeof (el = _elements[name]) !== 'undefined') {
					return el;
				} else throw "Error: Element '" + name + "' not found";
			}
		
		};
	
	})();
	
	O.ElementController = O.define({
	
		type: 'ui-element',
	
		initialize: function(parent, target) {
		
			var that = this;
			if(typeof target === 'undefined') {
				target = O.TemplateManager.load('src/elements/' + this.type + '.html');
			}
					
			this.source = (target.html) ? target.html() : target;
			this.data = {};
			this.target = $(target);
			this.parent = parent;
			this.name = this.target.attr('data-name');
			
			this.target.addClass(this.type);
			
			if (this.target.length === 0) throw 'Invalid view source';
		
		},
		
		onLoad: function() {
		
			//this.data = { name: 'Kevin', food: [{ name: "Apple" }, { name: "Orange" }] };
			this.processTemplate();
			this.target.removeAttr('data-element');
			
		},
		
		processTemplate: function() {
		
			// process source
			var source = this.source;
			template = new jsontemplate.Template(source);
			var output = '';
			try {
				output = template.expand(this.data);
			} catch(e) {
				output = source.replace(/{[^)]*}/, '[undefined]');
			}
			this.target.html(output);
			
		},
		
		setData: function(data) {
			this.data = data;
		},
		
		destroy: function() {
			this.data = null;
			this.source = null;
			this.target = null;
			this.name = null;
			delete this.data;
			delete this.source;
			delete this.target;
			delete this.name;
		}
	
	});
	
	
	/* form handling */

	O.Form = O.define({
	
		initialize: function(target) {
			
			var that = this;
			this._fields = {};
			this._target = target;
			
			var name = $(target).attr('name');

			$(target).find('input, select, textarea').each(function() {
				var fieldName = $(this).attr('name');
				that._fields[fieldName] = $(this);
			});
			
			console.log("[INFO] Form '" + name + "' initialized");
		},
		
		get: function(name) {
			if (typeof this._fields[name] !== 'undefined') {
				return this._fields[name];
			}
		},
		
		destroy: function() {
			for (var name in this._fields) {
				this._fields[name].detach();
			}
		}
		
	});
	
	
	/* template handling */
	
	O.TemplateManager = (function() {
		
		var _templates = {},
		
		_fetch = function(path) {
			return $.ajax({
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
		};
		
		return {
		
			load: function(path) {
				if (typeof _templates[path] !== 'undefined') {
					return _templates[path];
				} else {
					return _fetch(path);
				}				
			}
		
		}
	
	})();

}, ['db'], '0.1');