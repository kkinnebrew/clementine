/**
 * db.js | Orange DB Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc
 * @description adds common data source types
 */

Orange.add('db', function(O) {

	var AjaxSource, LocalStorageSource, RestSource, SessionStorageSource;
	
	var Cache = __import('Cache'), Storage = __import('Storage'), Ajax = __import('Ajax'), Source = __import('Source');
	
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
	
	
	LocalStorageSource = Source.extend({
	
		isPersistent: function() {
			return true;
		},
		
		supportsModels: function() {
			return true;
		},
		
		getPath: function(type) {
			return this.getName() + ':' + 'model:' + type;
		},
		
		getAll: function(type) {
			return Storage.get(this.getPath(type)) || undefined;
		},
		
		get: function(type, id) {
			var data = Storage.get(this.getPath(type)) || {};
			return data.hasOwnProperty(id) ? data[id] : undefined;
		},
		
		set: function(type, id, object) {
			if (id === null) id = this.nextKey(type);
			var data = Storage.get(this.getPath(type));
			data = data || {};
			data[id] = object;
			Storage.set(this.getPath(type), data);
			return id;
		},
		
		remove: function(type, id) {
			var data = Storage.get(this.getPath(type));
			delete data[id];
			Storage.set(this.getPath(type), data);
			return true;
		},
		
		flush: function(type) {
			 Storage.remove(this.getPath(type));
		},
		
		nextKey: function(type) {
			var size = 0, key, keys = [];
			var obj = Storage.get(this.getPath(type));
			for (key in obj) {
				if (obj.hasOwnProperty(key) && !isNaN(key)) keys.push(parseInt(key, 10));
			} 
			return (keys.length > 0) ? Math.max.apply(Math, keys) + 1 : 1;
		}
	
	});
	
	
	RestSource = AjaxSource.extend({
	
		initialize: function(config) {
			if (typeof config === 'undefined') return;
			this.config = config;
			this.config.path = (config.path.charAt(config.path.length-1) == '/') ? config.path : config.path + '/';
			Log.info('Source "' + this.getName() + '" connected');
		},
		
		getPath: function() {
			return this.config.path;
		},
		
		getDataType: function() {
			return this.config.hasOwnProperty('dataType') ? this.config.dataType : 'text/json';
		},
	
		getAll: function(type, success, error) {		
					
			var successFunc = function(data) {
				data = this.processItems(type, data);
				success.call(this, data);
			}
						
			this.request({
				url: this.getPath() + this.filterType(type),
				contentType: this.getDataType(),
				type: 'GET',
				success: Class.proxy(successFunc, this),
				error: error
			});
			
		},
		
		get: function(type, id, success, error) {
	
			var successFunc = function(data) {
				data = this.processItem(type, data);
				success.call(this, data);
			}
			
			var path = this.getPath() + this.filterType(type);
			
			this.request({
				url: (path.charAt(path.length-1) == '/') ? path + id : path + '/' + id,
				contentType: this.getDataType(),
				type: 'GET',
				success: Class.proxy(successFunc, this),
				error: error
			});
			
		},
		
		set: function(type, id, object, success, error) {

			var type = this.filterType(type);
	
			var successFunc = Class.proxy(function(data) {
				data = this.processItem(type, data);
				success.call(this, data);
			}, this), path = this.getPath(), req;
			
			path = (!id) ? path + type : (path.charAt(path.length-1) == '/') ? path + type + '/' + id : path + '/' + type + '/' + id;
			
			req = {
				url: path,
				success: Class.proxy(successFunc, this),
				error: error
			}
			
			if (!id) {
				req['type'] = 'POST',
				req['data'] = object
			} else {
				req['type'] = 'PUT';
				req['data'] = JSON.stringify(object);
				req['contentType'] = 'application/json';
			}
						
			this.request(req);
	
		},
		
		remove: function(type, id, success, error) {
	
			var path = this.getPath() + this.filterType(type);
			
			this.request({
				url: (path.charAt(path.length-1) == '/') ? path + id : path + '/' + id,
				type: 'DELETE',
				success: function(data) {
					success.call(this, JSON.parse(data));
				},
				error: error
			});
			
		},
				
		processItem: function(type, data) {
			return this.filterItem(type, data);
		},
		
		processItems: function(type, data) {
			var items = this.filterItems(type, data);
			var output = [];
			for(var i = 0, len = items.length; i < len; i++) {
				output.push(this.processItem(type, items[i]));
			}
			return output;
		},
		
		filterItem: function(type, data) {
			return JSON.parse(data);
		},
		
		filterItems: function(type, data) {
			return JSON.parse(data);
		},
		
		filterType: function(type) {
			return type;
		}
	
	});
	
	
	SessionStorageSource = Source.extend({});
	
	
	O.AjaxSource 						= AjaxSource;
	O.LocalStorageSource 		= LocalStorageSource;
	O.RestSource 						= RestSource;
	O.SessionStorageSource 	= SessionStorageSource;
	
}, ['mvc'], '1.0.2');