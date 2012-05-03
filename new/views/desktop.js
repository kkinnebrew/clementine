Orange.add('wmsocial', function(O) {

	O.namespace('WMSocial');
	
	/* base classes */

	O.Controller = O.define({
		
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
		
	});
	
	O.ViewController = O.extend(O.Controller, {
	
		initialize: function(parent, target) {},
		
		
		getType: function() {},
		
		getTriggers: function() {},
		
		getBindings: function() {},
		
		
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		
		getView: function(name) {},
		
		getItem: function(name) {},
		
		getForm: function(name) {},
		
		getBinding: function(name) {},
		
		
		hasView: function(name) {},
		
		hasItem: function(name) {},
		
		hasForm: function(name {},
		
		
		on: function(event, callback, context) {},
		
		detach: function(event, callback) {},
		
		fire: function(event, data) {},
		
		
		bindData: function(data) {},	
				
		
		destroy: function() {}
	
	});
	
	O.Form = O.define({
	
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
	O.Model = O.define({
	
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
	
	O.UI.NavigationController = O.extend(O.ViewController, {
	
		getType: function() { return 'ui-navigation-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.GridController = O.extend(O.ViewController, {
	
		getType: function() { return 'ui-grid-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.TableController = O.extend(O.ViewController, {
	
		getType: function() { return 'ui-table-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.ListController = O.extend(O.ViewController, {
	
		getType: function() { return 'ui-list-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
			
	});
	
	O.UI.MultiViewController = O.extend(O.ViewController, {
	
		getType: function() { return 'ui-multi-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		activate: function(name) {}
			
	});
	
	O.UI.TabController = O.extend(O.ViewController, {
	
		getType: function() { return 'ui-tab-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		activate: function(name) {}
			
	});
	
	O.UI.LightBoxController = O.extend(O.ViewController, {
	
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

	O.iOS.UINavigationController = O.extend(O.NavigationController, {
	
		getType: function() { return 'ios-ui-navigation-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
	
	});
	
	O.iOS.UIModalViewController = O.extend(O.ViewController, {
	
		getType: function() { return 'ios-ui-modal-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
	
	});
	
	O.iOS.UITabBarController = O.extend(O.ViewController, {
	
		getType: function() { return 'ios-ui-tab-bar-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		activate: function(name) {}
	
	});

	O.iOS.UISplitViewController = O.extend(O.ViewController, {
	
		getType: function() { return 'ios-ui-split-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {},
		
		setCollection: function(collection) {},
		
		getCollection: function() {},
		
		clearCollection: function() {}
	
	});

	O.iOS.UITableViewController = O.extend(O.ViewController, {
	
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
	
	O.iOS.UISearchBarController = O.extend(O.ViewController, {
	
		getType: function() { return 'ios-ui-search-bar-view' },
	
		onWillLoad: function() {},
		
		onDidLoad: function() {},
		
		onWillUnload: function() {},
		
		onDidUnload: function() {}
	
	});
		
	
	
	/* WMSocial application controllers */

	O.WMSocial.SocialAppController = O.Controller.extend(O.UIMultiViewController, {
	
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
	
	O.WMSocial.HomeController = O.Controller.extend(O.UIMultiViewController, {
		
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
	
	O.WMSocial.HomeMultiViewController = O.Controller.extend(O.UIMultiViewController, {
		
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
	
	O.WMSocial.MainController = O.Controller.extend(O.ViewController, {
		
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
	
	O.WMSocial.MobileViewController = O.Controller.extend(O.UINavigationController, {
		
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
	
	O.WMSocial.FlipController = O.Controller.extend(O.iOS.UIFlipController, {
		
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
	
	O.WMSocial.LoginController = O.Controller.extend(O.ViewController, {
		
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
	
	O.WMSocial.SetupController = O.Controller.extend(O.ViewController, {
	
		getType: function() {
			return 'wm-setup';
		},
		
		getTriggers: function() {
			return ['login'];
		},
		
		onDidLoad: function() {		
			this.getItem('submit-btn').on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onClick, this));
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
	
	O.WMSocial.FeedController = O.Controller.extend(O.ViewController, {
	
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
			this.getItem('logout-btn').on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onLogout, this));
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
	
	O.WMSocial.EventController = O.Controller.extend(O.ViewController, {
	
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
			if(this.hasItem('back-btn')) this.getItem('back-btn').on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onBack, this));
			if(this.hasItem('flip-btn')) this.getItem('flip-btn').on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onFlip, this));
			this.getItem('attend-btn').on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onAttend, this));
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