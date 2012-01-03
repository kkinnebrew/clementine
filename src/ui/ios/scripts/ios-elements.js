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

	getClassName: function() {
		return "ios-ui-table-view";
	}

});

/* UITableCell */
Orange.UI.IOS.UITableViewCell = Class.extend(Orange.UI.IOS.UIElement, {

	getClassName: function() {
		return "ios-ui-table-view-cell";
	}

});