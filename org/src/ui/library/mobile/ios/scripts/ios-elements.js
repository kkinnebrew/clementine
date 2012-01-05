/**
 * ios.js | OrangeUI Framework 0.1 | 12.21.2011 
 */


if (typeof Orange === 'undefined') {
    var Orange = {};
}

if (typeof Orange.UI === 'undefined') {
    Orange.UI = {};
}

if (typeof Orange.UI.IOS === 'undefined') {
    Orange.UI.IOS = {};
}

Orange.UI.IOS.UIView = Class.create({

	initialize: function() {
	
		this.setup();
	
	},
	
	setup: function() {
	
		this.el = document.createElement("div");
		this.el.className = this.getClassName();
	
	},
	
	render: function() {
	
		return this.el;
	
	},
	
	getClassName: function() {
		return "ios-ui-view";
	}

});

Orange.UI.IOS.UINavigationBar = Class.extend(Orange.UI.IOS.UIView, {
	
	setup: function() {
		
		this.el = document.createElement("div");
		this.el.className = this.getClassName();
		
		this.titleEl = document.createElement("h1");
		this.titleEl.innerText = "";
		
		this.el.appendChild(this.titleEl);
		
	},
	
	getClassName: function() {
		return "ios-ui-navigation-bar";
	},
	
	setTitle: function(title) {
		this.titleEl.innerText = title;
	}

});

Orange.UI.IOS.UIBarButtonItem = Class.extend(Orange.UI.IOS.UIView, {
	
	getClassName: function() {
		return "ios-ui-bar-button-item";
	}

});

Orange.UI.IOS.UIToolbar = Class.extend(Orange.UI.IOS.UIView, {

	getClassName: function() {
		return "ios-ui-toolbar";
	},
	
	setCenterView: function() {
	
	}

});

Orange.UI.IOS.UITableView = Class.extend(Orange.UI.IOS.UIView, {

	getClassName: function() {
		return "ios-ui-table-view";
	},
	
	bindDataSource: function() {
	
	},
	
	setup: function() {
	
		this.el = document.createElement("div");
		this.el.className = this.getClassName();
	
	},
	
	render: function() {
	
		
		var cell = document.createElement("div");
		cell.className = 'ios-ui-table-view-cell';
		
		this.el.appendChild(cell);
		
		var cell = document.createElement("div");
		cell.className = 'ios-ui-table-view-cell';
		
		this.el.appendChild(cell);
		
		var cell = document.createElement("div");
		cell.className = 'ios-ui-table-view-cell';
		
		this.el.appendChild(cell);
		
		var cell = document.createElement("div");
		cell.className = 'ios-ui-table-view-cell';
		
		this.el.appendChild(cell);
		
		return this.el;
	
	},

});

Orange.UI.IOS.UITableCell = Class.extend(Orange.UI.IOS.UIView, {

	getClassName: function() {
		return "ios-ui-table-view";
	}

});

Orange.UI.IOS.UISegmentedControl = Class.extend(Orange.UI.IOS.UIView, {

	getClassName: function() {
		return "ios-ui-segmented-control";
	},
	
	add: function(values) {
	
	}

});

Orange.UI.IOS.UIButton = Class.extend(Orange.UI.IOS.UIView, {

	getClassName: function() {
		return "ios-ui-button";
	}

});

Orange.UI.IOS.UISearchBar = Class.extend(Orange.UI.IOS.UIView, {

	getClassName: function() {
		return "ios-ui-search-bar";
	}

});

