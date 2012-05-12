/**
 * ios.js | OrangeUI iOS Module 0.2
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

			// load view
			this.activeView.onLoad();

			// setup navigation bar
			this.navBar = $('<div class="ios-ui-navigation-bar"></div>');
			this.target.prepend(this.navBar);

			// setup buttons
			var leftViewBtn = this.activeView.find('.ios-ui-bar-button-item.left');
			var rightViewBtn = this.activeView.find('.ios-ui-bar-button-item.right');
			
			if(leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone(true);
				
				this.leftBtn.appendTo(this.navBar);
			}
			
			if(rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true);
				this.rightBtn.appendTo(this.navBar);
			}
			
			// push active view
			this.activeView.target.addClass('active');
			
			// override parent
			this.target.removeAttr('data-name');
			this.target.removeAttr('data-view');
			
			
			for (var name in this._elements) {
				this._elements[name].onLoad();
			}
			
			// clear attributes
			this.target.removeAttr('data-default');
			
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
			if(this.leftBtn != null) this.leftBtn.fadeOut(duration+100, function() { $(this).unbind().remove(); });
			if(this.rightBtn != null) this.rightBtn.fadeOut(duration+100, function() { $(this).unbind().remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone(true).hide();
				this.leftBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.leftBtn.fadeIn(duration+100);
				}, this), duration-100);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.rightBtn.fadeIn(duration+100);
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
			if(this.leftBtn != null) this.leftBtn.fadeOut(duration+100, function() { $(this).unbind().remove(); });
			if(this.rightBtn != null) this.rightBtn.fadeOut(duration+100, function() { $(this).unbind().remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone(true).hide();
				this.leftBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.leftBtn.fadeIn(duration);
				}, this), duration-100);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
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
			if(this.leftBtn != null) this.leftBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
			if(this.rightBtn != null) this.rightBtn.fadeOut(duration, function() { $(this).unbind().remove(); });
		
			// add new buttons
			if (leftViewBtn.length != 0) {
				this.leftBtn = leftViewBtn.clone(true).hide();
				this.leftBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.leftBtn.fadeIn(duration);
				}, this), duration-100);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
				this.rightBtn.appendTo(this.navBar);
				setTimeout($.proxy(function() {
					this.rightBtn.fadeIn(duration);
				}, this), duration-100);
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
				this.popping = false;
			}, this), duration);
		
		},
		
		onUnload: function() {
			this._super();
		}
			
	});
	
	O.iOS.UIScrollView = O.View.define({
		
		type: 'ios-ui-scroll-view',
		
		initialize: function(parent, target) {
			this._super(parent, target);
			this.target.wrapInner('<div class="scroll-view"></div>');
			this.myScroll = new iScroll(this.target.get(0));
		},
		
		onLoad: function() {

			// setup iscroll
			this.myScroll.refresh();
			this._super();
												
		},
		
		onUnload: function() {
			this._super();
			this.myScroll.destroy();
		}
			
	});
	
	O.iOS.UITabView = O.View.define({
			
			type: 'ios-ui-tab-view',
			
			initialize: function(parent, target) {
								
				this._super(parent, target);
				
				// get name of default view
				var defaultView = this.target.attr('data-default');
																										
				// remove views from DOM
				for (var i in this._views) {
					if (this._views[i].name !== defaultView) {
						this._views[i].target.addClass('hidden');
					} else {
						this.activeView = this._views[i];
					}
				}
				
			},
			
			onLoad: function() {
	
				// get tab bar
				this.tabBar = this.target.find('.ios-ui-tab-bar');
				if(typeof this.tabBar === 'undefined') throw 'Tab bar element required in view';

				// get name of active view
				var name = this.activeView.target.attr('data-name');
	
				// set tab bar active
				this.tabBar.find('.ios-ui-tab-bar-item').removeClass('active');
				this.tabBar.find('.ios-ui-tab-bar-item:[data-tab="' + name + '"]').addClass('active');
	
				// bind events
				this.tabBar.delegate('.ios-ui-tab-bar-item', O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onClick, this));
	
				// load view
				for (var i in this._views) {
					this._views[i].onLoad();
				}
				
				this.target.removeAttr('data-default');
				
				this._super();
																	
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
			
			},
			
			onUnload: function() {
				this._super();
				this.myScroll.destroy();
			}
				
		});
	
	O.iOS.UITableView = O.View.define({
		
		type: 'ios-ui-table-view',
		
		onLoad: function() {
			
			// get table cell template
			var tableCell = this.target.attr('data-cell-element');
			if (typeof tableCell !== 'undefined') {	
				//throw "UITableView '" + this.name + "' missing 'data-cell-element' attribute";
				this.tableCell = O.TemplateManager.load('app/elements/' + tableCell);
				this.target.wrapInner('<div class="scroll-view"><ul></ul></div>');
			} else {
				this.target.wrapInner('<div class="scroll-view"></div>');
			}
			
			// setup iscroll
			this.myScroll = new iScroll(this.target.get(0));
			this._super();
			
			this.target.removeAttr('data-cell-element');
			
			// bind select event
			if (typeof tableCell !== 'undefined') {	
				this.target.on('click', $.proxy(this.onSelect, this));
			}
			
			this.target.on('touchmove', $.proxy(function(e) {
				e.stopPropagation();
				e.preventDefault();				
			}, this));
						
		},
		
		setupTable: function() {
					
			// build temporary container
			var target = this.target.find('ul');
			var container = target.clone();
			var source = this.tableCell;
		
			var data = (this.collection instanceof O.Collection) ? this.collection.data : this.collection;
		
			// iterate over collection			
			for(var key in data) {
				template = new jsontemplate.Template(source);
				var output = '';
				try {
					output = template.expand(data[key]);
				} catch(e) {
					output = source.replace(/{[^)]*}/, '[undefined]');
				}
				container.append($(output));
			}
						
			// remove dom element
			target.replaceWith(container);
			
			// refresh iScroll
			this.myScroll.refresh();
		
		},
		
		onRefresh: function() {
			this.setupTable();
		},
		
		bindData: function(data) {
				
			if (data instanceof O.Collection) {
								
				// store reference to collection
				this.collection = data;
							
				// bind event on model
				//this.collection.model.on('datachange', $.proxy(this.onDataChange, this));
				
				// setup table
				this.setupTable();
			
			} else {
			
				// store reference to collection
				this.collection = data;
			
				// setup table
				this.setupTable();
			
			}
		
		},
		
		onDataChange: function(d) {
		
			// if fields have changed
			if(this.collection.intersect(d.data) > 0) {
				
				// refresh collection
				this.collection.refresh();
				
				// rebuild table
				this.setupTable();
				
			}
		
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
				if (typeof this.collection.get === 'function') var data = this.collection.get(id);
				else if (typeof this.collection === 'object') var data = this.collection[id];
				
				// fire event
				this.fire('select', (typeof data !== 'undefined') ? data : null);
			
			}
		
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
		
		presentModalView: function() {
			this.onLoad();
			$('body').append(this.target);
			
			setTimeout($.proxy(function() {
				this.target.addClass('visible');
			}, this), 50);
					
		},
		
		dismissModalView: function() {
					
			this.target.removeClass('visible');
			setTimeout($.proxy(function() {
				this.target.remove();
				this.onUnload();
			}, this), 300);
		
		},
		
		onUnload: function() {
			this._super();
		}
			
	});
	
	O.UIMultiView = O.View.extend(O.UIView, {
	
		type: 'ui-multi-view',
		
		initialize: function(parent, target) {
			this._super(parent, target);
			this.defaultView = this.target.attr('data-default');
			this.target.removeAttr('data-default');
		},
		
		onLoad: function() {
			for (var i in this._views) {
				if (this._views[i].name !== this.defaultView) {
					this._views[i].target.hide();
				} else {
					this.activeView = this._views[i];
				}
			}
			this._super();
		},
		
		activateView: function(name) {
			var view = this.getView(name);
			if (view instanceof O.ViewController) {
				this.activeView.target.hide();
				this.activeView = view;
				this.activeView.target.show();
			}
		},
		
		getActiveView: function() {
			return this.activeView.name;
		}
		
	});
	
	O.UIFlipView = O.View.extend(O.UIView, {
	
		type: 'ui-flip-view',
		
		onLoad: function() {
			this._super();
			for(var view in this._views) {
				this._views[view].target.addClass('animated');
			}
			this.find('.back').css('opacity', 0).hide();
		},
		
		flipView: function(name) {
			if (this.target.hasClass('flipped')) {
				this.target.removeClass('flipped');
				setTimeout($.proxy(function() {
					this.find('.back').css('opacity', 0);
				}, this), 300);
				setTimeout($.proxy(function() {
					this.find('.back').hide();
				}, this), 350);
			} else {
				this.find('.back').show();
				setTimeout($.proxy(function() {
					this.find('.back').css('opacity', 1);
				}, this), 350);
				setTimeout($.proxy(function() {
					this.target.addClass('flipped');
				}, this), 50);
			}
		}
		
	});
	
	O.iOS.UISegmentedControl = O.View.extend(O.UIView, {
	
		type: 'ios-ui-segmented-control',
		
		onLoad: function() {
		
			this._super();
						
			this.onResize();
			
			this.target.find(".ios-ui-segment").on(O.Browser.isMobile ? 'touchend' : 'click', $.proxy(this.onClick, this));
			$(window).on('resize', $.proxy(this.onResize, this));
		},
		
		onClick: function(e) {
			var segments = this.target.find(".ios-ui-segment");
			segments.removeClass('selected');
			var target = $(e.currentTarget);
			target.addClass('selected');
			var index = segments.index(target);
			this.fire('selected', index);
		},
		
		onResize: function(e) {
		
			var width = this.target.width();
			var elements = this.target.find(".ios-ui-segment").size();
			var padding = parseInt(this.target.find(".ios-ui-segment:first").css('padding-left').replace("px", "")); 
			padding += parseInt(this.target.find(".ios-ui-segment:first").css('padding-right'));
			
			var equalWidths = 0;
			
			if(elements > 1) {
				equalWidths = Math.round(width/elements);
			}
			else if(elements = 1) equalWidths = width;
			else return;
			
			var adj = 0;
			
			if((equalWidths*elements) != width) {
				adj = (equalWidths*elements) - width;
			}
					
			this.target.find(".ios-ui-segment").width(equalWidths-padding);
			this.target.find(".ios-ui-segment:last").width(equalWidths - padding - adj);
			
		},
		
		index: function() {
			var segments = this.target.find(".ios-ui-segment");
			var target = this.target.find(".ios-ui-segment.selected");
			var index = segments.index(target);
			return index;
		},
		
		onUnload: function() {
			$(window).off('resize', $.proxy(this.onResize, this));
		}
	
	});
	
	O.iOS.UIToolbar = O.View.extend(O.UIView, {
	
		type: 'ios-ui-toolbar'
	
	});

	
}, ['mvc', 'db'], '0.2');