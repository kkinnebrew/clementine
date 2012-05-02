Orange.add('wmsocial', function(O) {

	O.namespace('WMSocial');
	
	O.UITableVIew = O.View.define({
	
		getType: function() {
			return 'ui-table-view';
		},
		
		getTriggers: function() {
			return ['select']
		},
		
		getEvents: function() {
			return {}
		}
	
	});
	
	O.FeedTableView = O.View.extend(O.UITableView, {
	
		getType: function() {
			return 'feed-table-view';
		},
		
		getTriggers: function() {
			return ['select', 'delete'];
		},
		
		getEvents: function() {
			return {};
		}
	
	});
	
	O.ParentController = O.View.define({
	
		getType: function() {
			return 'parent-view';
		},
		
		getTriggers: function() {
			return [];
		},
		
		getEvents: function() {
			return {
				'feed-table-view': { 'select': true, 'delete': true }
			};
		},
		
		onLoad: function() {		
			this.find('back-btn').on('click', this.onClick);
		},		
		
		onClick: function() {
		
			// get data
			var data = O.Model.get('Event').get(id);
		
			this.fire('select', data);
				
		},
		
		onUnload: function() {
			this.find('back-btn').off();
		},
		
		onSelect: function(e) {
		
		},
		
		onDelete: function(e) {
		
		}
	
	});
	
	
	
	O.WMSocial.SocialAppController = O.View.extend(O.UIMultiViewController, {
	
		getType: function() {
			return 'wm-social-app';
		},
		
		getTriggers: function() {
			return [];
		},
		
		getEvents: function() {
			return {
				'social-home': { 'authenticated': true },
				'social-main': { 'logout': true }
			}
		}
		
		onAuthenticated: function(e) {
			
		},
		
		onLogout: function(e) {
			
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
				'social-home-multiview': { 'login': true, 'setup': true }
			}
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