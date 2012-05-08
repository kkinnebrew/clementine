Orange.add('mvc', function(O) {

	/**
	 * the application class manages the lifecycle of the
	 * web app creating and destroying views and events. multiple
	 * apps configs can be stored simultaneously.
	 */
	O.Application = (function() {
	
		var _apps = {},
				_active = null,
				keyFilterRegex = /[^A-Za-z0-9_\[\]]/g;
				
		
		return {
		
			register: function(name, config) {
				
				// store app config in dictionary
				_apps[name.replace(keyFilterRegex)] = config;
				
			},
			
			init: function(name) {
			
				var config = {}, 
						name = name.replace(keyFilterRegex);
			
				// look up configuration
				if(typeof _apps[name] !== 'undefined') {
					config = _apps[name];
				} else throw 'Invalid application configuration';
				
				// load required modules
				for(var i = 0, len = config.required.length; i < len; i++) {
					O.Loader.loadModule(config.required[i]);
				}
			
				// bind event listeners
				O.Cache.on('statusChange', function(e) {
					if(e.data == 1) {
						O.Location.goOnline();
						O.Storage.goOnline();
						if(config.location) O.Location.getLocation(function() {});
						O.Log.info("Application went online");
					} else {
						O.Log.info("Application went offline");
						O.Location.goOffline();
						O.Storage.goOffline();
					}
				});
				
				// start modules
				O.Cache.init(config.poll);
				O.Storage.init();
				
				// set active application
				_active = name;
				
				// fetch root view
				var root = $('[data-root="true"]'),
				type = root.attr('data-control');
				
				// remove root attribute
				root.removeAttr('data-root');
				
				// load view
				var c = O.View.load(type);
				var controller = new c(null, root);
				controller.onLoad();
									
			},
			
			config: function() {
			
				if (_active != null) {
					return _apps[_active];
				} else throw 'Invalid application configuration';
			
			}
		
		};
	
	})();


	/**
	 * the view manager handles the registration and the
	 * definition of individual view controllers as well as
	 * loading them on the fly.
	 */
	O.View = (function() {
	
		var _views = {};
		
		return {
		
			define: function(def) {
				var c = O.extend(O.ViewController, def), type = def.type;
				c.prototype.typeList = 'ui-view ' + type;
				if(typeof type === 'undefined') throw "Error: View not named";
				return _views[type] = c;
			},
			
			extend: function(base, def) {
				var c = O.extend(base, def), type = def.type;
				c.prototype.typeList += ' ' + type;
				if(typeof type === 'undefined') throw "Error: View not named";
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
	

	/**
	 * this is the generic base controller class
	 */
	O.Controller = O.define({
		
		initialize: function() {},
		
		destroy: function() {}
		
	});
	
	
	/**
	 * this is the generic base view controller class
	 * that handles dynamic markup parsing and the
	 * building of the view controller hierarchy
	 */
	O.ViewController = O.extend(O.Controller, {
	
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
			
			this.target.find('[data-control]').each(function() {
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
				 		type = view.attr('data-control'),
				 		isRemote = (typeof view.attr('data-template') !== 'undefined') ? view.attr('data-template').length > 0 : false,
				 		path = view.attr('data-template');
				 						
				if (isRemote) {
					var source = O.TemplateManager.loadView(path);
					view.html($(source).html());
					cloneAttributes(source, view);
					view.removeAttr('data-template');
				}
														 		
				var c = O.View.load(type);
				var child = new c(this, view);
				
				that._views[name] = child;
			}
						
			var formList = [];
					
			this.target.find('form').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					if ($(parent).not('[data-control]').length === 0) count++;
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
					
			this.target.find('[data-name]').not('[data-control]').each(function() {
				var count = 0, parent = $(this).parent().not(that.target);
				while (parent.length != 0) {
					if ($(parent).not('[data-control]').length === 0) count++;
					parent = $(parent).parent().not(that.target);
				}
				if (count === 0) elementList.push(this);
			});
						
			for(var i=0, len = elementList.length; i < len; i++) {
				var el = $(elementList[i]),
						name = el.attr('data-name');
				
				if (typeof name !== 'undefined') that._elements[name] = el;
			}
									
			this.target.addClass(this.typeList);
						
			console.log("[INFO] View '" + this.name + "' of type '" + this.type + "' initialized");
		
		},
		
		
		getType: function() {
			return 'ui-view';
		},
		
		getTriggers: function() {
			return [];
		},
		
		getBindings: function() {
			return {};
		},
		
		
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onLoad: function() {
		
			this.target.removeAttr('data-name');
			this.target.removeAttr('data-control');
			
			this.onWillLoad();
			
			for (var name in this._views) {
				this._views[name].onLoad();
			}
			
			this.onDidLoad();
		
		},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		onUnload: function() {
		
			this.onWillUnload();
			
			for (var name in this._views) {
				this._views[name].onUnload();
			}
			
			this.onDidUnload();
		
		},
		
		getView: function(name) {
			if (name instanceof O.ViewController) return name;
			else if (typeof this._views[name] !== 'undefined') return this._views[name];
			throw 'Error: View "' + name + '" not found';
		},
		
		getElement: function(name) {
			if (typeof this._elements[name] !== 'undefined') return this._elements[name];
			throw 'Error: Element "' + name + '" not found';
		},
		
		getForm: function(name) {
			if (this._forms[name] instanceof O.Form) return this._forms[name];
			throw 'Error: Form "' + name + '" not found';
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
			return this._eventTarget.on.call(this._eventTarget, event, proxy);
		},
		
		detach: function(event, callback) {
			return this._eventTarget.detach.apply(this._eventTarget, arguments);
		},
		
		fire: function(event, data) {
			return this._eventTarget.fire.apply(this._eventTarget, arguments);
		},
		
		
		bindData: function(item, live) {
			O.Binding.bindData(this.target, item);
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
			delete this.target;
			delete this.parent;
			delete this._eventTarget;
		}
	
	});
	
	O.Form = O.define({
	
		initialize: function(target) {
			
			var that = this;
			var name = $(target).attr('name');
			
			this.fields = {};
			this.target = target;

			$(target).find('input, select, textarea, .ui-input').each(function() {
				var fieldName = $(this).attr('name');
				that.fields[fieldName] = $(this);
			});
			
			console.log("[INFO] Form '" + name + "' initialized");
		},
		
		get: function(name) {
			if (typeof this.fields[name] !== 'undefined') {
				return this.fields[name];
			} else {
				throw "Error: Form field '" + name + "' not found";
			}
		},
		
		destroy: function() {
			for (var name in this.fields) {
				this.fields[name].detach();
			}
		}
		
	});

	
	/**
	 * binding handles live binding of models to
	 * dom elements via the HTML5 microdata standard
	 */
	O.Binding = (function() {
		
		return {
		
			bindData: function(node, item) {
			
				// check for the data format
				if (item instanceof O.Item) {
					var id = item.id(), data = item.toObject();
				} else if (typeof item === 'object') {
					var id = null, data = item;
				}
				else throw 'Invalid data item';
			
				// check for itemscope
				var itemscope = $(this).attr('itemscope');
				
				// validate attribute exists
				if (typeof itemscope !== 'undefined' && itemscope !== false) {
				
					// set the id of the data
					if (id !== null) node.attr('itemid', id);
					
					// parse all the data fields
					for (var field in data) {
					
						// look for matching property
						var el = node.find('[itemprop="' + field + '"]')
						if (el.length !== 0) {
						
							// for arrays and collections
							if (data[field] instanceof 'Array' || data[field] instanceof O.Collection) {
								O.Binding.bindList(el, data[field]);
							}
							
							// for objects and items
							else if (typeof data[field] === 'object' || data[field] instanceof O.Item) {
								O.Binding.bindData(el, data[field]);
							} 
							
							// for text
							else {
								el.text(data[field]);
							}
						
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
			
				// find template
				var template = node.find('[itemscope]');
				var itemscope = $(template).attr('itemscope');
				
				// validate attribute exists
				if (typeof itemscope !== 'undefined' && itemscope !== false) {
				
					// clear the parent
					node.html('');
					
					// iterate over list
					for(var i=0, len = data.length; i < len; i++) {
					
						// clone instance
						var instance = template.clone();
						
						// bind object data
						O.Binding.bindData(instance, data[i]);
						
						// append the instance
						node.append(instance);
					
					}
				}
			}
		}
	
	})();
	
	
	/**
	 * manages loading external template files
	 * from the server
	 */
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
					
				} else if (typeof path !== 'undefined' && path !== '') {
					
					var data = _fetch(path);
					var node = $(data);

					if (O.Browser.isMobile) {
						node.find('[data-media="desktop"]').remove()
					} else {
						node.find('[data-media="mobile"]').remove()
						node.find('[data-media="tablet"]').remove();
					}
					
					return node.get(0).outerHTML;
					
				}	else {
					throw 'Invalid template path';
				}
			},
			
			loadView: function(path) {
				
				// get configuration
				var config = O.Application.config(),
						baseUrl = config.baseUrl;
				
				// build query string
				if (baseUrl.charAt(baseUrl.length-1) !== '/') {
					baseUrl = baseUrl + '/';
				}
				
				// fetch template
				return O.TemplateManager.load(baseUrl + 'app/views/' + path);
				
			}
		}
	
	})();
	
	
	/**
	 * manages the registration and retrieval of model definitions
	 */
	O.Model = (function() {
	
		var _models = {};
				
		return {
		
			define: function(def) {
				var c = O.extend(O.ModelDefinition, def), type = def.type;
				if(typeof type === 'undefined') throw "Error: Model not named";
				return _views[type] = c;
			},
		
			register: function(config) {
				if (typeof config === 'undefined' || typeof config.name === 'undefined') throw "Error: Model definition invalid";
				if (typeof config.type !== 'undefined' && typeof (model = _models[config.type]) !== 'undefined') {
					var c = new model(config);
				}
				else var c = new O.ModelDefinition(config);
				return _models[config.name] = c;
			},
			
			get: function(name) {
				var model;
				if (typeof (model = _models[name]) !== 'undefined') {
					return model;
				} else throw "Error: Model '" + name + "' not found";
			}
		
		};
	
	})();
		
	
	/**
	 * manages all application model objects, both those that are
	 * server size and those that are persisted client side
	 */
	O.ModelDefinition = O.define({
	
		type: 'model',
		
		/**
		 * models must be registered to be used. a model can either take in a 
		 * path to an API or otherwise will be defined as local models that can
		 * get an set data on a specific device.
		 */
		initialize: function(config) {
		
			this.id = config.id;
			this.name = config.name;
			this.fields = config.fields;
			this.path = (typeof config.path !== 'undefined') ? config.path : null;
			this.local = (typeof config.path !== 'undefined') ? false : true;
			this.mapItem = config.mapItem;
			this.mapItems = config.mapItems;
			
			for(var field in this.fields) {
				if (this.fields[field].name == this.id) {
					this.key = field;
				}
			}
			
			if (this.key == null) throw "Missing id field in model '" + this.name + "'";
			
			// setup event target
			this._eventTarget = new O.EventTarget(null, this);
		
		},
		
		destroy: function() {
			this._eventTarget.destroy();
		},
		
		/**
		 * gets a collection of models by its id or query string
		 */
		get: function() {
		
			// edge cases
			// INFO: FetchedModelCollection
			// WARN: NoItemsReturned
			// ERROR: MalformedQueryString
			
			var args = arguments,
					id = (typeof args[0] !== 'function') ? args[0] : null,
					success = (!id) ? args[0] : args[1],
					failure = (!id) ? args[1] : args[2];
			
			// call map function if it exists
			var successItemFunc = function(data, save) {
			
				// process return data
				data = this._processData($.parseJSON(data), save);
				
				// call success function
				success.call(this, new O.Item(this, data));
				
				// fire changed event
				this.fire('get', {
					action: action,
					ids: [id],
					data: data
				});
				
			};
			
			// call map function if it exists
			var successItemsFunc = function(data, save) {
										
				// process return data
				data = this._processItems($.parseJSON(data), save);
							
				// call success function
				success.call(this, new O.Collection(this, data));
				
				// fire changed event
				this.fire('datachange', {
					action: 'get',
					ids: data.ids,
					data: {}
				});
				
			};
			
			if (this.local) {
				
				// fetch full collection		
				var data = O.Storage.get('model-' + this.name);
				
				// return data to callback
				if (!id) {
					successItemsFunc.call(this, data, true);
				} else {
					successItemFunc.call(this, data[id], true);
				}
							
			} else {
			
				// fetch data
				$.ajax({
				  url: (!id) ? this.path : this.path + id,
				  contentType: 'text/json',
				  type: 'GET',
				  success: (!id) ? $.proxy(successItemsFunc, this) : $.proxy(successItemFunc, this),
				  error: failure
				});
			
			}
		
		},
		
		/**
		 * pass in an individual model item or even the raw json of a model
		 * to save it to the data source. an array can be used to save a 
		 * collection of items
		 */
		save: function(object, success, failure) {
		
			// edge cases
			// INFO: ModelItemSaved
			// INFO: ModelItemsSaved
			// ERROR: MissingPrimaryKey
			// ERROR: MalformedInput
			
			// calculation action
			var action = (typeof object[this.key] !== 'undefined') ? 'update' : 'create';
						
			// call map function if it exists
			var successFunc = function(data) {
			
				// process data
				data = this._processData($.parseJSON(data));
				
				// call success function
				success.call(this, data);
				
				// get id
				var id = data[this.key];
				
				// fire changed event
				this.fire('datachange', {
					action: action,
					id: id,
					data: data
				});
				
			};
			
			// process data
			data = this._prepareData(object, action);
						
			// check if object has been saved
			if (this.local) {
			
				// get local storage object
				var cache = O.Storage.get('model-' + this.name);
				
				// create or use id
				var id = (action === 'update') ? object[this.key] : cache.count + 1;
				
				// set new value
				cache[id] = data;
				
				// push to local storage
				O.Storage.set('model-' + this.name, cache);
				
				// fire datachange event
				this.fire('datachange', {
					action: action,
					id: id,
					data: data
				});
			
			} else if (action === 'update') {
			
				$.ajax({
				  url: (!id) ? this.path : this.path + id,
				  type: 'PUT',
				  data: data,
			  	success: $.proxy(successFunc, this),
				  error: failure
				});
			
			} else {
			
				$.ajax({
				  url: this.path,
				  type: 'POST',
				  data: data,
				  success: $.proxy(successFunc, this),
				  error: failure
				});
	
			}
		
		},
		
		/**
		 * delete an item based on either the item itself or the id of the
		 * item to remove
		 */
		delete: function(object, success, failure) {
		
			// edge cases
			// INFO: ModelItemDeleted
			// ERROR: ModelItemDoesNotExist
			// ERROR: MalformedInput
			
			var id = (typeof object === 'object') ? object[this.key] : object;
			
			// call map function if it exists
			var successFunc = function(data) {
				
				// parse response
				data = $.parseJSON(data);
				
				// get local storage object
				var cache = O.Storage.get('model-' + this.name);
				
				// set new value
				delete cache[id];
				
				// push to local storage
				O.Storage.set('model-' + this.name, cache);
				
				// call success function
				success.call(this, data);
				
				// fire changed event
				this.fire('datachange', {
					action: 'delete',
					id: id,
					data: {}
				});
				
			};
			
			if (this.local) {
			
				// get local storage object
				var cache = O.Storage.get('model-' + this.name);
				
				// set new value
				delete cache[id];
				
				// push to local storage
				O.Storage.set('model-' + this.name, cache);
				
				// fire datachange event
				this.fire('datachange', {
					action: 'delete',
					id: id,
					data: {}
				});
			
			} else {
			
				$.ajax({
				  url: (!id) ? this.path : this.path + id,
				  contentType: 'text/json',
				  type: 'DELETE',
				  data: object,
					success: $.proxy(successFunc, this),
				  error: failure
				});
				
			}
		
		},
		
		_processItems: function(data, save) {
		
			// map the data if applicable
			if (typeof this.mapItems === 'function') data = this.mapItems(data);
						
			// setup output
			var models = [];
			var ids = [];
						
			// map individual items			
			for (var i = 0, len = data.length; i < len; i++) {
				var model = this._processData(data[i], save);
				if (typeof model === 'object') {
					ids.push(model[this.key]);
					models.push(model);
				}
			}
		
			// return models
			return {
				ids: ids,
				models: models
			};
			
		},
		
		validate: function(data) {
				
			// compare data to our model
			for(var field in this.fields) {
			
				if( this.fields[field].name == this.key) continue;
							
				// get source field name
				var nullable = (typeof this.fields[field].nullable !== undefined) ? this.fields[field].nullable : true;
				var isNull = (typeof data[field] === 'undefined' || data[field] === '');
						
				// continue if field is not defined
				if (isNull && !nullable) return false;
			}
			
			return true;
		
		},
		
		_processData: function(data, save) {
		
			// map the data if applicable
			if (typeof this.mapItem === 'function') data = this.mapItem(data);
			
			// create output object
			var model = {};
												
			// map to our model
			for(var field in this.fields) {
			
				// get source field name
				var source = this.fields[field].name;
				var value = (typeof data[source] !== 'undefined') ? data[source] : undefined;
			
				// continue if field is not defined
				if (value === undefined) {
					console.warn("[WARN] Could not parse JSON field '" + field + "' for " + this.name);
					continue;
				}
			
				// set field on output
				model[field] = value;
			}
									
			// get the id of the return
			var id = data[this.key];
			if(id === undefined) throw 'Invalid ID field for ' + this.name;
			
			if(save) {
			
				// get local storage object
				var cache = O.Storage.get('model-' + this.name);
				
				// set new value
				cache[id] = data;
				
				// push to local storage
				O.Storage.set('model-' + this.name, cache);
			
			}
			
			// return model
			return model;
		
		},
		
		_prepareData: function(object, action) {
		
			// create output object
			var data = {};
												
			// map to our model
			for(var field in this.fields) {
			
				// skip id if null
				if (this.key == field && action == 'create') {
					continue;
				}
			
				// get source field name
				var source = this.fields[field].name;
				var value = (typeof object[field] !== 'undefined') ? object[field] : undefined;
						
				// continue if field is not defined
				if (value === undefined && !this.fields[field].nullable) {
					console.warn("[WARN] Could missing data for field '" + field + "' for " + this.name);
					continue;
				}
			
				// set field on output
				data[source] = value;
			}
									
			// return model
			return data;
		
		},
		
		on: function() {
			return this._eventTarget.on.apply(this._eventTarget, arguments);
		},
		
		detach: function() {
			return this._eventTarget.detach.apply(this._eventTarget, arguments);
		},
		
		fire: function() {
			return this._eventTarget.fire.apply(this._eventTarget, arguments);
		}
	
	});
	
	
	/**
	 * collections describe lists of data items return from a 
	 * model
	 */
	O.Collection = O.define({
	
		model: null,
		data: [],
		
		/**
		 * takes in a reference to the model describing the
		 * data as well as the collection data itself as an array []
		 */
		initialize: function(model, data) {
		
			// edge cases
			// ERROR: InvalidModel
			// ERROR: InvalidData
			
			// set attributes
			this.model = model;
			this.data = data.models;
			this.ids = data.ids;
			this._data = {};
			
			// get key
			var key = '';
			for(var name in this.model.fields) {
				if (this.model.fields[name].name == this.model.id) {
					key = name;
					break;
				}
			}
						
			// setup data
			for(var i=0; i<data.models.length; i++) {
				this._data[data.models[i][key]] = data.models[i];
			}
		
		},
		
		destroy: function() {
			delete this.model;
		},
		
		/**
		 * returns the number of items in the collection
		 */
		count: function() {
			return this.data.length;
		},
		
		toArray: function() {
			return this.data;
		},
		
		toDictionary: function() {
			return this._data;
		},
		
		/**
		 * returns a subset of the collection given a set of query parameters
		 * or a given id
		 */
		get: function(id) {
		
			// edge cases
			// INFO: FetchedModelCollection
			// WARN: NoItemsReturned
			// ERROR: MalformedQueryString
			
			return (typeof this._data[id] != undefined) ? this._data[id] : null;
		
		},
		
		/**
		 * limits the query result to a set number of return values.
		 * further pagination can be handled with the reset/next/prev
		 * methods. when limit is called, the cursor is reset to zero.
		 */
		limit: function() {
		
			// edge cases
			// INFO: LimitedCollection
			// ERROR: InvalidLimitInteger
		
		},
		
		/**
		 * handles pagination. resets the pagination cursor to zero
		 */
		reset: function() {
		
			// edge cases
			// INFO: CursorReset
			// WARN: CursorIsAlreadyReset
		
		},
		
		/**
		 * returns the next set number of results as given by the limit count
		 */
		next: function() {
		
			// edge cases
			// INFO: CursorChanged
			// WARN: CursorHasReachedEnd
			// ERROR: CursorAlreadyReachedEnd
		
		},
		
		/**
		 * returns the prev set of results as given by the limit count
		 */
		prev: function() {
		
			// edge cases
			// INFO: CursorChanged
			// ERROR: CursorAlreadyAtIndex
		
		},
		
		/**
		 * pass in callback to sort objects by. items with null/undefined fields will
		 * be returned last. Also pass in DESC boolean.
		 * if sort is called during pagination, the cursor will remain the same until
		 * the cursor is reset manually
		 */
		sort: function() {
		
			// edge cases
			// INFO: SortedCollection
			// ERROR: InvalidSortCallback
		
		},
		
		intersect: function(array) {
			var int = _.intersection(this.ids, array);
			return int.length;
		},
		
	
	});
	
	O.Item = O.define({
	
		model: null,
		data: {},
	
		/**
		 * takes in a model reference and the underlying item
		 * data
		 */
		initialize: function(model, data) {
		
			// set attributes
			this.model = model;
			this.data = data;
		
		},
		
		/**
		 * returns the id value of the item
		 */
		id: function() {
			return this.data[this.model.key];
		},
		
		toObject: function() {
			return data;
		},
		
		destroy: function() {
		
		}
		
	});


	/**
	 * TO DO: for custom input controls
	 */	
	O.Input = O.define({
	
		initialize: function() {
		
		},
		
		getValue: function() {
		
		},
		
		setValue: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
	
	/* browser detection via quirksmode */

	O.Browser = (function() {
	
		var BrowserDetect = {
		
			init: function () {
				this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
				this.version = this.searchVersion(navigator.userAgent)
					|| this.searchVersion(navigator.appVersion)
					|| "an unknown version";
				this.OS = this.searchString(this.dataOS) || "an unknown OS";
				
				// check if mobile
				var useragent = navigator.userAgent.toLowerCase();
				if( useragent.search("iphone") > 0)
				    this.isMobile = true; // iphone
				else if( useragent.search("ipod") > 0)
				    this.isMobile = true; // ipod
				else if( useragent.search("android") > 0)
				    this.isMobile = true; // android
				else if( useragent.search("ipad") > 0)
				    this.isMobile = true; // android
				else this.isMobile = false;
				
			},
			
			searchString: function (data) {
				for (var i=0;i<data.length;i++)	{
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
				return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
			},
			
			dataBrowser: [
				{
					string: navigator.userAgent,
					subString: "Chrome",
					identity: "Chrome"
				},
				{ 	string: navigator.userAgent,
					subString: "OmniWeb",
					versionSearch: "OmniWeb/",
					identity: "OmniWeb"
				},
				{
					string: navigator.vendor,
					subString: "Apple",
					identity: "Safari",
					versionSearch: "Version"
				},
				{
					prop: window.opera,
					identity: "Opera",
					versionSearch: "Version"
				},
				{
					string: navigator.vendor,
					subString: "iCab",
					identity: "iCab"
				},
				{
					string: navigator.vendor,
					subString: "KDE",
					identity: "Konqueror"
				},
				{
					string: navigator.userAgent,
					subString: "Firefox",
					identity: "Firefox"
				},
				{
					string: navigator.vendor,
					subString: "Camino",
					identity: "Camino"
				},
				{		// for newer Netscapes (6+)
					string: navigator.userAgent,
					subString: "Netscape",
					identity: "Netscape"
				},
				{
					string: navigator.userAgent,
					subString: "MSIE",
					identity: "Explorer",
					versionSearch: "MSIE"
				},
				{
					string: navigator.userAgent,
					subString: "Gecko",
					identity: "Mozilla",
					versionSearch: "rv"
				},
				{ 		// for older Netscapes (4-)
					string: navigator.userAgent,
					subString: "Mozilla",
					identity: "Netscape",
					versionSearch: "Mozilla"
				}
			],
			dataOS : [
				{
					string: navigator.platform,
					subString: "Win",
					identity: "Windows"
				},
				{
					string: navigator.platform,
					subString: "Mac",
					identity: "Mac"
				},
				{
					   string: navigator.userAgent,
					   subString: "iPhone",
					   identity: "iPhone/iPod"
			    },
				{
					string: navigator.platform,
					subString: "Linux",
					identity: "Linux"
				}
			]
		
		};
		
		BrowserDetect.init();
		
		return {
			browser: BrowserDetect.browser,
			version: BrowserDetect.version,
			os: BrowserDetect.OS,
			isMobile: BrowserDetect.isMobile
		}
	
	})();

}, [], '0.1');