Orange.add('rest', function(O) {

	// module imports
	var Log = __import('Log'), AjaxSource = __import('AjaxSource');

	// module declarations
	var RestSource;
	
	// module definitions
	RestSource = AjaxSource.extend({
	
		initialize: function(config) {
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
				url: this.getPath() + type,
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
			
			var path = this.getPath() + type;
			
			this.request({
				url: (path.charAt(path.length-1) == '/') ? path + id : path + '/' + id,
				contentType: this.getDataType(),
				type: 'GET',
				success: Class.proxy(successFunc, this),
				error: error
			});
			
		},
		
		set: function(type, id, object, success, error) {
	
			var successFunc = Class.proxy(function(data) {
				data = this.processItem(type, data);
				success.call(this, data);
			}, this), path = this.getPath();
			
			path = (!id) ? path + type : (path.charAt(path.length-1) == '/') ? path + type + '/' + id : path + '/' + type + '/' + id;
			
			this.request({
				url: path,
				data: object,
				type: 'POST',
				dataType: 'text/json',
				complete: function(xhr) {
					if (xhr.readyState == 4) {
						if (xhr.status == 201) {
							successFunc.call(this, xhr.responseText);
						} else if (xhr.status == 200) {
							successFunc.call(this, xhr.responseText);
						}
					} else {
							error.call(this, xhr);
					}
				}
			});
	
		},
		
		remove: function(type, id, success, error) {
	
			var path = this.getPath() + type;
			
			this.request({
				url: (path.charAt(path.length-1) == '/') ? path + id : path + '/' + id,
				type: 'DELETE',
				success: function(data) {
					success.call(this, true);
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
		}
	
	});

	// module exports
	__export('RestSource', RestSource);

}, [], '1.0');