/**
 * ui.js | Orange UI Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2, history.js
 * @description commonly used view controllers
 */

Orange.add('ui', function(O) {

	var Binding, Form, Input, GridViewController, LightboxViewController, ListViewController, MapViewController, MultiViewController, 
			ProgressViewController, TableViewController, TabViewController, TooltipViewController, ViewController;

	var Application = __import('Application'), Model = __import('Model');
	
	Application.prototype.onLaunch = function(online) {
		
		var root = $('[data-root="true"]'),
		type = root.attr('data-control'),
		name = root.attr('data-name');
		if (typeof type === 'undefined' || typeof name === 'undefined') throw 'Root view not found';
		
		// remove root attribute
		root.removeAttr('data-root');
				
		// setup history
		History.Adapter.bind(window, 'statechange', function() {
			var State = History.getState();
			Log.info(State.data);
		});
		
		// load view
		var c = ViewController.load(type);
		var controller = new c(null, root);
		controller.onLoad();
							
	};
	
	Binding = (function() {
	
		return {
		
			bindData: function(node, item) {
			
				// check for the data format
				if (item instanceof O.Item) {
					var id = item.id(), data = item.toObject();
				} else if (typeof item === 'object') {
					var id = null, data = item;
				}
				else throw 'Invalid data item';
				
				if (id !== null) node.attr('itemid', id);
				
				// parse all the data fields
				for (var field in data) {
					var el = node.find('[itemprop="' + field + '"]');
					var childList = [];
					node.find('[itemprop="' + field + '"]').each(function() {
						var include = false, parent = $(this).parent();
						while (parent.length !== 0 && !include) {
							if ($(parent).not(node).length === 0) {
								include = true; break;
							} else if ($(parent).not('[itemscope]').length === 0) {
								include = false; break;
							} parent = $(parent).parent();
						}
						if (include) childList.push($(this));
					});
																							
					if (childList.length > 0) {
						for(var i = 0, len = childList.length; i < len; i++) {
							if (data[field] instanceof Array || data[field] instanceof O.Collection) {
								O.Binding.bindList(childList[i], data[field]);
							} else if (typeof data[field] === 'object' || data[field] instanceof O.Item) {
								O.Binding.bindData(childList[i], data[field]);
							} else childList[i].text(data[field]);
						}
					}
				}
			},
			
			bindList: function(node, list) {
						
				// check for the data format
				if (list instanceof O.Collection) {
					var data = list.toArray();
				} else if (list instanceof Array) {
					var data = list;
				}
				else throw 'Invalid data collection';
			
				var template = node.find('[itemscope]');
				var itemscope = $(template).attr('itemscope');
				
				// validate attribute exists
				if (typeof itemscope !== 'undefined' && itemscope !== false) {
					node.html('');
					for(var i=0, len = data.length; i < len; i++) {
						var instance = template.clone();
						O.Binding.bindData(instance, data[i]);
						node.append(instance);
					}
				}
			}
		}
		
	})();
	
	
	Input = Class.extend({
	
	});
	
	Input.extend = function(def) {
	
	};
	
	
	Form = Class.extend({
	
		initialize: function(target) {
			
			// set vars
			var that = this, name = $(target).attr('name');
			
			// set instance vars
			this.fields = {};
			this.target = target;

			// find all form fields
			$(target).find('input, select, textarea, button .ui-input').each(function() {
				var fieldName = $(this).attr('name');
				that.fields[fieldName] = $(this);
			});
			
		},
		
		getField: function(name) {
			if (typeof this.fields[name] !== 'undefined') {
				return this.fields[name];
			} else {
				throw "Error: Form field '" + name + "' not found";
			}
		},
		
		setField: function(name, value) {
			try {
				this.getField(name).val(value);
			} catch(e) {
				console.log('[WARN] Field "' + name +'" could not be fetched');
			}
		},
		
		getData: function() {
			var data = {};
			for (var field in this.fields) {
				var val = this.fields[field].val(), type = this.fields[field].attr('type');
				if (typeof val !== undefined && val !== null && type !== 'submit' && type !== 'button') {
					data[field] = val;
				}
			}
			return data;
		},
		
		setData: function(item) {
			var data = item;
			if (item instanceof O.Item) data = item.toObject();
			for (var field in this.fields) {
				if (typeof data[field] !== undefined && data[field] !== null) {
					this.fields[field].val(data[field]);
				}
			}
		},
		
		detach: function() {
			for (var name in this.fields) {
				this.fields[name].detach();
			}
		},
		
		destroy: function() {
			for (var name in this.fields) {
				delete this.fields[name];
			}
		}
	
	});
	
	
	ViewController = Class.extend({
	
		initialize: function(parent, target) {
				
			// set vars
			var that = this, views = [], forms = [], elements = [];
			
			// setup instance vars
			this.views = {};
			this.forms = {};
			this.elements = {};
			this.events = [];
			this.data = {};
			this.eventTarget = new O.Events(parent, this);
			
			// validate target
			if (typeof target !== 'undefined') {
				this.target = $(target);
				var _target = $(target).get(0);
			} else throw 'Invalid target';
			
			// check if parent
			this.parent = (typeof parent !== 'undefined') ? parent : null;
			if (this.parent === null) this.target.removeAttr('data-root');
						
			// validate arguments
			for (var i = 0, len = _target.attributes.length; i < len; i++) {
				if (_target.attributes[i].name.match(/data-/)) {
					this.data[_target.attributes[i].name.replace(/data-/, '')] = _target.attributes[i].value;
				}
			}
			
			// finds immediate descendant children
			var childFunc = function(selector) {
				var childList = [];
				this.target.find(selector).each(function() {
					var include = false, parent = $(this).parent();
					while (parent.length !== 0 && !include) {
						if ($(parent).not($(that.target)).length === 0) {
							include = true; break;
						} else if ($(parent).not('[data-control]').length === 0) {
							include = false; break;
						} parent = $(parent).parent();
					}
					if (include) childList.push(this);
				});
				return childList;
			}
			
			// populate child views
			views = childFunc.call(this, '[data-control]');
			forms = childFunc.call(this, 'form');
			elements = childFunc.call(this, '[data-name]:not([data-control])');
			
			// process views
			for (var i = 0, len = views.length; i < len; i++) {
				var view = $(views[i]), name = view.attr('data-name'),
						type = view.attr('data-control'), path = view.attr('data-template'),
						isRemote = (typeof path !== 'undefined' && path.length > 0);
				
				if (isRemote) {
					var source = O.View.load(path);
					view.html($(source).html());
					cloneAttributes(source, view);
					view.removeAttr('data-template');
				}
				
				var c = ViewController.load(type);
				this.views[name] = new c(this, view);
			}
			
			// process forms
			for (var i = 0, len = forms.length; i < len; i++) {
				var form = $(forms[i]), name = form.attr('name'), child = new O.Form(form);
				this.forms[name] = child;
			}
			
			// process elements
			for (var i = 0, len = elements.length; i < len; i++) {
				var el = $(elements[i]), name = el.attr('data-name');
				if (typeof name !== 'undefined' && name.length > 0) this.elements[name] = el.removeAttr('data-name');
			}
			
			// process types
			this.target.addClass(this.getClasses());
			this.target.removeAttr('data-control').removeAttr('data-name');
			
			// store for debugging
			this.type = this.getType();
			this.name = this.data.name;
							
		},
		
		getType: function() {
			return 'view';
		},
		
		getClasses: function() {
			var classes = typeof this.typeList !== 'undefined' ? this.typeList : '';
			return classes + ' ' + this.data.name;
		},

		getTriggers: function() {
			return [];
		},
		
		getBindings: function() {
			return {};
		},
		
		getStates: function() {
			return {}
		},
		
		
		setState: function(name) {
			var states = this.getStates();
			if (states.hasOwnProperty(name) || typeof states[name] === 'function') {
				states.name.call(this);
			}
			History.pushState({}, name, name); // TO DO: Fix this
		},
		
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onLoad: function() {
			
			this.onWillLoad();
			
			for (var name in this.views) {
				this.views[name].onLoad();
			}
			
			var views = this.getBindings();
			
			for (var view in views) {
				var events = views[view];
				for (var event in events) {
					if (event == 'touchclick') event = Browser.isTouch ? 'touchend' : 'click';
					var func = (typeof events[event] === 'function') ? events[event] : null;
					if (func === null) {
						var name = event.charAt(0).toUpperCase() + event.slice(1);
						func = (events[event] === true && typeof this['on' + name] === 'function') ? this['on' + name] : null;
					}
					if (func !== null && this.views.hasOwnProperty(view)) this.getView(view).on(event, $.proxy(func,  this));
					else if (func !== null && this.elements.hasOwnProperty(view)) this.getElement(view).on(event, $.proxy(func,  this));
				}
			}
			
			this.onDidLoad();
		
		},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		onUnload: function() {
		
			this.onWillUnload();

			for (var view in this.views) { this.getView(view).detach(); }
			for (var form in this.forms) { this.getForm(form).detach(); }
			for (var el in this.elements) { this.getElement(el).unbind(); }
			for (var name in this.views) { this.views[name].onUnload(); }
			
			this.onDidUnload();
		
		},
		
		getView: function(name) {
			if (name instanceof ViewController) return name;
			else if (typeof this.views[name] !== 'undefined') return this.views[name];
			throw 'Error: View "' + name + '" not found';
		},
		
		getForm: function(name) {
			if (this.forms[name] instanceof Form) return this.forms[name];
			throw 'Error: Form "' + name + '" not found';
		},

		getElement: function(name) {
			if (typeof this.elements[name] !== 'undefined') return this.elements[name];
			throw 'Error: Element "' + name + '" not found';
		},				
		
		
		hasView: function(name) {
			return typeof this._views[name] !== 'undefined';
		},
		
		hasElement: function(name) {
			return typeof this._elements[name] !== 'undefined';
		},
		
		hasForm: function(name) {
			return typeof this._forms[name] !== 'undefined';
		},
		

		on: function(event, callback, context) {
			var proxy = (typeof context !== 'undefined') ? function() { callback.apply(context, arguments); } : callback;
			return this.eventTarget.on.call(this.eventTarget, event, proxy);
		},
		
		detach: function(event, callback) {
			return this.eventTarget.detach.apply(this.eventTarget, arguments);
		},
		
		fire: function(event, data) {
			return this.eventTarget.fire.apply(this.eventTarget, arguments);
		},
		
		
		bindData: function(item, live) {
			Binding.bindData(this.target, item);
			if (live && item instanceof Model) {
				if (this.liveEvt) this.liveEvt.detach();
				var id = item.getId(), model = item.getModel();
				this.liveEvt = model.on('datachange', function(d) {
					if (item.mergeChanges(d)) Binding.bindData(this.target, item);
				}, this);
			}
		},
				
		toString: function() {
			return '[' + this.getType() + ' ' + this.data.name + ']';
		},
				
		destroy: function() {
			for (var name in this._views) {
				this.views[name].destroy();
			}
			for (var name in this._forms) {
				this.forms[name].destroy();
			}
			for (var name in this._elements) {
				delete this.elements[name];
			}
			if (this.liveEvt) this.liveEvt.detach();
			delete this.target;
			delete this.parent;
			delete this.eventTarget;
		}
	
	});
	
	ViewController.views = { 'view': ViewController };
	ViewController.prototype.typeList = '';
	
	ViewController.extend = function(def) {
	
		var m = Class.extend.call(this, def),
				type = def.getType();

		var required = ['getType'];
		for (var i = 0, len = required.length; i < len; i++) {
			if (!def.hasOwnProperty(required[i])) throw "Class missing '" + required[i] + "()' implementation";
			m[required[i]] = def[required[i]];
		}
		m.prototype.typeList += ((m.prototype.typeList == '') ? '' : ' ') + type;
		m.extend = arguments.callee;
		
		return ViewController.views[type] = m;
	
	};
	
	ViewController.load = function(name) {
		if (!this.views.hasOwnProperty(name)) throw "View '" + name + '" not found';
		return this.views[name];
	};
	
	
	MultiViewController = ViewController.extend({
	
		getType: function() { return 'multi-view' },
		
		initialize: function(parent, target) {
			this._super(parent, target);
			this.defaultView = this.target.attr('data-default');
			this.target.removeAttr('data-default');
		},
		
		onLoad: function() {
			for (var i in this._views) {
				if (this._views[i].name !== this.defaultView) {
					this._views[i].target.hide();
				} else {
					this.activeView = this._views[i];
				}
			}
			this._super();
		},
		
		activateView: function(name) {
			var view = this.getView(name);
			if (view instanceof O.ViewController) {
				this.activeView.target.hide();
				this.activeView = view;
				this.activeView.target.show();
			}
		},
		
		getActiveView: function() {
			return this.activeView.name;
		}
	
	});
	
	O.Binding = Binding;
	O.Form		= Form;
	O.Input	= Input;
	
	O.GridViewController			= GridViewController;
	O.LightboxViewController	= LightboxViewController;
	O.ListViewController			= ListViewController;
	O.MapViewController				= MapViewController;
	O.MultiViewController			= MultiViewController;
	O.ProgressViewController	= ProgressViewController;
	O.TableViewController			= TableViewController;
	O.TabViewController				= TabViewController;
	O.TooltipViewController		= TooltipViewController;
	O.ViewController					= ViewController;
	
}, ['mvc'], '1.0.2');