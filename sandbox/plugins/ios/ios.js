/**
 * ios.js | Orange iOS Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc, ui, jquery-1.7.2, iscroll
 * @description adds ios specific controllers
 */

Orange.add('ios', function(O) {

	var Application, UIFlipViewController, UIModalViewController, UINavigationViewController, UIScrollViewController, 
			UISearchBarController, UITabBarController, UITableViewController, UIViewController;
	
	var ViewController = __import('ViewController'), Collection = __import('Collection'), Binding = __import('Binding');
	
	Application = O.UIApplication.extend({
	
		onLoad: function(online) {

			document.body.addEventListener('touchend', function(e){ 
				$(".ios-ui-bar-button-item").removeClass('touched')
			});
			
			$("body").append($('<div id="ios-preload"></div>'));
			
			var that = this;
			
			if (O.Browser.touch) {
				$('body').addClass('touch');
			} else {
				$('body').addClass('nontouch');
			}
			
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
						
			//if (O.Browser.scroll) this.setupScroll();
			
			this._super();
		},
		
		onOrientationChange: function(orientation) {
			if (orientation == 'landscape') {
				$('body').removeClass('portrait').addClass('landscape');
			} else {
				$('body').removeClass('landscape').addClass('portrait');
			}
		},
		
		setupScroll: function() {
		
			document.body.addEventListener('touchstart', onTouchStart, false);
						
			var startY, dy, el, sc;
			
			function onTouchStart(e) {
				el = e.target;

				while (el && !(el.className || '').match(/\bscrollable\b/)) {
				   el = el.parentNode
				}
				
				if (!el) {
					e.preventDefault();
				}
								
				if (e.touches.length == 1 && el) {
					startY = e.touches[0].pageY;
					el.addEventListener('touchmove', onTouchMove, false);
					el.addEventListener('touchend', onTouchEnd, false);
								
					var c = el.childNodes, obj;
					
					for (var i = 0, len = c.length; i < len; i++) {
						obj = c[i];				
						try {
					    if (obj instanceof HTMLElement) sc = obj;
					  }
					  catch(e){
					    if ((typeof obj === "object") &&
					      (obj.nodeType === 1) && (typeof obj.style === "object") &&
					      (typeof obj.ownerDocument ==="object")) sc = obj;
					  }
					}
				}
			}
			
			function onTouchMove(e) {
				if (e.touches.length > 1 || !sc) {
					cancelTouch();
				} else {
					dy = e.touches[0].pageY - startY;
					var offset = el.offsetTop - $(sc).offset().top;
					if ((offset <=0 && dy > 0) || (offset >= el.offsetHeight && dy < 0)) {
						e.preventDefault();
					}
				}
			
			}
		
			function onTouchEnd(e) {
				cancelTouch();
			}
		
			function cancelTouch() {
			
				el.removeEventListener('touchmove', onTouchMove);
				el.removeEventListener('touchend', onTouchEnd);
				
				el = null;
				sc = null;
				startY = null;
				direction = null;
			
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
			
			this.load();
			
			$('body').append(this.target);
			
			setTimeout(Class.proxy(function() {
				this.show();
				this.target.addClass('visible');
			}, this), 50);
					
		},
		
		dismissModalView: function() {
					
			this.hide();
					
			this.target.removeClass('visible');
			setTimeout(Class.proxy(function() {
				this.target.remove();
				this.unload();
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
		
		onLoad: function() {
		
			// run functions
			
			// get default view
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
			
			// load children
			this.activeView.load();
			
			// remove attribute
			this.target.removeAttr('data-default');
			
			// DEBUG
			console.log(this.data.name + ' ' + "Load");
		
			// fire loaded event
			this.fire('_loaded');
		
		},
		
		onAppear: function() {
		
			// run functions
			console.log(this.data.name + ' ' + "Appear");
		
			// show children
			if (this.activeView) this.activeView.show();
		
			// fire appeared event
			this.fire('_appeared');
		
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
			this.animating = false;
						
			// call parent
			this._super();
			
		},
		
		
		popView: function() {
			
			if (this.animating) return;
			this.animating = true;
			
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
				activeView.unload();
			}, this), duration);
			
			// append new view
			this.activeView = view;
			view.target.addClass('loading').removeClass('inactive');
			
			setTimeout(Class.proxy(function() {
				view.target.addClass('active').removeClass('loading');
				this.animating = false;
			}, this), duration);
					
		},
		
		pushView: function(view) {
						
			if (this.animating) return;
			this.animating = true;
			
			var duration = 300;
									
			// fetch view, exception handled in getView()
			view = this.getView(view);
			for(var i in this.viewStack) {
				if(this.viewStack[i].target[0] == view.target[0]) {
					Log.warn("Can't repush view controller");
					return;
				}
			}
			
			// load view
			view.load();
			
			// append new view
			view.target.addClass('preloaded');
			this.target.append(view.target);
			
			// show view
			view.show();
			
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
			activeView.hide();
			view.target.addClass('loading').removeClass('preloaded');;
			this.viewStack.push(view);
			
			setTimeout(Class.proxy(function() {
				view.target.addClass('active').removeClass('loading');
				this.animating = false;
			}, this), duration);
				
		},
		
		popToRootView: function() {
		
			if (this.animating) return;
			this.animating = true;
				
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
				activeView.hide();
				this.viewStack.pop();
			}
			
			setTimeout(Class.proxy(function() {
				activeView.target.addClass('preloaded').removeClass('unloading').removeClass('active');
				activeView.target.remove();
				activeView.unload();
			}, this), duration);
			
			// append new view
			this.activeView = view;
			view.show();
			view.target.addClass('loading');
			
			setTimeout(Class.proxy(function() {
				view.target.addClass('active').removeClass('loading').removeClass('inactive');
				this.viewStack = [this.viewStack[0]];
				this.animating = false;
			}, this), duration);
		
		}
		
	});
	
	
	UIScrollViewController = ViewController.extend({
		
		getType: function() { return 'ios-ui-scroll-view' },
		
		initialize: function(parent, target) {
			this._super(parent, target);
		},
		
		onWillLoad: function() {
			if (!O.Browser.scroll) this.target.wrapInner('<div class="scroll-view"></div>');
			else {
				this.target.wrapInner('<div class="scroller"></div>');
				this.target.addClass('scrollable');
			}
			this._super();
		},
		
		onWillAppear: function() {
			if (!O.Browser.scroll) this.myScroll = new iScroll(this.target.get(0));
			this._super();
		},
		
		onWillDisappear: function() {
			if (!O.Browser.scroll) this.myScroll.destroy();
			this._super();
		},
		
		onWillUnload: function() {
			this._super();
		}
			
	});

	
	UITabBarController = ViewController.extend({
			
		getType: function() { return 'ios-ui-tab-view' },
			
		initialize: function(parent, target) {
							
			this._super(parent, target);
			
			// get name of default view
			this.defaultView = this.target.attr('data-default');
			
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
			this.tabBar.delegate('.ios-ui-tab-bar-item', O.Browser.touch ? 'touchend' : 'click', Class.proxy(this.onClick, this));

			// load view
			for (var i in this.views) {
				this.views[i].onLoad();
				this.views[i].target.addClass('hidden');
			}
							
		},
		
		onWillAppear: function() {
		
			// remove views from DOM
			for (var i in this.views) {
				if (this.views[i].name == defaultView) {
					this.activeView = this.views[i];
					this.activeView.show();
					this.activeView.removeClass('hidden');
				}
			}
		
			this._super();
		
		},
		
		onClick: function(e) {
		
			var target = $(e.currentTarget);
			var tab = target.attr('data-tab');
							
			this.activateTab(tab);
		
		},
		
		activateTab: function(name) {
		
			this.activeView.target.addClass('hidden');
			this.activeView.hide();
			this.getView(name).target.removeClass('hidden');
			this.activeView = this.getView(name);
			this.activeView.show();
			
			this.tabBar.find('.ios-ui-tab-bar-item').removeClass('active');
			this.tabBar.find('.ios-ui-tab-bar-item:[data-tab="' + name + '"]').addClass('active');
		
		}
			
	});
	
	
	UITableViewController = ViewController.extend({
	
		getType: function() {
			return 'ios-ui-table-view';
		},
		
		onWillLoad: function() {
		
			// wrap list
			if (!O.Browser.scroll) this.target.wrapInner('<div class="scroll-view"></div>');			
						
			// get list
			this.list = this.target.find('ul');
			if (O.Browser.scroll) this.target.addClass('scrollable')
			
			// setup binding
			this.binding = new Binding(this.list);
			
			// call parent
			this._super();
				
		},
		
		onDidLoad: function() {
		
			// delegate click event
			this.target.on('click', 'li', Class.proxy(this.onSelect, this));
			
			// call parent
			this._super();
			
		},
		
		onDidAppear: function() {
			
			// setup iscroll
			if (!O.Browser.scroll) this.myScroll = new iScroll(this.target.get(0));
			
			var evt = null;

			// setup touch events
			this.target.on('touchstart', 'li', function(e) {
				clearTimeout(evt);
				evt = setTimeout(function() {
					$(e.currentTarget).addClass('active');
				}, 20);
			});
			
			this.target.on('touchmove', Class.proxy(function(e) {
				clearTimeout(evt); evt = null;
				$(this.target).find('li').removeClass('active');
			}, this));
			
			this.target.on('touchend', Class.proxy(function(e) {
				clearTimeout(evt); 
				if (evt) this.onSelect.call(this, e);
				evt = null;
				$(this.target).find('li').removeClass('active');
			}, this));
			
			this.target.on('touchcancel', Class.proxy(function(e) {
				clearTimeout(evt); evt = null;
				$(this.target).find('li').removeClass('active');
			}, this));
		
			// call parent
			this._super();
		
		},
		
		onWillDisappear: function() {
		
			// destroy iscroll
			if (!O.Browser.scroll) this.myScroll.destroy();
			
			// call parent
			this._super();
		
		},
		
		onWillUnload: function() {
			
			// clear bindings
			this.binding.clear();
			
			// clear touch events
			this.list.off();
			
			// call parent
			this._super();
			
		},
		
		setCollection: function(collection) {
		
			if (collection instanceof Collection) {
			
				// store to view
				this.collection = collection;
				
				// bind collection
				this.binding.bindList(this.collection);
				
				// refresh iscroll
				if (!O.Browser.scroll) this.myScroll.refresh();
				
			}
			
		},
		
		onSelect: function(e) {
		
			var target = $(e.target);
			var cell = null, id = null, model;
									
			if ((id = $(target).attr('itemid')) && this.collection instanceof Collection) {
				if ((model = this.collection.get(id)) instanceof O.Model) {
					this.fire('select', model);
				}
			}
		
		}
	
	});

	
	UISearchBarController = ViewController.extend({
	
		getType: function() {
			return 'ios-ui-search-bar';
		},
	
		onWillLoad: function() {
						
			var isMSIE = /*@cc_on!@*/0, isFF = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
			
			if (isFF) this.find("input[type=text]").wrap('<div class="ios-ff-ui-search-bar-wrapper" />');
			if (isMSIE) this.find("input[type=text]").wrap('<div class="ios-ff-ui-search-bar-wrapper" />');
		
			this._super();
		
		},
		
		onDidLoad: function() {
		
			this.find("input[type=text]").on('keypress', this.onKeyPress);
			this.find("input[type=text]").on('focus', this.onFocus);
			this.find("input[type=text]").on('blur', this.onBlur);
			this.find(".ios-ui-search-button").on('click', this.onClick);
			
			this._super();
		
		},
		
		onKeyPress: function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) { //Enter keycode
        if (!e) var e = window.event;

        e.cancelBubble = true;
        e.returnValue = false;

        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        
        $(this).blur();
      }
		},
		
		onFocus: function(e) {
						
			var bar = $(this).parent();
			var input = $(this);
			var ff = false;
			
			if(bar.hasClass("ios-ff-ui-search-bar-wrapper")) {
				input = bar;
				ff = true;
				bar = bar.parent();
			}
	
			bar.find('.ios-ui-search-button').css('display', 'block');
					
			input.stop().animate({
			  right: (ff ? '117px' : '80px')
			}, (ff ? 0 : 200)).parent().stop().find('.ios-ui-search-button').animate({
			  right: '7px'
			}, (ff ? 0 : 200));
			
		},
		
		onBlur: function(e) {
		
			var bar = $(this).parent();
			var input = $(this);
			var ff = false;
			
			if(bar.hasClass("ios-ff-ui-search-bar-wrapper")) {
				input = bar;
				ff = true;
				bar = bar.parent();
			}
			
			input.stop().animate({
			  right: (ff ? '44px' : '7px')
			}, (ff ? 0 : 200)).parent().stop().find('.ios-ui-search-button').animate({
			  right: '-64px'
			}, (ff ? 0 : 200), function() {
				bar.find('.ios-ui-search-button').css('display', 'none');
			});
		
		},
		
		onClick: function(e) {
			$(this).parent().find("input[type=text]").blur();
		},
		
		onWillUnload: function() {
		
			this.find("input[type=text]").off();
			this.find(".ios-ui-search-button").off();
			
			this._super();
			
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
	O.iOS.UISearchBarController 			= UISearchBarController;
	O.iOS.UITabBarController					= UITabBarController;
	O.iOS.UITableViewController 			= UITableViewController;
	O.iOS.UIViewController 						= UIViewController;
	
}, ['mvc', 'ui'], '1.0.2');