Orange.add('wmsocial', function(O) {

	O.namespace('WMSocial');
	
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
		}
		
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
		
		getEvents: function() {
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
		
		getEvents: function() {
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
	
	O.WMSocial.MainViewController = O.View.extend(O.ViewController, {
		
		getType: function() {
			return 'wm-main';
		},
		
		getTriggers: function() {
			return ['logout'];
		},
		
		getEvents: function() {
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
		
		getEvents: function() {
			return {
				'social-login': { 'login': true, 'firstLogin': true },
				'social-setup': { 'login': true, 'back': true },
				'social-feed': { 'back': true },
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
		}
		
	});
	
	O.WMSocial.LoginController = O.View.define({
		
		getType: function() {
			return 'wm-login';
		},
		
		getTriggers: function() {
			return ['login', 'firstLogin'];
		},
		
		getEvents: function() {
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
		
		getEvents: function() {
			return {};
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
	
	O.WMSocial.FeedController = O.View.define({
	
		getType: function() {
			return 'wm-feed';
		},
		
		getTriggers: function() {
			return ['logout', 'select'];
		},
		
		getEvents: function() {
			return {
				'social-events-list': { 'select': true }
			};
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
	
	O.WMSocial.EventController = O.View.define({
	
		getType: function() {
			return 'wm-event';
		},
		
		getTriggers: function() {
			return ['back', 'flip'];
		},
		
		getEvents: function() {
			return {
				'social-events-list': { 'select': true }
			};
		},
		
		onDidLoad: function() {		
			if(this.hasItem('back-btn')) this.getItem('back-btn').on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onBack, this));
			if(this.hasItem('flip-btn')) this.getItem('flip-btn').on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onFlip, this));
		},
		
		onBack: function(e) {
			this.fire('back');
		},
		
		onFlip: function(e) {
			this.fire('flip');
		},
		
		onLogoutSuccess: function(e) {
			this.fire('logout');
		}
	
	});

}, ['ui'], '0.1');