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
		viewStack: [],
		
		initialize: function() {
			
			// call parent
			this.super.initialize.apply(this, arguments);
		
			// get name of default view
			var defaultView = this.target.attr('data-default');

			// remove views from DOM
			for (var i in this._views) {
				if (this._views[i].name !== defaultView) {
					this._views[i].target.remove();
				} else {
					this.viewStack.push(this._views[i]);
					this.activeView = this._views[i];
				}
			}
		
		},
		
		onLoad: function() {

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
			this.activeView.target.addClass('active');
			
			// call parent
			this.super.onLoad.call(this);
			
			// clear attributes
			this.target.removeAttr('data-default');
			
			// TEMP
			$('body').on('click', $.proxy(function() {
				this.pushView('second');
			}, this));
			
		},
		
		popView: function() {
		
		},
		
		pushView: function(view) {

			// fetch view, exception handled in getView()
			view = this.getView(view);
			for(var i in this.viewStack) {
				if(this.viewStack[i].target[0] == view.target[0]) {
					throw "Can't repush view controller";
				}
			}
							
			// get buttons
			var leftViewBtn = view.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = view.find('.ios-ui-bar-button-item.right');
	
			// hide existing buttons
			// TO DO: swap to css
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
				activeView.target.removeClass('active').addClass('unloading');
			}
			
			setTimeout($.proxy(function() {
				activeView.target.removeClass('unloading').addClass('inactive');
			}, this), 200);
			
			// append new view
			this.activeView = view;
			view.target.addClass('preloaded');
			this.target.append(view.target);
			view.target.removeClass('preloaded').addClass('loading');
			this.viewStack.push(view);
			
			setTimeout($.proxy(function() {
				view.target.removeClass('loading').addClass('active');
			}, this), 200)

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