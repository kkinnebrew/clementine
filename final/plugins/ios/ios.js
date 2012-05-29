/**
 * ios.js | Orange iOS Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc, ui, jquery-1.7.2, iscroll
 * @description adds ios specific controllers
 */

Orange.add('ios', function(O) {

	var Application, UIFlipViewController, UIModalViewController, UINavigationViewController, UIScrollViewController, 
			UISearchViewController, UISplitViewController, UITabBarController, UITableViewController, UIViewController;
	
	var ViewController = __import('ViewController'), Collection = __import('Collection'), Binding = __import('Binding');
	
	Application = O.Application.extend({
	
		onLaunch: function(online) {
			document.body.addEventListener('touchmove', function(e){ 
				e.preventDefault();
			});
			document.body.addEventListener('touchend', function(e){ 
				$(".ios-ui-bar-button-item").removeClass('touched')
			});
			
			var that = this;
			
		  window.onorientationchange = function()
		  {
		  	var orientation;
		    switch(window.orientation) 
		    {  
		      case -90:
		      case 90:
		        orientation = 'landscape';
		        break; 
		      default:
		        orientation = 'portrait';
		        break; 
		    }
		    (function() {
		    	that.onOrientationChange.call(that, orientation);
		    })();
		  };
			
			window.onorientationchange.call(this);
			
			this._super();
		},
		
		onOrientationChange: function(orientation) {
			if (orientation == 'landscape') {
				$('body').removeClass('portrait').addClass('landscape');
			} else {
				$('body').removeClass('landscape').addClass('portrait');
			}
		}
	
	});
	
	
	UIFlipViewController = ViewController.extend({
	
		getType: function() { return 'ios-ui-flip-view' },

		onDidLoad: function() {
			for(var view in this._views) {
				this._views[view].target.addClass('animated');
			}
			this.find('.back').css('opacity', 0).hide();
		},
		
		flipView: function(name) {
			if (this.target.hasClass('flipped')) {
				this.target.removeClass('flipped');
				setTimeout(Class.proxy(function() {
					this.find('.back').css('opacity', 0);
				}, this), 300);
				setTimeout(Class.proxy(function() {
					this.find('.back').hide();
				}, this), 350);
			} else {
				this.find('.back').show();
				setTimeout(Class.proxy(function() {
					this.find('.back').css('opacity', 1);
				}, this), 350);
				setTimeout(Class.proxy(function() {
					this.target.addClass('flipped');
				}, this), 50);
			}
		}
	
	});
	
	
	UIModalViewController = ViewController.extend({
		
		getType: function() { return 'ios-ui-modal-view' },
		
		presentModalView: function() {
			
			this.onLoad();
			
			$('body').append(this.target);
			
			setTimeout(Class.proxy(function() {
				this.target.addClass('visible');
			}, this), 50);
					
		},
		
		dismissModalView: function() {
					
			this.target.removeClass('visible');
			setTimeout(Class.proxy(function() {
				this.target.remove();
				this.onUnload();
			}, this), 300);
		
		}
			
	});
	
	
	UINavigationViewController = ViewController.extend({
			
		getType: function() { return 'ios-ui-navigation-view' },
		
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
			for (var i in this.views) {
				if (this.views[i].name !== defaultView) {
					this.views[i].target.remove();
				} else {
					this.viewStack.push(this.views[i]);
					this.activeView = this.views[i];
				}
			}

			this.target.removeAttr('data-default');
														
		},
		
		onDidLoad: function() {
				
			// setup navigation bar
			this.navBar = $('<div class="ios-ui-navigation-bar"></div>');
			this.target.prepend(this.navBar);

			// setup buttons
			var leftViewBtn = this.activeView.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = this.activeView.find('.ios-ui-bar-button-item.right');
			
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone(true);
				
				this.leftBtn.appendTo(this.navBar);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true);
				this.rightBtn.appendTo(this.navBar);
			}
			
			this.activeView.target.addClass('active');
			this.popping = false;
			
		},
		
		
		popView: function() {
			
			var duration = 300;
			
			// get previous view		
			var view = this.viewStack[this.viewStack.length-2];

			// get buttons
			var leftViewBtn = view.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = view.find('.ios-ui-bar-button-item.right');
			
			// hide existing buttons
			if (this.leftBtn != null) {
				if (this.leftBtn.hasClass('back')) {
					this.leftBtn.addClass('slideIn');
					this.leftBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
				}
				else this.leftBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
			}
			if (this.rightBtn != null) this.rightBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				var newleftBtn = leftViewBtn.clone(true).hide();
				newleftBtn.appendTo(this.navBar);
				setTimeout(Class.proxy(function() {
					newleftBtn.fadeIn(duration-100);
					this.leftBtn = newleftBtn;
				}, this), 100);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout(Class.proxy(function() {
					this.rightBtn.fadeIn(duration-100);
				}, this), 100);
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
			
			setTimeout(Class.proxy(function() {
				activeView.target.addClass('preloaded').removeClass('unloading');
				activeView.target.remove();
				activeView.onUnload();
			}, this), duration);
			
			// append new view
			this.activeView = view;
			view.target.addClass('loading').removeClass('inactive');
			
			setTimeout(Class.proxy(function() {
				view.target.addClass('active').removeClass('loading');
			}, this), duration);
					
		},
		
		pushView: function(view) {
				
			var duration = 300;
									
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
			if (this.leftBtn != null) {
				if (this.leftBtn.hasClass('back')) {
					this.leftBtn.addClass('slideOut');
					setTimeout(Class.proxy(function() { 
						this.leftBtn.unbind().remove();
					}, this), 200);
				}
				else this.leftBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
			}
			if(this.rightBtn != null) this.rightBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				var newleftBtn = leftViewBtn.clone(true).hide();
				newleftBtn.appendTo(this.navBar);
				setTimeout(Class.proxy(function() {
					newleftBtn.fadeIn(duration-100);
				}, this), 150);
				setTimeout(Class.proxy(function() {
					this.leftBtn = newleftBtn;
				}, this), 300);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout(Class.proxy(function() {
					this.rightBtn.fadeIn(duration-100);
				}, this), 100);
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
			
			setTimeout(Class.proxy(function() {
				activeView.target.addClass('inactive').removeClass('inactivating');
			}, this), duration);
			
			this.activeView = view;
			view.target.addClass('loading').removeClass('preloaded');;
			this.viewStack.push(view);
			
			setTimeout(Class.proxy(function() {
				view.target.addClass('active').removeClass('loading');
			}, this), duration);
				
		},
		
		popToRootView: function() {
		
			if (this.popping) return;
			this.popping = true;
				
			var duration = 300;
			
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
			if (this.leftBtn != null) {
				if (this.leftBtn.hasClass('back')) {
					this.leftBtn.addClass('slideIn');
					this.leftBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
				}
				else this.leftBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
			}
			if (this.rightBtn != null) this.rightBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
			
			// add new buttons
			if (leftViewBtn.length != 0) {
				var newleftBtn = leftViewBtn.clone(true).hide();
				newleftBtn.appendTo(this.navBar);
				setTimeout(Class.proxy(function() {
					newleftBtn.fadeIn(duration-100);
					this.leftBtn = newleftBtn;
				}, this), 100);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout(Class.proxy(function() {
					this.rightBtn.fadeIn(duration-100);
				}, this), 100);
			}
			
			var activeView = this.activeView;
			
			// unload existing view
			if (this.activeView.length != 0) {
				activeView.target.addClass('unloading');
				this.viewStack.pop();
			}
			
			setTimeout(Class.proxy(function() {
				activeView.target.addClass('preloaded').removeClass('unloading').removeClass('active');
				activeView.target.remove();
			}, this), duration);
			
			// append new view
			this.activeView = view;
			view.target.addClass('loading');
			
			setTimeout(Class.proxy(function() {
				view.target.addClass('active').removeClass('loading').removeClass('inactive');
				this.viewStack = [this.viewStack[0]];
				this.popping = false;
			}, this), duration);
		
		}
		
	});
	
	
	UIScrollViewController = ViewController.extend({
		
		getType: function() { return 'ios-ui-scroll-view' },
		
		initialize: function(parent, target) {
			this._super(parent, target);
			this.target.wrapInner('<div class="scroll-view"></div>');
			this.myScroll = new iScroll(this.target.get(0));
		},
		
		onDidLoad: function() {
			this.myScroll.refresh();
		},
		
		onWillUnload: function() {
			this.myScroll.destroy();
		}
			
	});
	
	
	// UISearchViewController
	// UISplitViewController
	
	
	UITabBarController = ViewController.extend({
			
		getType: function() { return 'ios-ui-tab-view' },
			
		initialize: function(parent, target) {
							
			this._super(parent, target);
			
			// get name of default view
			var defaultView = this.target.attr('data-default');
																									
			// remove views from DOM
			for (var i in this.views) {
				if (this.views[i].name !== defaultView) {
					this.views[i].target.addClass('hidden');
				} else {
					this.activeView = this.views[i];
				}
			}
			
			this.target.removeAttr('data-default');
			
		},
		
		onWillLoad: function() {

			// get tab bar
			this.tabBar = this.target.find('.ios-ui-tab-bar');
			if(typeof this.tabBar === 'undefined') throw 'Tab bar element required in view';

			// get name of active view
			var name = this.activeView.target.attr('data-name');

			// set tab bar active
			this.tabBar.find('.ios-ui-tab-bar-item').removeClass('active');
			this.tabBar.find('.ios-ui-tab-bar-item:[data-tab="' + name + '"]').addClass('active');

			// bind events
			this.tabBar.delegate('.ios-ui-tab-bar-item', O.Browser.isTouch ? 'touchend' : 'click', Class.proxy(this.onClick, this));

			// load view
			for (var i in this.views) {
				this.views[i].onLoad();
			}
							
		},
		
		onClick: function(e) {
		
			var target = $(e.currentTarget);
			var tab = target.attr('data-tab');
							
			this.activateTab(tab);
		
		},
		
		activateTab: function(name) {
		
			this.activeView.target.addClass('hidden');
			this.getView(name).target.removeClass('hidden');
			this.activeView = this.getView(name);
			
			this.tabBar.find('.ios-ui-tab-bar-item').removeClass('active');
			this.tabBar.find('.ios-ui-tab-bar-item:[data-tab="' + name + '"]').addClass('active');
		
		}
			
	});
	
	
	UITableViewController = ViewController.extend({
			
		getType: function() { return 'ios-ui-table-view' },
		
		onWillLoad: function() {
			
			var tableCell = this.target.attr('data-cell-element');
			if (typeof tableCell !== 'undefined') {	
				this.tableCell = O.TemplateManager.load('app/elements/' + tableCell);
				this.target.wrapInner('<div class="scroll-view"><ul></ul></div>');
			} else {
				this.target.wrapInner('<div class="scroll-view"></div>');
			}
			
			this.myScroll = new iScroll(this.target.get(0));
			this.target.removeAttr('data-cell-element');
		
		},
		
		onDidLoad: function() {
			
			if (typeof tableCell !== 'undefined') {	
				this.target.on('click', Class.proxy(this.onSelect, this));
			}
			
			this.target.on('touchmove', Class.proxy(function(e) {
				e.stopPropagation();
				e.preventDefault();				
			}, this));
			
			this.setupTable();
			
		},
		
		setupTable: function() {
					
			var target = this.target.find('ul');
						
			if (this.collection instanceof Collection) {
				Binding.bindList(this.find('ul'), this.collection);
			}
			
			this.myScroll.refresh();
		
		},
		
		onRefresh: function() {
			this.setupTable();
		},
		
		bindData: function(list, live) {
				
			if (list instanceof Collection) {
				this.collection = list;
				if (live) {
					if (this.liveEvt) this.liveEvt.detach();
					var model = data.getModel();
					this.liveEvt = model.on('datachange', function(d) {
						if (list.mergeChanges(d)) Binding.bindList(this.find('ul'), list);
					}, this);
				}
			}
			
			this.setupTable();
					
		},
		
		onSelect: function(e) {
				
			// get target
			var target = $(e.target);
			var cell = null;
			
			// stop propagation
			e.stopPropagation();
			
			// check if target is a table cell
			if (target.hasClass('ios-ui-table-cell')) {
				cell = target;
			} else if (target.parent().hasClass('ios-ui-table-cell')) {	
				cell = target.parent();
			}
			
			if(cell != null) {

				// get data id
				var id = $(cell).attr('itemid');
				
				// get entry
				if (this.collection instanceof Collection) var data = this.collection.get(id);
				
				// fire event
				this.fire('select', (typeof data !== 'undefined') ? data : null);
			
			}
		
		},
		
		onWillUnload: function() {
			this._super();
			this.myScroll.destroy();
		}
			
	});
	
	
	UIViewController = ViewController.extend({
			
		getType: function() { return 'ios-ui-view' },
			
	});
	
	
	O.namespace('iOS');
	
	O.iOS.Application	= Application;
	
	O.iOS.UIFlipViewController 				= UIFlipViewController;
	O.iOS.UIModalViewController				= UIModalViewController;
	O.iOS.UINavigationViewController 	= UINavigationViewController;
	O.iOS.UIScrollViewController 			= UIScrollViewController;
	O.iOS.UISearchViewController 			= UISearchViewController;
	O.iOS.UISplitViewController 			= UISplitViewController;
	O.iOS.UITabBarController					= UITabBarController;
	O.iOS.UITableViewController 			= UITableViewController;
	O.iOS.UIViewController 						= UIViewController;
	
}, ['mvc', 'ui'], '1.0.2');