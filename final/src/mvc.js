/**
 * mvc.js | Orange MVC Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons
 * @description base model-view-controller classes
 */

Orange.add('mvc', function(O) {

	var Application, Collection, Controller, Model, Source, View,
			__keyFilterRegex = /[^A-Za-z:0-9_\[\]]/g;
	
	var Cache = __import('Cache'), Storage = __import('Storage'), 
			Loader = __import('Loader'), Location = __import('Location'),
			Events = __import('Events');
	
	Application = Class.extend({
		
		initialize: function(name, config) {
			this.name = name.replace(__keyFilterRegex);;
			this.config = config;
			this.isOnline = false;
		},
		
		launch: function() {
		
			for (var i = 0, len = this.config.required.length; i < len; i++) {
				Loader.loadModule(this.config.required[i]);
			}
		
			if (this.config.hasOwnProperty('logging')) Log.setLevel(this.config.logging);
		
			Cache.on('statusChange', Class.proxy(function(e) {
				if (e.data == 1) {
					Storage.goOnline();
					if (this.config.location) Location.fetch();
					Log.debug('Application "' + this.name + '" online');
				} else {
					Log.debug('Application "' + this.name + '" online');
					Storage.goOffline();
				}
				this.onLaunch(e.data);
			}, this));
			
			Cache.init(this.config.poll);
		},
		
		onLaunch: function(online) {},
		
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
	
	
	Controller = Class.extend({
		
		initialize: function() {},
		
		destroy: function() {}
		
	});
	
	
	Model = Class.extend({
		
		initialize: function(data) {
			this.getName();
			var field = this.constructor.getKey();
			this.isSaved = (data || {}).hasOwnProperty(field);
			this.id = this.isSaved ? data[field] : null;
			this.data = data || {};
		},
		
		getName: function() {
			throw 'Cannot instantiate model';
		},
		
		getFields: function() {
			throw 'Cannot instantiate model';
		},
		
		getSource: function() {
			throw 'Cannot instantiate model';
		},
		
		get: function(name) {
			return this.data[name];
		},
		
		set: function(name, value) {
			this.data[name] = value;
			this.isSaved = false;
		},
		
		clear: function() {
			delete this.data[name];
			this.isSaved = false;
		},
		
		refresh: function() {
			var item = this.constructor.get(this.getId());
			this.data = item.toObject();
			this.isSaved = true;
			// prevent duplicate refreshes
		},
		
		save: function(success, error, context) {
			if (this.isSaved) return;
			var successFunc = function(data) {
				this.isSaved = true;
				if (typeof success === 'function') success(data);
			};
			this.constructor.set(this.data, Class.proxy(successFunc, this), error, context);
		},
		
		remove: function(success, error, context) {
			if (this.exists()) {
				this.constructor.remove(this.id, success, error, context);
			}
			this.destroy();
		},
		
		isSaved: function() {
			return this.isSaved;
		},
		
		exists: function() {
			return this.id !== null;
		},
		
		getId: function() {
			return this.id;
		},
		
		toObject: function() {
			return this.data;
		},
		
		destroy: function() {
			this.isSaved = false;
			this.id = null;
			this.data = {};
		}
		
	});
	
	Model.getKey = function() {
		var fields = this.getFields();
		for(var field in fields) {
			if (fields[field].hasOwnProperty('primaryKey')) return field;
		}
	};
	
	Model.getId = function() {
		var fields = this.getFields();
		for(var field in fields) {
			if (fields[field].hasOwnProperty('primaryKey')) return fields[field].name;
		}
	};
	
	Model.getAll = function(query, success, error, context) {
		var successFunc = function(data) {
			var mappedData = Model.mapItems.call(this, data);
			success.call((typeof context === 'function' ? context : this), new Collection(this, mappedData));
		};
		this.getSource().getAll(this.getName(), Class.proxy(successFunc, this), error);
	};
	
	Model.get = function(id, success, error, context) {
		var successFunc = function(data) {
			var mappedData = Model.mapItem.call(this, data);
			success.call((typeof context !== 'undefined' ? context : this), new this(mappedData));
		};
		this.getSource().get(this.getName(), id, Class.proxy(successFunc, this), error);
	};
	
	Model.set = function(item, success, error, context) {
		if (item instanceof Model) item = item.toObject();
		var id = item.hasOwnProperty(this.getKey()) ? item[this.getKey()] : null;
		var successFunc = function(data) {
			var mappedData = Model.mapItem.call(this, data);
			if (typeof success === 'function') success.call((typeof context !== 'undefined' ? context : this), new this(mappedData));
			this.fire('datachange', [ { action: (id == null ? 'sync' : 'set'), id: mappedData[this.getKey()] } ]);
		};
		this.getSource().set(this.getName(), id, Model.unmapItem.call(this, item), Class.proxy(successFunc, this), error);
	};
	
	Model.remove = function(id, success, error) {
		var deltaId = id;
		var successFunc = function(data) {
			if (typeof success === 'function') success.call(this, deltaId);
			this.fire('datachange', [ { action: 'remove', id: deltaId } ]);
		};
		this.getSource().remove(this.getName(), id, Class.proxy(successFunc, this), error);
	};
	
	Model.on = function(ev, call, context) {
		var proxy = (typeof context !== 'undefined') ? function() { call.apply(context, arguments); } : call;
		return this.events.on.call(this.events, ev, proxy);
	},
	
	Model.fire = function() {
		return this.events.fire.apply(this.events, arguments);
	},
	
	Model.detach = function() {
		return this.events.detach.apply(this.events, arguments);
	},
	
	Model.mapItem = function(data) {
		var model = {}, fields = this.getFields();											
		for (var field in fields) {
			var source = fields[field].name, 
					value = (data.hasOwnProperty(source)) ? data[source] : undefined;		
			if (value === undefined) {
				Log.warn("Could not parse JSON field '" + field + "' for " + this.getName());
				continue;
			}
			model[field] = value;
		}
		return model;
	},
	
	Model.mapItems = function(data) {
		var models = {}, id = this.getKey();
		for (var i = 0, len = data.length; i < len; i++) {
			var model = Model.mapItem.call(this, data[i]);
			if (typeof model === 'object') models[model[id]] = model;
		}	
		return models;	
	},
	
	Model.unmapItem = function(object) {	
		var data = {}, fields = this.getFields();
		for (var field in fields) {
			if (this.getKey() == field && !object.hasOwnProperty(this.getKey())) {
				continue;
			}
			var source = fields[field].name,
					value = (typeof object[field] !== 'undefined') ? object[field] : undefined;
			if (value === undefined && !fields[field].nullable) {
				Log.warn("Missing data for field '" + field + "' for " + this.getName());
				continue;
			}		
			data[source] = value;
		}
		return data;
	}
	
	Model.extend = function(def) {
		
		var m = Class.extend.call(this, def);
				
		var required = ['getName', 'getId', 'getFields', 'getSource'];
		for (var i = 0, len = required.length; i < len; i++) {
			if (!def.hasOwnProperty(required[i])) throw "Class missing '" + required[i] + "()' implementation";
			m[required[i]] = def[required[i]];
		}
		
		var source = def.getSource();
		if (!source.supportsModels()) throw "Source '" + source.getName() + "' does not support models";
		
		m.events = new Events(null, this);
		
		m.getKey = function() { return Model.getKey.apply(m, arguments); };
		m.getAll = function() { return Model.getAll.apply(m, arguments); };
		m.get = function() { return Model.get.apply(m, arguments); };
		m.set = function() { return Model.set.apply(m, arguments); };
		m.remove = function() { return Model.remove.apply(m, arguments); };
		
		m.on = function() { return Model.on.apply(m, arguments); };
		m.fire = function() { return Model.fire.apply(m, arguments); };
		m.detach = function() { return Model.detach.apply(m, arguments); };
		
		return m;
			
	};
	
	
	View = (function() {
	
		var views = {};
	
		return {
			load: function(path) {
				return views[path];
			}
		}
	
	})();
	
	
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

	
	Collection = Class.extend({
		
		initialize: function(model, data) {
			this.model = model
			this.data = data;
			this.active = data;
			this.list = this.toArray();
		},
		
		getModel: function() {
			return this.model;
		},
		
		count: function() {
			return this.list.length;
		},
		
		get: function(id) {
			return this.data.hasOwnProperty(id) ? new this.model(this.data[id]) : null;
		},
		
		filter: function(callback) {
			if (typeof callback === 'function' && this.active !== undefined) {
				for(var id in this.active) {
					if (!callback.call(this, this.active[id] || {})) delete this.active[id];
				}
			}
		},
		
		clearFilters: function() {
			this.active = this.data;
		},
		
		toArray: function() {
			var output = [];
			for (var id in this.active) {
				output.push(this.active[id]);
			}
			return output;
		},
		
		toObject: function() {
			return this.active;
		}
		
	});
	
	
	O.Application = Application;
	O.Collection	= Collection;
	O.Controller	= Controller;
	O.Model				= Model;
	O.Source			= Source;
	O.View				= View;
	
}, [], '1.0.2');