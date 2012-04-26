/**
 * ios.js | OrangeUI iOS Module 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, ui, db, jquery-1.7.2
 * @description adds ios element controls
 */
 
Orange.add('ios', function(O) {

	O.namespace('iOS');

	/* base view controls */

	O.iOS.UIView = O.View.define({
		
		type: 'ios-ui-view',

		onLoad: function() {
			this.super.onLoad.call(this);
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
		}
			
	});

	O.iOS.UINavigationView = O.View.define({
		
		type: 'ios-ui-navigation-view',
		
		activeView: null,
		leftBtn: null,
		rightBtn: null,
		navBar: null,
		
		onLoad: function() {

			for(var i in this._views) {
				this._views[i].target.addClass('inactive');
			}

			// get active view
			var defaultView = this.target.attr('data-default');
			this.activeView = this.getView(defaultView);
			
			// setup navigation bar
			this.navBar = $('<div class="ios-ui-navigation-bar"></div>');
			this.target.prepend(this.navBar);
			
			// setup buttons
			var leftViewBtn = this.activeView.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = this.activeView.find('.ios-ui-bar-button-item.right');
			
			if(leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone();
				this.leftBtn.appendTo(this.navBar);
			}
			
			if(leftViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone();
				this.rightBtn.appendTo(this.navBar);
			}
			
			// push active view
			this.activeView.target.addClass('active').removeClass('inactive');
			
			this.super.onLoad.call(this);
						
			this.target.removeAttr('data-default');
			
//			$('body').on('click', $.proxy(function() {
//				this.pushView('second');
//			}, this));
			
		},
		
		popView: function() {
		
		},
		
		pushView: function(view) {

			// fetch view, exception handled in getView()
			view = this.getView(view);
			if(this.activeView.target[0] == view.target[0]) {
				return;
			}
							
			// get buttons
			var leftViewBtn = view.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = view.find('.ios-ui-bar-button-item.right');
	
			// hide existing buttons
			this.leftBtn.fadeOut(100, function() { $(this).remove(); });
			this.rightBtn.fadeOut(100, function() { $(this).remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone().hide();
				this.leftBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.leftBtn.fadeIn(100);
				}, this), 100);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone().hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.rightBtn.fadeIn(100);
				}, this), 100);
			}
			
			var activeView = this.activeView;
			
			// unload existing view
			if (this.activeView.length != 0) {
				activeView.target.removeClass('active').addClass('inactive');
			}
			
			// append new view
			this.activeView = view;
			view.target.removeClass('inactive').addClass('active');
			this.target.append(view);

		},
		
		popToRootView: function() {
		
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
		}
			
	});
	
	O.iOS.UIScrollView = O.View.define({
		
		type: 'ios-ui-scroll-view',
		
		onLoad: function() {
			this.super.onLoad.call(this);
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
		}
			
	});
	
	O.iOS.UITableView = O.View.define({
		
		type: 'ios-ui-table-view',
		
		onLoad: function() {
		
			// setup iscroll
			this.myScroll = new iScroll(this.target.get(0));
			this.super.onLoad.call(this);
		},
		
		onRefresh: function() {
		
		},
		
		bindData: function(data) {
		
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
			this.myScroll.destroy();
		}
			
	});
	
	O.iOS.UIModalView = O.View.define({
		
		onLoad: function() {
			this.super.onLoad.call(this);
		},
		
		activateModalView: function() {
		
		},
		
		dismissModalView: function() {
		
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
		}
			
	});
	
	O.iOS.UIFlipView = O.View.define({
		
		onLoad: function() {
			this.super.onLoad.call(this);
		},
		
		flipView: function() {
		
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
		}
			
	});
	
	
	/* module management */
	
	O.iOS.ModuleManager = O.define({
	
		initialize: function() {
		
			// handle bar button events
			
			// handle segmented controls
			
			// handle form input defaults
		
		},
		
		destroy: function() {
		
		}
	
	});
	
	
	/* element controls */
	
	O.iOS.UISegmentedControl = O.Element.define({
	
		type: 'ios-ui-segmented-control',
	
		onLoad: function() {
			this.super.onLoad.call(this);
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
		}
	
	});
	
	O.iOS.UINavigationBar = O.Element.define({
		
		type: 'ios-ui-navigation-bar',
	
		onLoad: function() {
			this.super.onLoad.call(this);
		},
		
		onUnload: function() {
			this.super.onLoad.call(this);
		}
	
	});
	
}, ['ui', 'db'], '0.1');