/**
 * db.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none
 */

OrangeUI.add('request', function(O) {

	O.Request = (function() {
	
		var Request = {},
		
		_baseUrl,
		_requestTimeout = 5 * 1000,
		_supportsOffline = false,
		
		// dictionary of request keys and parameters
		keys = {},
		
		_buildRequest = function(type, path, data) {
								
			return $.ajax({
			
				cache: false,
				contentType: 'application/json; charset=utf-8',
				context: { path: path, data: data },
	        	data: type === "POST" ? JSON.stringify(data) : data,
				dataType: 'text',
				timeout: _requestTimeout,
				type: type,
				url: _baseUrl + path,
				
				success: function(data) {
										
					// parse response
					var json = JSON.parse(data);
																		
					// cache request
					var key = this.path;
				
					// pass error if no data returned
					if(json != undefined) {
						O.Storage.set(key, json);
						O.Log.info("Retrieved data from " + path);
						O.Log.debug(json);
					}
										
				},
				
				error: function(data) {}
			
			});	
		
		};
		
		return {
		
			init: function(config) {
			
				_baseUrl = (config.baseUrl != undefined) ? config.baseUrl : _baseUrl;
				_requestTimeout = (config.requestTimeout != undefined) ? timeout : _requestTimeout;
				_supportsOffline = O.Storage.isSupported();
				
				O.Log.info("Request manager loaded in " + (O.App.isOnline ? "online" : "offline") + " mode");
				
			},
		
			get: function(path, data) {
						
				if(_supportsOffline && !O.App.isOnline) {
							
					// fetch response from cache
					var response = O.Storage.get(path);
					
					// return cache ajax object with success/error functions
					if(response) return new O.SuccessResponse(response);
					else return new O.ErrorResponse({});
							
				}
				
				return _buildRequest("GET", path, data);
			},
			
			post: function() {
			
				if(_supportsOffline && !O.App.isOnline) {
							
					// fetch response from cache
					var response = O.Storage.get(path);
					
					// return cache ajax object with success/error functions
					if(response) return new O.SuccessResponse(response);
					else return new O.ErrorResponse({});
							
				}
				
				return _buildRequest("POST", path, data);
			}
		
		};
	
	})();
	
	O.SuccessResponse = Class.create({
	
		_data: null,
		
		initialize: function(data) {
			this._data = data;
		},
		
		destroy: function() {},
		
		success: function(callback) {
			callback(this._data);
		},
		
		error: function(callback) {}
	
	});
	
	O.ErrorResponse = Class.create({
	
		_data: null,
		
		initialize: function(data) {
			this._data = data;
		},
		
		destroy: function() {},
		
		success: function(callback) {},
		
		error: function(callback) {
			callback(this._data);
		}
	
	});
	

}, ['log', 'storage', 'cache']);
