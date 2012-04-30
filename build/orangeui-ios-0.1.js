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
				}, this), duration);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
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
				}, this), duration);
			}
			
			if (rightViewBtn.length != 0) {
				this.rightBtn = rightViewBtn.clone(true).hide();
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
			
			// get table cell template
			var tableCell = this.target.attr('data-cell-element');
			if (typeof tableCell === 'undefined') throw "UITableView '" + this.name + "' missing 'data-cell-element' attribute";
			this.tableCell = O.TemplateManager.load('app/elements/' + tableCell);
			
			// wrap the view
			this.target.wrapInner('<div class="scroll-view"><ul></ul></div>');

			// setup iscroll
			this.myScroll = new iScroll(this.target.get(0));
			this._super();
			
			// bind select event
			this.target.on('click', $.proxy(this.onSelect, this));
			this.target.removeAttr('data-cell-element');
			
			this.target.on('touchstart', $.proxy(function(e) {
			
				var target = $(e.target);
			
				// check if target is a table cell
				if (target.hasClass('ios-ui-table-cell')) {
					cell = target;
				} else if (target.parent().hasClass('ios-ui-table-cell')) {	
					cell = target.parent();
				}
				
				if(cell != null) {
					cell.addClass('touched');
				}
				
			}, this));
			
			this.target.on('touchend', $.proxy(function(e) {
				this.target.find('.ios-ui-table-cell').removeClass('touched');
			}, this));
						
		},
		
		setupTable: function() {
		
			// build temporary container
			var target = this.target.find('ul');
			var container = target.clone();
			var source = this.tableCell;
		
			// iterate over collection
			for(var i=0, len = this.collection.data.length; i < len; i++) {

				// add templates to the container
				template = new jsontemplate.Template(source);
				var output = '';
				try {
					output = template.expand(this.collection.data[i]);
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
				
			// store reference to collection
			this.collection = data;
						
			// bind event on model
			this.collection.model.on('datachange', $.proxy(this.onDataChange, this));
			
			// setup table
			this.setupTable();
		
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
				var data = this.collection.get(id);
				
				// fire event
				this.fire('select', data);
			
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
		
			$('body').append(this.target);
			console.log("presenting");
		
		},
		
		dismissModalView: function() {
		
			console.log("dismissing");
			this.target.remove();
		
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
	
	O.iOS.UIBarButtonItem = O.Element.define({
		
		type: 'ios-ui-bar-button-item',
	
		onLoad: function() {
			this._super();
		},
		
		onUnload: function() {
			this._super();
		}
	
	});
	
}, ['ui', 'db'], '0.1');