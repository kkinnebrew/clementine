/**
 * ios-elements.js | OrangeUI Framework 0.1 | 12.21.2011 
 * 
 * stores the base class and extensions of all ios element
 * renderers
 * 
 */

if (typeof Orange.UI.IOS === 'undefined') {
    Orange.UI.IOS = {};
}

Orange.UI.IOS.UIElement = Class.create({

	initialize: function() {
	
		this.name = this.getClassName(); // class name
		this.el = this.getSource === undefined ? $('<div class="' + this.name + '"></div>') : this.getSource(); // setup DOM element
		this.el.data("control", this); // store reference

		if(this.bindEvents) this.bindEvents();
		
	},
	
	render: function() {
		return this.el;
	},
	
	destroy: function() {
	
		this.el.removeData();
	
	}

});

/* UINavigationBar */
Orange.UI.IOS.UINavigationBar = Class.extend(Orange.UI.IOS.UIElement, {

	getSource: function() {
		return $('<div class="' + this.name + '"><h1>' + this.title + '</h1></div>');	
	},

	getClassName: function() {
		return "ios-ui-navigation-bar";
	},
	
	getTitle: function() {
		return this.title
	},
	
	setTitle: function(title) {
		this.title = title;
		if(this.el) this.el.find("h1").text(title);
	},
	
	setLeftBarButtonItem: function(button) {
		button.el.addClass("left");
		this.el.append(button.render());
	},
	
	setRightBarButtonItem: function(button) {
		button.el.addClass("right");
		this.el.append(button.render());
	}

});

/* UIToolbar */
Orange.UI.IOS.UIToolbar = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-toolbar";
	}

});

/* UIBarButtonItem */
Orange.UI.IOS.UIBarButtonItem = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-bar-button-item";
	},
	
	getLabel: function() {
		return this.label;
	},
	
	setLabel: function(label) {
		this.label = label;
		this.el.text(label)
	},
	
	bindEvents: function() {
	
		$(this.el).bind("touchstart", function(e) {
			$(this).addClass("ios-bar-button-gradient-touch");	
		});
		
		$(this.el).bind("touchcancel", function(e) {
			$(".ios-ui-bar-button-item").removeClass("ios-bar-button-gradient-touch");
		});
		
		$(this.el).bind("touchend", function(e) {
			$(".ios-ui-bar-button-item").removeClass("ios-bar-button-gradient-touch");
		});
	}
	
});

/* UITableView */
Orange.UI.IOS.UITableView = Class.extend(Orange.UI.IOS.UIElement, {

	getSource: function() {
		var element = $('<div class="' + this.name + '"><div class="ios-scroller"></div></div>');	
		var scroller = element.find('.ios-scroller');
				
		var pullDown = $('<div class="ios-pull-down-to-refresh"></div>');
		pullDown.append($('<span class="pullDownIcon"></span>'));
		pullDown.append($('<span class="pullDownLabel">Pull down to refresh...</span>'));
		pullDown.append($('<span class="pullDownUpdated">Last Updated: 12/20/2011 1:47PM</span>'));
		
		if(this.canPullDownToRefresh()) scroller.append(pullDown);
		scroller.append($('<ul></ul>'));
		
		return element;
	},
	
	bindEvents: function() {
	
		this.setupScroll();
	
	},
	
	setupScroll: function() {
	
		this.pullDownEl = $(this.el).find('.ios-pull-down-to-refresh').get(0);
		this.pullDownOffset = 55;	
		this.generatedCount = 0;
	
		this.scroller = new iScroll(this.el.get(0), { 
		
			scrollbarClass: 'myScrollbar',
			useTransition: true,
			topOffset: this.pullDownOffset,
			
			onRefresh: this.onRefresh,
			onScrollMove: this.onScrollMove,
			onScrollEnd: this.onScrollEnd,
			onBeforeScrollStart: this.onBeforeScrollStart,
			onBeforeScrollEnd: this.onBeforeScrollEnd
			
		});
				
	},
	
	onRefresh: function() {
		var table = $(this.wrapper).data('control');
		if (table.pullDownEl.className.match('loading')) {
			table.pullDownEl.className = 'ios-pull-down-to-refresh';
			table.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
		}
	},
	
	onScrollMove: function() {
		var table = $(this.wrapper).data('control');
		
		if (this.hoverTarget) {
			clearTimeout(this.hoverTimeout);
			this.hoverTarget.className = this.hoverTarget.className.replace(new RegExp('(^|\\s)selected(\\s|$)'), '');
			this.target = null;
		}
				
		if (this.y > 5 && !table.pullDownEl.className.match('flip')) {
			table.pullDownEl.className = 'ios-pull-down-to-refresh flip';
			table.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
			this.minScrollY = 0;
		} else if (this.y < 5 && table.pullDownEl.className.match('flip')) {
			table.pullDownEl.className = 'ios-pull-down-to-refresh ';
			table.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
			this.minScrollY = -table.pullDownOffset;
		}
	},
	
	onScrollEnd: function() {
		var table = $(this.wrapper).data('control');
		if (table.pullDownEl.className.match('flip')) {
			table.pullDownEl.className = 'ios-pull-down-to-refresh loading';
			table.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';			
			table.pullDownAction();	// Execute custom function (ajax call?)
		}
	},
	
	onBeforeScrollStart: function(e) {
		var target = e.target;
		clearTimeout(this.hoverTimeout);

		while (target.nodeType != 1) target = target.parentNode;

		this.hoverTimeout = setTimeout(function () {
			if (!hoverClassRegEx.test(target.className)) target.className = target.className ? target.className + ' selected' : 'selected';
		}, 80);

		this.hoverTarget = target;
		
		e.preventDefault();
	},
	
	onBeforeScrollEnd: function() {
		if (this.hoverTarget) {
			clearTimeout(this.hoverTimeout);
			this.hoverTarget.className = this.hoverTarget.className.replace(new RegExp('(^|\\s)selected(\\s|$)'), '');
			this.target = null;
		}
	},
	
	pullDownAction: function() {
		
		var that = this;
		
		setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
			
			console.log(that);
			
			var table = that.el.find('ul');
			var cell;
			
			for (var i=0; i<3; i++) {
				cell = $('<li class="ios-ui-table-view-cell"></li>');
				cell.html('<span>Generated row ' + (++that.generatedCount) + '</span>');
				table.prepend(cell);
			}
			
			that.scroller.refresh();
		}, 1000);
	
	},
	
	getClassName: function() {
		return "ios-ui-table-view";
	},
	
	canPullDownToRefresh: function() {
		return true;
	},
	
	appendCell: function(cell) {
		cell.el.html('<span>Hello</span>');
		if(cell) this.el.find('ul').append(cell.render());
	}

});

/* UITableCell */
Orange.UI.IOS.UITableViewCell = Class.extend(Orange.UI.IOS.UIElement, {

	getSource: function() {
		return $('<li class="' + this.name + '"></li>');	
	},
	
	getClassName: function() {
		return "ios-ui-table-view-cell";
	}

});

/* UINavigationController */
Orange.UI.IOS.UINavigationController = Class.extend(Orange.UI.IOS.UIElement, {

	getSource: function() {
		return $('<li class="' + this.name + '"></li>');	
	},
	
	getClassName: function() {
		return "ios-ui-navigation-controller";
	},
	
	pushViewController: function(view) {
	
	},
	
	popViewController: function() {
	
	}

});