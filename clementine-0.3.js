/**
 * Copyright (c) 2010-12 OrangeUI

 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

if (typeof(console) == "undefined") {
  console = { log: function() { }, dir: function() { } };
}

function noop() {}

function clone(o) {
	var newObj = (o instanceof Array) ? [] : {};
	for (i in o) {
	  if (i == 'clone') continue;
	  if (o[i] && typeof o[i] == "object") {
	    newObj[i] = clone(o[i]);
	  } else newObj[i] = o[i];
	} return newObj;
}

function cloneAttributes(source, destination) {
	var destination = $(destination).eq(0);
  var source = $(source)[0];
  for (i = 0; i < source.attributes.length; i++) {
      var a = source.attributes[i];
      destination.attr(a.name, a.value);
  }
}

/**
 * provides basic oop functionality including
 * inheritance, and accessing super classes
 */
Class = (function() {

	var initializing = false, fnTest = /xyz/.test(function() {xyz;}) ? /\b_super\b/ : /.*/;
	
	Class.extend = function(def) {
	
		var _super = this.prototype;
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    for (var name in def) {
      prototype[name] = typeof def[name] == "function" && typeof _super[name] == "function" && fnTest.test(def[name]) ? (function(name, fn) {
        return function() {
          var tmp = this._super;
          this._super = _super[name];
          var ret = fn.apply(this, arguments);        
          this._super = tmp;
          return ret;
        };
      })(name, def[name]) : def[name];
    }
    
    function Class() {
			if (!initializing && this.initialize) {
				this.initialize.apply(this, arguments);
			}
    }
    
    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;
    
    return Class;
	
	};
	
	Class.proxy = function(func, context) {
		var _this = context;
		return function() {
			return func.apply(_this, arguments);
		}
	};
	
	function Class() {}

	return Class;

})();

/**
 * the returned event object passed to callback
 * functions
 */	
EventTarget = (function() {	

	function EventTarget(type, currentTarget, target, data) {
		this.bubbles = true;
		this.type = type;
		this.currentTarget = currentTarget;
		this.target = target;
		this.data = data;
	}
	
	EventTarget.prototype.stopPropagation = function() {
		this.bubbles = false;
	};

	return EventTarget;

})();

/**
 * the event handle returned on every event binding
 * to maintain a reference for unbinding later
 */
EventHandle = (function() {

	function EventHandle(target, ev, call) {
		this.target = target;
		this.ev = ev;
		this.call = call;
	}
	
	EventHandle.prototype.detach = function() {
		this.target.detach(this.ev, this.call);
		delete this.target;
		delete this.ev;
		delete this.call;
		delete this;
	}
	
	return EventHandle;

})();

/**
 * the event object to bind, fire, and unbind
 * events on. this can be used in your other classes
 * to give them even functionality
 */	 
Events = (function() {

	function Events(parent, self) {
		this._listeners = {};
		this._parent = parent;
		this._self = self;
	}
	
	Events.prototype.on = function(ev, call) {
		if (!this._listeners.hasOwnProperty(ev)) {
			this._listeners[ev] = [];
		}
		this._listeners[ev].push(call);	
		return new EventHandle(this, ev, call);
	};
	
	Events.prototype.fire = function(ev, data) {
		
		var parent = this._parent;

		if (typeof ev === 'string') ev = new EventTarget(ev, this._self, this._self, data);
		if (typeof ev.type !== 'string') throw "Error: Invalid 'type' when firing event";
		
		if (this._listeners[ev.type] instanceof Array) {
			var listeners = this._listeners[ev.type];
			for (var i = 0, len = listeners.length; i < len; i++) listeners[i].call(this, ev);
		}
		if (parent != null && parent._eventTarget instanceof EventTarget && ev.bubbles) {
			ev.currentTarget = this._parent;
			parent._eventTarget.fire.call(parent._eventTarget, ev, data);
		}
		
	};
	
	Events.prototype.detach = function(ev, call) {
	
		if (this._listeners[ev] instanceof Array) {
			var listeners = this._listeners[ev];
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (typeof call !== 'undefined' && listeners[i] === call) {
					listeners.splice(i, 1);
					break;
				} else listeners.splice(i, 1);
			}
		} else if (typeof ev === 'undefined') {
			this._listeners = {};
		}
	
	};
	
	Events.prototype.destroy = function() {
		for(var listener in this._listeners) {
			listener.detach();
		}
		delete this._parent;
		delete this._self;
	};

	return Events;

})();


