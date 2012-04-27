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
			this._super();
		},
		
		onUnload: function() {
			this._super();
		}
			
	});

	O.iOS.UINavigationView = O.View.define({
		
		type: 'ios-ui-navigation-view',
		
		activeView: null,
		leftBtn: null,
		rightBtn: null,
		navBar: null,
		viewStack: [],
		
		initialize: function(parent, target) {

			this._super(parent, target);
		
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
			
			if(rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone();
				this.rightBtn.appendTo(this.navBar);
			}
			
			// push active view
			this.activeView.target.addClass('active');
			
			// override parent
			this.target.removeAttr('data-name');
			this.target.removeAttr('data-view');
			
			this.activeView.onLoad();
			
			for (var name in this._elements) {
				this._elements[name].onLoad();
			}
			
			// clear attributes
			this.target.removeAttr('data-default');
			
		},
		
		popView: function() {
			
			var duration = 200;
			
			// get previous view		
			var view = this.viewStack[this.viewStack.length-2];

			// get buttons
			var leftViewBtn = view.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = view.find('.ios-ui-bar-button-item.right');
			
			// hide existing buttons
			if(this.leftBtn != null) this.leftBtn.fadeOut(duration+100, function() { $(this).remove(); });
			if(this.rightBtn != null) this.rightBtn.fadeOut(duration+100, function() { $(this).remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone().hide();
				this.leftBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.leftBtn.fadeIn(duration+100);
				}, this), duration);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone().hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.rightBtn.fadeIn(duration+100);
				}, this), duration);
			}
			
			if (leftViewBtn.length == 0 && rightViewBtn.length == 0 && navBar.length == 0) {
				this.navBar.addClass('hidden');
				view.target.css('top', '0px');
			} else {
				this.navBar.removeClass('hidden');
				view.target.css('top', '44px');
			}
			
			var activeView = this.activeView;
			
			// unload existing view
			if (this.activeView.length != 0) {
				activeView.target.addClass('unloading').removeClass('active');
				this.viewStack.pop();
			}
			
			setTimeout($.proxy(function() {
				activeView.target.addClass('preloaded').removeClass('unloading');
				activeView.target.remove();
				activeView.onUnload();
			}, this), duration);
			
			// append new view
			this.activeView = view;
			view.target.addClass('loading').removeClass('inactive');
			
			setTimeout($.proxy(function() {
				view.target.addClass('active').removeClass('loading');
			}, this), duration);
					
		},
		
		pushView: function(view) {
				
			var duration = 200;
						
			// fetch view, exception handled in getView()
			view = this.getView(view);
			for(var i in this.viewStack) {
				if(this.viewStack[i].target[0] == view.target[0]) {
					throw "Can't repush view controller";
				}
			}
			
			// append new view
			view.target.addClass('preloaded');
			this.target.append(view.target);
			view.onLoad();
			
			// get buttons
			var leftViewBtn = view.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = view.find('.ios-ui-bar-button-item.right');
			var navBar = view.find('ios-ui-navigation-bar');
	
			// hide existing buttons
			if(this.leftBtn != null) this.leftBtn.fadeOut(duration+100, function() { $(this).remove(); });
			if(this.rightBtn != null) this.rightBtn.fadeOut(duration+100, function() { $(this).remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone().hide();
				this.leftBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.leftBtn.fadeIn(duration);
				}, this), duration-100);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone().hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.rightBtn.fadeIn(duration);
				}, this), duration-100);
			}
			
			if (leftViewBtn.length == 0 && rightViewBtn.length == 0 && navBar.length == 0) {
				this.navBar.addClass('hidden');
				view.target.css('top', '0px');
			} else {
				this.navBar.removeClass('hidden');
				view.target.css('top', '44px');
			}
			
			var activeView = this.activeView;
			
			// unload existing view
			if (this.activeView.length != 0) {
					activeView.target.addClass('inactivating').removeClass('active');
			}
			
			setTimeout($.proxy(function() {
				activeView.target.addClass('inactive').removeClass('inactivating');
			}, this), duration);
			
			this.activeView = view;
			view.target.addClass('loading').removeClass('preloaded');;
			this.viewStack.push(view);
			
			setTimeout($.proxy(function() {
				view.target.addClass('active').removeClass('loading');
			}, this), duration);
				
		},
		
		popToRootView: function() {
		
			var duration = 100;
			
			// clear view stack
			for(var i = 1; i < this.viewStack.length-1; i++) {
				this.viewStack[i].target.remove();
			}
						
			// get root view		
			var view = this.viewStack[0];

			// get buttons
			var leftViewBtn = view.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = view.find('.ios-ui-bar-button-item.right');
			
			// hide existing buttons
			if(this.leftBtn != null) this.leftBtn.fadeOut(duration, function() { $(this).remove(); });
			if(this.rightBtn != null) this.rightBtn.fadeOut(duration, function() { $(this).remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone().hide();
				this.leftBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.leftBtn.fadeIn(duration);
				}, this), duration);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone().hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.rightBtn.fadeIn(duration);
				}, this), duration);
			}
			
			var activeView = this.activeView;
			
			// unload existing view
			if (this.activeView.length != 0) {
				activeView.target.addClass('unloading');
				this.viewStack.pop();
			}
			
			setTimeout($.proxy(function() {
				activeView.target.addClass('preloaded').removeClass('unloading').removeClass('active');
				activeView.target.remove();
			}, this), duration);
			
			// append new view
			this.activeView = view;
			view.target.addClass('loading');
			
			setTimeout($.proxy(function() {
				view.target.addClass('active').removeClass('loading').removeClass('inactive');
				this.viewStack = [this.viewStack[0]];
			}, this), duration);
		
		},
		
		onUnload: function() {
			this._super();
		}
			
	});
	
	O.iOS.UIScrollView = O.View.define({
		
		type: 'ios-ui-scroll-view',
				
		onLoad: function() {

			// wrap the view
			this.target.wrapInner('<div class="scroll-view"></div>');
		
			// setup iscroll
			this.myScroll = new iScroll(this.target.get(0));
			this._super();
									
		},
		
		onUnload: function() {
			this._super();
			this.myScroll.destroy();
		}
			
	});
	
	O.iOS.UITableView = O.View.define({
		
		type: 'ios-ui-table-view',
		
		onLoad: function() {
						
			// wrap the view
			this.target.wrapInner('<div class="scroll-view"></div>');

			// setup iscroll
			this.myScroll = new iScroll(this.target.get(0));
			this._super();
			
		},
		
		onRefresh: function() {
			this.myScroll.refresh();
		},
		
		onUnload: function() {
			this._super();
			this.myScroll.destroy();
		}
			
	});
	
	O.iOS.UIModalView = O.View.define({
		
		type: 'ios-ui-modal-view',
		
		onLoad: function() {
			this._super();
		},
		
		activateModalView: function() {
		
		},
		
		dismissModalView: function() {
		
		},
		
		onUnload: function() {
			this._super();
		}
			
	});
	
	O.iOS.UIFlipView = O.View.define({
		
		type: 'ios-ui-flip-view',
				
		onLoad: function() {
			this._super();
		},
		
		flipView: function() {
		
		},
		
		onUnload: function() {
			this._super();
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
			this._super();
		},
		
		onUnload: function() {
			this._super();
		}
	
	});
	
	O.iOS.UINavigationBar = O.Element.define({
		
		type: 'ios-ui-navigation-bar',
	
		onLoad: function() {
			this._super();
		},
		
		onUnload: function() {
			this._super();
		}
	
	});
	
}, ['ui', 'db'], '0.1');