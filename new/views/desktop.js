Orange.add('wmsocial', function(O) {

	O.namespace('WMSocial');
	
	O.WMSocial.SocialAppController = O.View.extend(O.UIMultiViewController, {
	
		getType: function() {
			return 'wm-social-app';
		},
	
		onWillLoad: function() [
		
		},
		
		onDidLoad: function() {
		
			this.getView('social-home').on('authenticated', this.onAuthenticated, this);
			this.getView('social-main').on('logout', this.onLogout, this);
		
		},
		
		onAuthenticated: function(e) {
			this.activateView('social-main');
		},
		
		onLogout: function(e) {

		},
		
		onWillUnload: function() {
		
		},
		
		onDidUnload: function() {
		
		}
	
	});
	
	O.WMSocial.HomeController = O.View.extend(O.UIMultiViewController, {
		
		getType: function() {
			return 'wm-home';
		},
		
		onWillLoad: function() [
		
		},
		
		onDidLoad: function() {
		
			this.getView('social-home-multiview').on('login', this.onLogin, this);
			this.getView('social-home-multiview').on('setup', this.onSetup, this);
		
		},
		
		onLogin: function(e) {
			
			if (e.data == 1) {
			
			} else if (e.data == 2) {
			
			} else {
				this.getForm
			}
			
		},
		
		onSetup: function(e) {
		
		},
		
		onWillUnload: function() {
		
		},
		
		onDidUnload: function() {
		
		}
		
	});
	
	O.WMSocial.HomeMultiViewController = O.View.extend(O.UIMultiViewController, {
		
		getType: function() {
			return 'wm-home-multiview';
		},
		
		onWillLoad: function() [
		
		},
		
		onDidLoad: function() {
		
		},
		
		onWillUnload: function() {
		
		},
		
		onDidUnload: function() {
		
		}
		
	});
	
	O.WMSocial.LoginController = O.View.define({
		
		onWillLoad: function() [
		
		},
		
		onDidLoad: function() {
		
			this.getForm('login').getField('login').on('login', this.onLogin, this);
		
		},
		
		onLogin: function() {
		
			if (e.data == 1) {
				this.fire('login');
			} else if (e.data == 2) {
				this.fire('firstLogin');
			} else {
				this.getForm('login').showError('Invalid Login');
			}
		
		},
		
		onWillUnload: function() {
		
		},
		
		onDidUnload: function() {
		
		}
		
	});
	
	O.WMSocial.SetupController = O.View.define({
	
		onWillLoad: function() [
		
		},
		
		onDidLoad: function() {
		
		},
		
		onWillUnload: function() {
		
		},
		
		onDidUnload: function() {
		
		}
	
	});
	
	O.WMSocial.FeedController = O.View.define({
	
		onWillLoad: function() [
		
		},
		
		onDidLoad: function() {
		
		},
		
		onWillUnload: function() {
		
		},
		
		onDidUnload: function() {
		
		}
	
	});
	
	O.WMSocial.EventController = O.View.define({
	
		onWillLoad: function() [
		
		},
		
		onDidLoad: function() {
		
		
		},
		
		onWillUnload: function() {
		
		},
		
		onDidUnload: function() {
		
		}
	
	});

}, ['ui'], '0.1');