var ViewController = Class.extend({
			
	/**
	 * initializes the view controller and all its child 
	 * view controllers, forms, and elements
	 * @param {ViewController} parent
	 * @param {HTMLElement} parent
	 */
	initialize: function(parent, target) {
	
		// set vars
		var that = this, views = [], elements = [];
	
		// set load statuses
		this.loading = false;
		this.unloading = false;
		this.loaded = false;
		
		// setup display statuses
		this.visible = false;
		this.appearing = false;
		this.disappearing = false;
		
		// setup state statuses
		this.changing = false;
		
		// create arrays
		this.loadEvts = [];
		this.unloadEvts = [];
		this.showEvts = [];
		this.hideEvts = [];
		
		// setup instance vars
		this.views = {};
		this.elements = {};
		this.events = [];
		this.data = {};
		this.source = target.clone();
					
		// setup event target
		this.eventTarget = new Events(parent, this);
		
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
		elements = childFunc.call(this, '[data-name]:not([data-control])');
		
		// DEBUG
		console.log(this.data.name + ' ' + "Initialized");
		
		// process views
		for (var i = 0, len = views.length; i < len; i++) {
			var view = $(views[i]), name = view.attr('data-name'),
					type = view.attr('data-control'), path = view.attr('data-template'),
					isRemote = (typeof path !== 'undefined' && path.length > 0);
			
			if (isRemote) {
				var source = View.load(path);
				view.html($(source).html());
				cloneAttributes(source, view);
				view.removeAttr('data-template');
			}
			
			var c = ViewController.get(type);
			this.views[name] = new c(this, view);
		}

		// process elements
		for (var i = 0, len = elements.length; i < len; i++) {
			var el = $(elements[i]), name = el.attr('data-name');
			if (typeof name !== 'undefined' && name.length > 0) this.elements[name] = el.removeAttr('data-name').addClass(name);
		}
		
		// process types
		this.target.addClass(this.getClasses());
		this.target.removeAttr('data-control').removeAttr('data-name');
		this.target.addClass('hidden');
		
		// store for debugging
		this.type = this.getType();
		this.name = this.data.name;
	
	},
	
	/**
	 * the unique type string for the controller. this matches the
	 * data-control value used in view markup
	 */
	getType: function() {
		return 'ui-view';
	},
	
	/**
	 * returns the outputted class names for the view. by default
	 * the getType() of the view controller as well as all its parent
	 * view controllers, as well as its data-name attribute will be added
	 */
	getClasses: function() {
		var classes = typeof this.typeList !== 'undefined' ? this.typeList : '';
		return classes + ' ' + this.data.name ? this.data.name : '';
	},

	/**
	 * returns an array of strings of the events this function
	 * triggers. this is for informational / syntax readability purposes only
	 */
	getTriggers: function() {
		return [];
	},
	
	/**
	 * returns dynamic bindings of events on child views in the form
	 * { 'view-name' : { 'event' : 'callback' }
	 * the callback can be replaced with true to default to looking for a
	 * method in the format on{Event}. All callbacks are bound in the context
	 * of the view controller.
	 */
	getBindings: function() {
		return {};
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
		
		// ex. fetch data
		
		// DEBUG
		// console.log(this.data.name + ' ' + "Will Load");
		
		// fire load event
		this.fire('_load');
		
	},
	
	onLoad: function() {
	
		// run functions
		
		// load children
		for (var name in this.views) {
			this.views[name].load();
		}
		
		// DEBUG
		// console.log(this.data.name + ' ' + "Load");
	
		// fire loaded event
		this.fire('_loaded');
	
	},
	
	onDidLoad: function() {
	
		// run functions
				
		// unbind all event handlers
		for (var i = 0, len = this.loadEvts.length; i < len; i++) {
			this.loadEvts[i].detach();
		}
		
		// DEBUG
		// console.log(this.data.name + ' ' + "Did Load");
					
		// allow unloading
		this.loadEvts = [];
		this.loading = false;
		this.loaded = true;
					
		// fire public load event
		this.fire('load');
	
	},
	
	
	unload: function() {
	
		// return if already unloading
		if (this.unloading || !this.loaded) return;
		
		// hide first if visible
		if (this.visible && !this.disappearing) {
			this.vEvt = this.on('disappear', function(e) {
				this.unload();
				this.vEvt.detach();
			}, this);
			this.hide();
			return;
		}
		
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
		// console.log(this.data.name + ' ' + "Will Unload");
		
		// ex. clear data
		
		// fire unload event
		this.fire('_unload');
		
	},
	
	onUnload: function() {
		
		// unload children
		for (var name in this.views) {
			this.views[name].unload();
		}
	
		// run functions
		// console.log(this.data.name + ' ' + "Unload");
		this.target.remove();
	
		// fire unloaded event
		this.fire('_unloaded');
	
	},
	
	onDidUnload: function() {
	
		// run functions
		// console.log(this.data.name + ' ' + "Did Unload");
					
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
		// console.log(this.data.name + ' ' + "Will Appear");
		
		// bind events
		var views = this.getBindings();
											
		for (var view in views) {
			var events = views[view];
			for (var event in events) {
				var func = (typeof events[event] === 'function') ? events[event] : null;
			if (event == 'touchclick') event = Browser.isTouch ? 'touchend' : 'click';
				if (func === null) {
					var name = event.charAt(0).toUpperCase() + event.slice(1);
					func = (events[event] === true && typeof this['on' + name] === 'function') ? this['on' + name] : null;
				}
				if (func !== null && this.views.hasOwnProperty(view)) {	
						this.getView(view).on(event, $.proxy(func,  this));
				}
				else if (func !== null && this.elements.hasOwnProperty(view)) {
					this.getElement(view).on(event, $.proxy(func, this));
				}
			}
		}
		
		// fire appear event
		this.fire('_appear');
		
	},
	
	onAppear: function() {
			
		// show children
		for (var name in this.views) {
			this.views[name].show();
		}
		
		// show view
		this.target.removeClass('hidden');
		
		// run functions
		// console.log(this.data.name + ' ' + "Appear");
		
		// fire appeared event
		this.fire('_appeared');
	
	},
	
	onDidAppear: function() {
	
		// run functions
		// console.log(this.data.name + ' ' + "Did Appear");
	
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
		// console.log(this.data.name + ' ' + "Will Disappear");
		
		// unbind events
		for (var view in this.views) { this.getView(view).detach(); }
		for (var el in this.elements) { this.getElement(el).unbind(); }
		
		// fire disappear event
		this.fire('_disappear');
		
	},
	
	onDisappear: function() {
			
		// hide view
		this.target.addClass('hidden');	
		
		// show children
		for (var name in this.views) {
			this.views[name].hide();
		}
		
		// run functions
		// console.log(this.data.name + ' ' + "Disappear");
	
		// fire disappeared event
		this.fire('_disappeared');
	
	},
	
	onDidDisappear: function() {
	
		// run functions
		// console.log(this.data.name + ' ' + "Did Disappear");
	
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
	
	getElement: function(name) {
		if (typeof this.elements[name] !== 'undefined') return this.elements[name];
		throw 'Error: Element "' + name + '" not found';
	},				
	
	
	hasView: function(name) {
		return typeof this.views[name] !== 'undefined';
	},				

	hasElement: function(name) {
		return typeof this.elements[name] !== 'undefined';
	},
	
	
	setView: function(name, view) {
		console.log(this);
		if (this.views.hasOwnProperty(name)) throw "View already exists";
		this.views[name] = view;
	},
	
	clearView: function(name) {
		if (this.views.hasOwnProperty(name)) {
			this.views[name].destroy();
			delete this.views[name];
		}
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
		for (var name in this._elements) { delete this.elements[name]; }
		
		// clear references
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

ViewController.get = function(name) {
	if (name == 'ui-view') return this;
	if (!this.views.hasOwnProperty(name)) throw "View '" + name + '" not found';
	return this.views[name];
};


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
 * performs user ageent detection to determine the 
 * browser, version, os, and device for an application
 */
Browser = (function() {

	var BrowserDetect = {
	
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
			this.version = this.searchVersion(navigator.userAgent)
				|| this.searchVersion(navigator.appVersion)
				|| "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";
			
			// check device
			var useragent = navigator.userAgent.toLowerCase();
			if (useragent.search("iphone") > 0 || useragent.search("ipod") > 0) this.device = 'Phone';
			else if (useragent.search("ipad") > 0) this.device = 'Tablet';
			else if (useragent.search("mobile") > 0 && this.OS == 'Android') this.device = 'Phone';
			else if (this.OS == 'Android') this.device = 'Tablet';
			else this.device = 'Desktop';
			if (this.OS == 'Android' && useragent.search("galaxy_tab") > 0) this.device = 'Tablet';
			
			// check scrolling
			if (this.device == 'desktop') this.nativeScroll = true;
			else if (this.OS == 'iOS' && navigator.userAgent.match(/ OS 5_/i)) this.nativeScroll = true;
			else if (navigator.userAgent.match(/ HTC/i) || navigator.userAgent.match(/ Desire_A8181/i)
			  || navigator.userAgent.match(/ myTouch4G/i) || navigator.userAgent.match(/ ADR6200/i)) {
			    this.nativeScroll = true;
			} else this.nativeScroll = false;
			
		},
		
		searchString: function (data) {
			for (var i = 0; i < data.length; i++)	{
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1)
						return data[i].identity;
				}
				else if (dataProp)
					return data[i].identity;
			}
		},
		
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) return;
			var str = dataString.substring(index+this.versionSearchString.length+1).split(' ', 1).pop();
			return str.split('.', 2).join('.').replace(';', '');
		},
		
		dataBrowser: [
			{ string: navigator.userAgent, subString: "Android", versionSearch: "Android", identity: "Android" },
			{ string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
			{ string: navigator.userAgent, subString: "OmniWeb", versionSearch: "OmniWeb/", identity: "OmniWeb" },
			{ string: navigator.vendor, subString: "Apple", identity: "Safari", versionSearch: "Version" },
			{ prop: window.opera, identity: "Opera", versionSearch: "Version" },
			{ string: navigator.vendor, subString: "iCab", identity: "iCab" },
			{ string: navigator.vendor, subString: "KDE", identity: "Konqueror" },
			{ string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
			{ string: navigator.vendor, subString: "Camino", identity: "Camino" },
			{	string: navigator.userAgent, subString: "Netscape", identity: "Netscape" },
			{ string: navigator.userAgent, subString: "MSIE", identity: "Explorer", versionSearch: "MSIE" },
			{ string: navigator.userAgent, subString: "Gecko", identity: "Mozilla", versionSearch: "rv" },
			{ string: navigator.userAgent, subString: "≈", identity: "Netscape", versionSearch: "Mozilla" }
		],
		dataOS : [
			{ string: navigator.userAgent, subString: "Android", identity: "Android" },
			{ string: navigator.userAgent, subString: "iPhone", identity: "iOS" },
			{ string: navigator.userAgent, subString: "iPad", identity: "iOS" },
			{ string: navigator.platform, subString: "Win", identity: "Windows" },
			{ string: navigator.platform, subString: "Mac", identity: "Mac" },
			{ string: navigator.platform, subString: "Linux", identity: "Linux" }
		]
	
	};
	
	BrowserDetect.init();
	
	return {
		browser: BrowserDetect.browser,
		version: BrowserDetect.version,
		os: BrowserDetect.OS,
		device: BrowserDetect.device,
		scroll: BrowserDetect.nativeScroll,
		touch: (BrowserDetect.OS == 'Android' || BrowserDetect.OS == 'iOS')
	}

})();


/**
 * lookup of root view controller and default loading
 * of root view
 */
var Application = Class.extend({

	initialize: function(config) {
		
		if (!config.hasOwnProperty('name') || (new RegExp(/[^A-Za-z:0-9_\[\]]/g)).test(config.name)) throw 'Invalid application name';
	
		// store configuration
		this.config = config;
	
		window.onload = Class.proxy(this.onLoad, this);
	
	},

	onLoad: function() {
		
		// fetch root element
		var root = $('[data-root]'),
		type = root.attr('data-control'),
		name = root.attr('data-name');
		if (typeof type === 'undefined' || typeof name === 'undefined') throw 'Root view not found';
		
		// remove root attribute
		root.removeAttr('data-root');
		
		// load view
		var c = ViewController.get(type);
		var controller = new c(null, root);
		
		controller.on('load', function() {	
			controller.show();
		});
	
		// load controller	
		controller.load();
		
	}

});
