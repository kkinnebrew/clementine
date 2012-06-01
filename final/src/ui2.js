var ViewController = O.Controller.extend({
		
	initialize: function(parent, target) {
	
		// set vars
		var that = this, views = [], forms = [], elements = [];
	
		// set load statuses
		this.loading = false;
		this.unloading = false;
		this.loaded = false;
		
		// setup display statuses
		this.visible = false;
		this.appearing = false;
		this.disappearing = false;
		
		// create arrays
		this.loadEvts = [];
		this.unloadEvts = [];
		this.showEvts = [];
		this.hideEvts = [];
		
		// setup instance vars
		this.views = {};
		this.forms = {};
		this.elements = {};
		this.events = [];
		this.data = {};
		this.source = target.clone();
					
		// setup event target
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
	
		// run functions
		console.log("Initialized");
	
	},
	
	
	getType: function() {
		return 'ui-view';
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
		return {};
	},
	
	
	setState: function(name) {
		var s = this.getStates();
		if (s.hasOwnProperty(name)) s[name].call(this);
	},
	
	
	load: function() {
	
		// return if already loading
		if (this.loading || this.loaded) return;
		
		// set statuses
		this.loading = true;
		
		// bind event handlers
		this.loadEvts.push(this.on('_load', this.onLoad, this));
		this.loadEvts.push(this.on('_loaded', this.onDidLoad, this));
		
		// call onWillLoad
		this.onWillLoad();
	
	},
	
	onWillLoad: function() {
		
		// run functions
		console.log("Will Load");
		
		// ex. fetch data
		
		// fire load event
		this.fire('_load');
		
	},
	
	onLoad: function() {
	
		// run functions
		console.log(this.data.name + ' ' + "Load");
		
		// load children
		for (var name in this.views) {
			this.views[name].load();
		}
	
		// fire loaded event
		this.fire('_loaded');
	
	},
	
	onDidLoad: function() {
	
		// run functions
		console.log("Did Load");
				
		// unbind all event handlers
		for (var i = 0, len = this.loadEvts.length; i < len; i++) {
			this.loadEvts[i].detach();
		}
					
		// allow unloading
		this.loadEvts = [];
		this.loading = false;
		this.loaded = true;
					
		// fire public load event
		this.fire('load', {'asd': '123'});
	
	},
	
	
	unload: function() {
	
		// return if already unloading
		if (this.unloading || !this.loaded) return;
		
		// bind event handlers
		this.unloadEvts.push(this.on('_unload', this.onUnload, this));
		this.unloadEvts.push(this.on('_unloaded', this.onDidUnload, this));
		
		// set statuses
		this.unloading = true;
		
		// call onWillUnload
		this.onWillUnload();
	
	},
	
	onWillUnload: function() {
		
		// run functions
		console.log("Will Unload");
		
		// ex. clear data
		
		// fire unload event
		this.fire('_unload');
		
	},
	
	onUnload: function() {
	
		// run functions
		console.log("Unload");
		
		// unload children
		for (var name in this.views) {
			this.views[name].unload();
		}
	
		// fire unloaded event
		this.fire('_unloaded');
	
	},
	
	onDidUnload: function() {
	
		// run functions
		console.log("Did Unload");
					
		// unbind all event handlers
		for (var i = 0, len = this.unloadEvts.length; i < len; i++) {
			this.unloadEvts[i].detach();
		}
		
		// allow loading
		this.unloadEvts = [];
		this.unloading = false;
		this.loaded = false;
		
		// fire public unload event
		this.fire('unload');
	
	},
	
	
	show: function() {
	
		// return if already visible or appearing
		if (this.visible || this.appearing) return;
		
		// set statuses
		this.appearing = true;
		
		// bind event handlers
		this.showEvts.push(this.on('_appear', this.onAppear, this));
		this.showEvts.push(this.on('_appeared', this.onDidAppear, this));
		
		// call onWillAppear
		this.onWillAppear();
	
	},
	
	onWillAppear: function() {
		
		// run functions
		console.log("Will Appear");
		
		// bind events
		var views = this.getBindings();
		
		for (var view in views) {
			var events = views[view];
			for (var event in events) {
				var func = (typeof events[event] === 'function') ? events[event] : null;
				if (event == 'touchclick') event = O.Browser.isTouch ? 'touchend' : 'click';
				if (func === null) {
					var name = event.charAt(0).toUpperCase() + event.slice(1);
					func = (events[event] === true && typeof this['on' + name] === 'function') ? this['on' + name] : null;
				}
				if (func !== null && this.views.hasOwnProperty(view)) this.getView(view).on(event, $.proxy(func,  this));
				else if (func !== null && this.elements.hasOwnProperty(view)) {
					this.getElement(view).on(event, $.proxy(func, this));
				}
			}
		}
		
		// fire appear event
		this.fire('_appear');
		
	},
	
	onAppear: function() {
	
		// run functions
		console.log("Appear");
	
		// fire appeared event
		this.fire('_appeared');
	
	},
	
	onDidAppear: function() {
	
		// run functions
		console.log("Did Appear");
	
		// unbind all event handlers
		for (var i = 0, len = this.showEvts.length; i < len; i++) {
			this.showEvts[i].detach();
		}
		
		// allow hiding
		this.showEvts = [];
		this.appearing = false;
		this.visible = true;
		
		// fire public appear event
		this.fire('appear');
	
	},
	
		
	hide: function() {

		// return if already hidden or hiding
		if (!this.visible || this.disappearing) return;
		console.log("hide");
		// set statuses
		this.disappearing = true;
		
		// bind event handlers
		this.hideEvts.push(this.on('_disappear', this.onDisappear, this));
		this.hideEvts.push(this.on('_disappeared', this.onDidDisappear, this));
		
		// call onWillDisappear
		this.onWillDisappear();
	
	},
	
	onWillDisappear: function() {
		
		// run functions
		console.log("Will Disappear");
		
		// unbind events
		for (var view in this.views) { this.getView(view).detach(); }
		for (var form in this.forms) { this.getForm(form).detach(); }
		for (var el in this.elements) { this.getElement(el).unbind(); }
		
		// fire disappear event
		this.fire('_disappear');
		
	},
	
	onDisappear: function() {
	
		// run functions
		console.log("Disappear");
	
		// fire disappeared event
		this.fire('_disappeared');
	
	},
	
	onDidDisappear: function() {
	
		// run functions
		console.log("Did Disappear");
	
		// unbind all event handlers
		for (var i = 0, len = this.hideEvts.length; i < len; i++) {
			this.hideEvts[i].detach();
		}
		
		// allow showing
		this.hideEvts = [];
		this.disappearing = false;
		this.visible = false;
		
		// fire public disappear event
		this.fire('disappear');
	
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
	
	hasForm: function(name) {
		return typeof this._forms[name] !== 'undefined';
	},
	
	hasElement: function(name) {
		return typeof this._elements[name] !== 'undefined';
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
	
	
	toString: function() {
		return '[' + this.getType() + ' ' + this.data.name + ']';
	},
	
	find: function(selector) {
		return $(this.target).find(selector);
	},
			
	destroy: function() {
	
		// destroy views
		for (var name in this._views) { this.views[name].destroy(); }
		for (var name in this._forms) { this.forms[name].destroy(); }
		for (var name in this._elements) { delete this.elements[name]; }
		
		// clear references
		delete this.target;
		delete this.parent;
		delete this.eventTarget;
		
	}

});