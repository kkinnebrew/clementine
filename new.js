Orange.add('social', function(O) {

	O.namespace('WMSocial');
	
	O.WMSocial.SocialAppController = O.View.extend(O.UIMultiViewController, {
	
		getType: function() { return 'wm-social-app' },
		
		getStates: function() {
			return {
				'login': function() {
					this.activateView('login');
				},
				'feed': function() {
					this.activateView('feed');
				}
			};
		},
		
		getBindings: function() {
			return {
				'login': { 'authenticated': true },
				'feed': { 'logout': true }
			};
		}
	
	});
	
	O.WMSocial.SocialAuthenticationController = O.View.extend(O.UIFlipViewController, {
	
		getType: function() { return 'wm-auth' },
		
		getTriggers: function() {
			return ['authenticated'];
		},
		
		getStates: function() {
			return {
				'login': function() {
					this.flipToView('login');
				},
				'setup': function() {
					this.flipToView('setup');
				}
			};
		},
		
		getBindings: function() {
			return {
				'login': { 'login': true, 'setup': true },
				'setup': { 'login': true }
			};
		},
		
		onLogin: function(e) {
			this.fire('authenticated');
		},
		
		onSetup: function(e) {
			this.setState('setup');
		}
	
	});
	
	O.WMSocial.SocialLoginController = O.View.extend(O.iOS.UIScrollViewController, {
	
		getType: function() { return 'wm-login' },
		
		getTriggers: function() {
			return ['login', 'setup'];
		},
		
		getBindings: function() {
			return {
				'login-btn': { 'touchclick': this.onLogin },
			};
		},
		
		onLogin: function(e) {
			if (e.data == 1) {
				this.fire('login');
			} else if (e.data == 2) {
				this.fire('setup');
			}
		}
	
	});
	
	O.WMSocial.SocialSetupController = O.View.extend(O.iOS.UIScrollViewController, {
	
		getType: function() { return 'wm-setup' },
		
		getTriggers: function() {
			return ['login'];
		},
		
		getBindings: function() {
			return {
				'setup-btn': { 'touchclick': this.onSetup },
			};
		},
		
		onSetup: function(e) {
			this.fire('login');
		}
	
	});
	
	O.WMSocial.SocialFeedController = O.View.extend(O.iOS.UINavigationController, {
	
		getType: function() { return 'wm-feed' },
		
		getTriggers: function() {
			return ['logout'];
		},
		
		getStates: function() {
			return {
				'feed': function() {
					if (this.modalView.isPresented()) this.modalView.dismissModalView();
					this.popToRootView();
				},
				'event': function() {
					if (this.modalView.isPresented()) this.modalView.dismissModalView();
					this.pushView('event');
				},
				'create': function() {
					this.modalView.presentModalView();
				}
			};
		},
		
		getBindings: function() {
			return {
				'feed': { 'select': true }\
			};
		},
		
		onWillLoad: function() {
			this.on('create', this.onCreate, this);
		},
		
		onCreate: function() {
			this.setState('create');
		}
	
	});
	
	O.WMSocial.SocialEventController = O.View.extend(O.UIFlipViewController, {
	
		getType: function() { return 'wm-event' },
		
		getStates: function() {
			return {
				'event': function() {
					this.flipToView('event');
				},
				'map': function() {
					this.flipToView('map');
				}
			};
		}
	
	});
	
	O.WMSocial.SocialEventInfoController = O.View.define({
	
		getType: function() { return 'wm-event-info' },
		
		getBindings: function() {
			return {
				'attend-btn': { 'touchclick': this.onAttend },
			};
		},
		
		onAttend: function(e) {}
	
	});
	
	O.WMSocial.SocialCreateController = O.View.extend(O.iOS.UINavigationController, {
	
		getType: function() { return 'wm-create' },
		
		getTriggers: function() {
			return ['create'];
		},
		
		getStates: function() {
			return {
				'search': function() {
					this.popToRootView();
				},
				'info': function() {
					this.pushView('info');
				}
			};
		},
		
		getBindings: function() {
			return {
				'search': { 'select': true },
			};
		}
	
	});
	
	O.WMSocial.SocialCreateInfoController = O.View.define({
	
		getType: function() { return 'wm-create-info' },
		
		getTriggers: function() {
			return ['create'];
		},
		
		getBindings: function() {
			return {
				'create-btn': { 'touchclick': this.onCreate },
			};
		},
		
		onCreate: function(e) {
			this.fire('create');
		}
	
	});

}, ['mvc'], '0.1');