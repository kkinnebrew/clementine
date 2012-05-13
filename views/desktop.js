Orange.add('wmsocial', function(O) {

	O.namespace('WMSocial');
	
	/* base classes */

	O.Application = (function() {
	
		var _apps = {};
		
		return {
		
			register: function(def) {},
			
			init: function(name) {}
		
		};
	
	})();

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
	

	O.Controller = O.define({
		
		initialize: function() {},
		
		destroy: function() {}
		
	});
	
		
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
					var source = O.TemplateManager.load('app/views/' + path);
					view.html($(source).html());
					cloneAttributes(source, view);
					view.removeAttr('data-template');
				}
														 		
				var c = O.View.load(type);
				var child = new c(this, view);
				
				that._views[name] = child;
			}
			
			delete viewList;
			
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
			
			delete formList;
			
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
						name = el.attr('data-name'),
						child = new O.Element(el);
				
				if (typeof name !== 'undefined') that._elements[name] = child;
			}
			
			delete elementList;
						
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
			this.target.removeAttr('data-view');
			
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
		
		hasForm: function(name {
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
		}
	
	});
	
	O.Form = O.define({
	
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
	O.Element = O.define({
	
		initialize: function() {
		
		},
		
		bindData: function() {
		
		},
		
		on: function() {
		
		},
		
		detach: function() {
		
		}
		
		destroy: function() {
		
		}
	
	});
	
	O.Binding = (function() {
	
		return {
		
			bindData: function(node, item) {
			
				var data = (item instanceof O.Item) ? item.data : item;
			
				if (node.hasAttribute('itemscope')) {
					node.attr('itemid', data['id']);
					for (var field in data) {
						if (var el = node.find('[itemprop="' + field + '"]')) {
							if (typeof data[field] === 'Array') {
								el.html(O.Binding.bindData(el, data[field])
							} else if (typeof item.data[field] === 'Object') {
								
							} else {
								el.text(item.data);
							}
						}
					}
				}
			
			},
			
			bindList: function(node, list) {
			
				
			
			}
			
		}
	
	})();
		
	O.Model = O.define({
	
		/**
		 * models must be registered to be used. a model can either take in a 
		 * path to an API or otherwise will be defined as local models that can
		 * get an set data on a specific device.
		 */
		initialize: function() {
		
		},
		
		destroy: function() {},
		
		/**
		 * gets a collection of models by its id or query string
		 */
		get: function() {
		
			// edge cases
			// INFO: FetchedModelCollection
			// WARN: NoItemsReturned
			// ERROR: MalformedQueryString
		
		},
		
		/**
		 * get an individual item by its id or query string, if
		 * the model returns multiples, only the first will be returned
		 */
		one: function() {
		
			// edge cases
			// INFO: FetchedModelItem
			// WARN: MultipleItemsReturnedOneExpected
			// ERROR: ModelItemDoesNotExist
			// ERROR: MalformedQueryString
		
		},
		
		/**
		 * pass in an individual model item or even the raw json of a model
		 * to save it to the data source. an array can be used to save a 
		 * collection of items
		 */
		save: function() {
		
			// edge cases
			// INFO: ModelItemSaved
			// INFO: ModelItemsSaved
			// ERROR: MissingPrimaryKey
			// ERROR: MalformedInput
		
		},
		
		/**
		 * delete an item based on either the item itself or the id of the
		 * item to remove
		 */
		delete: function() {
		
			// edge cases
			// INFO: ModelItemDeleted
			// ERROR: ModelItemDoesNotExist
			// ERROR: MalformedInput
		
		}
	
	});
	
	O.Collection = O.define({
	
		/**
		 * takes in a reference to the model describing the
		 * data as well as the collection data itself as an array []
		 */
		initialize: function() {
		
			// edge cases
			// ERROR: InvalidModel
			// ERROR: InvalidData
		
		},
		
		destroy: function() {
		
		},
		
		/**
		 * returns a subset of the collection given a set of query parameters
		 * or a given id
		 */
		get: function() {
		
			// edge cases
			// INFO: FetchedModelCollection
			// WARN: NoItemsReturned
			// ERROR: MalformedQueryString
		
		},
		
		/**
		 * returns an individual entry from the collection by id or query
		 * parameters. if more than one result is returned, the first will
		 * be returned.
		 */
		one: function() {
		
			// edge cases
			// INFO: FetchedModelItem
			// WARN: MultipleItemsReturnedOneExpected
			// ERROR: ModelItemDoesNotExist
			// ERROR: MalformedQueryString
		
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
		
		}
		
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
		
		}
		
	
	});
	
	O.Item = O.define({
	
		/**
		 * takes in a model reference and the underlying item
		 * data
		 */
		initialize: function() {
		
		},		
		
		destroy: function() {
		
		}
		
	});
	
	O.Binding = O.define({
	
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
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


	/* Input related controllers */
	
	O.UI.DateInput = O.extend(O.Input, {
	
		getType: function() { return 'ui-date-input' },
	
		getValue: function() {},
		
		setValue: function() {},
		
		clearValue: function() {}
			
	});
	
	O.UI.TimeInput = O.extend(O.Input, {
	
		getType: function() { return 'ui-time-input' },
	
		getValue: function() {},
		
		setValue: function() {},
		
		clearValue: function() {}
			
	});
	
	O.UI.CurrencyInput = O.extend(O.Input, {
	
		getType: function() { return 'ui-currency-input' },
	
		getValue: function() {},
		
		setValue: function() {},
		
		clearValue: function() {},
		
		setCurrency: function() {}
			
	});
	
	O.UI.TextInput = O.extend(O.Input, {
	
		getType: function() { return 'ui-text-input' },
	
		getValue: function() {},
		
		setValue: function() {},
		
		clearValue: function() {}
			
	});
	
	O.UI.SelectInput = O.extend(O.Input, {
	
		getType: function() { return 'ui-select-input' },
	
		getValue: function() {},
		
		setValue: function() {},
		
		clearValue: function() {},
		
		setCollection: function() {}
			
	});
	
	
	/* UI related controllers */
	
	O.UI.NavigationController = O.View.define({
	
		getType: function() { return 'ui-navigation-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.GridController = O.View.define({
	
		getType: function() { return 'ui-grid-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.TableController = O.View.define({
	
		getType: function() { return 'ui-table-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.ListController = O.View.define({
	
		getType: function() { return 'ui-list-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.MultiViewController = O.View.define({
	
		getType: function() { return 'ui-multi-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		activate: function(name) {}
			
	});
	
	O.UI.TabController = O.View.define({
	
		getType: function() { return 'ui-tab-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		activate: function(name) {}
			
	});
	
	O.UI.LightBoxController = O.View.define({
	
		getType: function() { return 'ui-lightbox-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		show: function() {},
		
		hide: function() {},
		
		toNext: function() {},
		
		toPrev: function() {}
			
	});
				
		
	/* iOS related controllers */

	O.iOS.UINavigationController = O.View.extend(O.NavigationController, {
	
		getType: function() { return 'ios-ui-navigation-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
	
	});
	
	O.iOS.UIModalViewController = O.View.define({
	
		getType: function() { return 'ios-ui-modal-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
	
	});
	
	O.iOS.UITabBarController = O.View.define({
	
		getType: function() { return 'ios-ui-tab-bar-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		activate: function(name) {}
	
	});

	O.iOS.UISplitViewController = O.View.define({
	
		getType: function() { return 'ios-ui-split-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		setCollection: function(collection) {},
		
		getCollection: function() {},
		
		clearCollection: function() {}
	
	});

	O.iOS.UITableViewController = O.View.define({
	
		getType: function() { return 'ios-ui-table-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
	
		refresh: function() {},
	
		setCollection: function(collection) {},
		
		getCollection: function() {},
		
		clearCollection: function() {}
	
	});
	
	O.iOS.UISearchBarController = O.View.define({
	
		getType: function() { return 'ios-ui-search-bar-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
	
	});
		
	
	
	/* WMSocial application controllers */

	O.WMSocial.SocialAppController = O.View.extend(O.UIMultiViewController, {
	
		getType: function() {
			return 'wm-social-app';
		},
		
		getTriggers: function() {
			return [];
		},
		
		getBindings: function() {
			return {
				'social-home': { 'authenticated': true },
				'social-main': { 'logout': true }
			}
		},
		
		onAuthenticated: function(e) {
			this.activateView('social-main');			
		},
		
		onLogout: function(e) {
			this.activateView('social-home');
		}
	
	});
	
	O.WMSocial.HomeController = O.View.extend(O.UIMultiViewController, {
		
		getType: function() {
			return 'wm-home';
		},
		
		getTriggers: function() {
			return ['authenticated'];
		},
		
		getBindings: function() {
			return {
				'social-home-multiview': { 'authenticated': true }
			}
		}
		
	});
	
	O.WMSocial.HomeMultiViewController = O.View.extend(O.UIMultiViewController, {
		
		getType: function() {
			return 'wm-home-multiview';
		},
		
		getTriggers: function() {
			return ['authenticated'];
		},
		
		getBindings: function() {
			return {
				'social-login': { 'login': true, 'firstLogin': true },
				'social-setup': { 'login': true }
			}
		},
		
		onLogin: function(e) {
			this.fire('authenticated');
		},
		
		onFirstLogin: function(e) {
			this.activateView('social-setup');
		},
		
		onSetup: function(e) {
			this.fire('authenticated');
		}
		
	});
	
	O.WMSocial.MainController = O.View.define({
		
		getType: function() {
			return 'wm-main';
		},
		
		getTriggers: function() {
			return ['logout'];
		},
		
		getBindings: function() {
			return {
				'social-feed': { 'logout': true, 'select': true }
			}
		},
		
		onSelect: function(e) {			
			this.getView('social-event').setData(e.data);
		}
		
	});
	
	O.WMSocial.MobileViewController = O.View.extend(O.UINavigationController, {
		
		getType: function() {
			return 'wm-mobile';
		},
		
		getTriggers: function() {
			return ['logout'];
		},
		
		getBindings: function() {
			return {
				'social-login': { 'login': true, 'firstLogin': true },
				'social-setup': { 'login': true, 'back': true },
				'social-feed': { 'back': true, 'select': true },
				'social-flip-view': { 'back': true }
			}
		},
		
		onLogin: function(e) {
			this.pushView(this.getView('social-feed'));
		},
		
		onFirstLogin: function(e) {
			this.pushView(this.getView('social-setup'));
		},
		
		onBack: function(e) {
			this.popView();
		},
		
		onSelect: function(e) {
			this.getView('social-flip-view').setData(e.data);
		}
		
	});
	
	O.WMSocial.FlipController = O.View.extend(O.iOS.UIFlipController, {
		
		getType: function() {
			return 'wm-flip-view';
		},
		
		getTriggers: function() {
			return ['back'];
		},
		
		getBindings: function() {
			return {
				'social-event': { 'back': true }
				'social-map': { 'back': true }
			}
		},
		
		setData: function(data) {
			this.getView('social-event').setData(data);
		}
		
	});
	
	O.WMSocial.LoginController = O.View.define({
		
		getType: function() {
			return 'wm-login';
		},
		
		getTriggers: function() {
			return ['login', 'firstLogin'];
		},
		
		getBindings: function() {
			return {
				'submit-btn': { 'click': true }
			}
		},
		
		onClick: function(e) {
		
			// get form data
			var data = this.getForm('login').getData();
			
			// submit data
			O.Request.post({
				path: 'login/',
				data: data,
				success: $.proxy(this.onSubmitSuccess, this),
				error: $.proxy(this.onSubmitError, this)
			});
		
		},
		
		onSubmitSuccess: function(e) {
			
			if (e.data == 1) {
				this.fire('login');
			} else if (e.data == 2) {
				this.fire('firstLogin');
			} else {
				this.getForm('login').showError('Invalid Login');
			}
			
		}
		
	});
	
	O.WMSocial.SetupController = O.View.define({
	
		getType: function() {
			return 'wm-setup';
		},
		
		getTriggers: function() {
			return ['login'];
		},
		
		onDidLoad: function() {		
			this.getElement('submit-btn').on('touchclick', $.proxy(this.onClick, this));
		},
		
		onSubmit: function(e) {
		
			// get form data
			var data = this.getForm('setup').getData();
			
			// submit data
			O.Request.post({
				path: 'setup/',
				data: data,
				success: $.proxy(this.onSubmitSuccess, this),
				error: $.proxy(this.onSubmitError, this)
			});
		
		},
		
		onSubmitSuccess: function(e) {
			this.fire('login');
		},
		
		onSubmitError: function(e) {
			this.getForm('login').showError('Could not setup account');
		}
	
	});
	
	O.WMSocial.FeedController = O.View.define({
	
		getType: function() {
			return 'wm-feed';
		},
		
		getTriggers: function() {
			return ['logout', 'select'];
		},
		
		getBindings: function() {
			return {
				'social-events-list': { 'select': true }
			};
		},
		
		onWillLoad: function() {
		
			// fetch data collection
			var events = O.Model.get('Event').get('all').limit(20);
		
			// bind to table
			this.getView('social-events-list').setCollection(events);
		
		},
		
		onDidLoad: function() {			
			this.getElement('logout-btn').on('touchclick', $.proxy(this.onLogout, this));
		},
		
		onLogout: function(e) {
		
			// get form data
			var data = this.getForm('setup').getData();
			
			// submit data
			O.Request.post({
				path: 'logout/',
				success: $.proxy(this.onSubmitSuccess, this)
			});
		
		},
		
		onLogoutSuccess: function(e) {
			this.fire('logout');
		}
	
	});
	
	O.WMSocial.EventController = O.View.define({
	
		getType: function() {
			return 'wm-event';
		},
		
		getTriggers: function() {
			return ['back', 'flip'];
		},
		
		getBindings: function() {
			return {
				'social-events-list': { 'select': true }
			};
		},
		
		onDidLoad: function() {		
			if(this.hasElement('back-btn')) this.getElement('back-btn').on('touchclick', $.proxy(this.onBack, this));
			if(this.hasElement('flip-btn')) this.getElement('flip-btn').on('touchclick', $.proxy(this.onFlip, this));
			this.getElement('attend-btn').on('touchclick', $.proxy(this.onAttend, this));
		},
		
		onBack: function(e) {
			this.fire('back');
		},
		
		onFlip: function(e) {
			this.fire('flip');
		},
		
		onAttend: function(e) {
			
			// get data
			var eventInfo = this.getBinding('event-info').getData();
			
			// bind data
			if(eventInfo.get('attending')) {
				eventInfo.set('attending', false);
			else {
				eventInfo.set('attending', true);
			}
			
			// save changes
			O.Model.get('Event').save(eventInfo);
			
		},
		
		setData: function(data) {
			this.getBinding('event-info').bindData(data);
		}
	
	});

}, ['ui', 'ios'], '0.1');