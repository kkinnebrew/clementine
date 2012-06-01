var ViewController = View.extend({

	initialize: function(parent, target) {
	
		// set view statuses
		this.loading = false;
		this.unloading = false;
		this.loaded = false;
		
		this.visible = false;
		this.appearing = false;
		this.disappearing = false;
		
		// create arrays
		this.loadEvts = [];
		this.unloadEvts = [];
	
	},
	
	load: function() {
	
		// return if already loading
		if (this.loading || this.loaded) return;
		
		// set statuses
		this.loading = true;
		
		// bind event handlers
		this.loadEvts.push(this.on('_load', this.onLoad, this));
		this.loadEvts.push(this.on('_loaded', this.onDidLoad, this));
		
		// call onWillLoad
		this.onWillLoad();
	
	},
	
	onWillLoad: function() {
		
		// run functions
		console.log("Will Load");
		
		// fire load event
		this.fire('_load');
		
	},
	
	onLoad: function() {
	
		// run functions
		console.log("Load");
	
		// fire loaded event
		this.fire('_loaded');
	
	},
	
	onDidLoad: function() {
	
		// run functions
		console.log("Did Load");
	
		// unbind all event handlers
		for (var i = 0, len = this.loadEvts.length; i < len; i++) {
			this.loadEvts[i].detach();
		}
		
		// allow unloading
		this.loading = false;
		this.loaded = true;
		
		// fire public loaded event
		this.fire('loaded');
	
	},
	
	unload: function() {
	
		// return if already unloading
		if (this.unloading || !this.loaded) return;
		
		// bind event handlers
		this.unloadEvts.push(this.on('_unload', this.onUnload, this));
		this.unloadEvts.push(this.on('_unloaded', this.onDidUnload, this));
		
		// set statuses
		this.unloading = true;
		
		// call onWillUnload
		this.onWillUnload();
	
	},
	
	onWillUnload: function() {
		
		// run functions
		console.log("Will Unload");
		
		// fire unload event
		this.fire('_unload');
		
	},
	
	onUnload: function() {
	
		// run functions
		console.log("Unload");
	
		// fire unloaded event
		this.fire('_unloaded');
	
	},
	
	onDidUnload: function() {
	
		// run functions
		console.log("Did Unload");
		
		// unbind all event handlers
		for (var i = 0, len = this.unloadEvts.length; i < len; i++) {
			this.unloadEvts[i].detach();
		}
		
		// allow loading
		this.unloading = false;
		this.loaded = false;
		
		// fire public unloaded event
		this.fire('unloaded');
	
	},
	
	show: function() {
	
		// return if already visible or appearing
		if (this.visible || this.appearing) return;
		
		// set statuses
		this.appearing = true;
		
		// bind event handlers
		this.showEvts.push(this.on('_appear', this.onAppear, this));
		this.showEvts.push(this.on('_appeared', this.onDidAppear, this));
		
		// call onWillAppear
		this.onWillAppear();
	
	},
	
	onWillAppear: function() {
		
		// run functions
		console.log("Will Appear");
		
		// fire appear event
		this.fire('_appear');
		
	},
	
	onAppear: function() {
	
		// run functions
		console.log("Appear");
	
		// fire appeared event
		this.fire('_appeared');
	
	},
	
	onDidAppear: function() {
	
		// run functions
		console.log("Did Appear");
	
		// unbind all event handlers
		for (var i = 0, len = this.showEvts.length; i < len; i++) {
			this.showEvts[i].detach();
		}
		
		// allow hiding
		this.appearing = false;
		this.visible = true;
		
		// fire public appeared event
		this.fire('appeared');
	
	},
		
	hide: function() {
	
		// return if already hidden or hiding
		if (this.visible || this.disappearing) return;
		
		// set statuses
		this.disappearing = true;
		
		// bind event handlers
		this.hideEvts.push(this.on('_disappear', this.onDisappear, this));
		this.hideEvts.push(this.on('_disappeared', this.onDidDisappear, this));
		
		// call onWillDisappear
		this.onWillDisappear();
	
	},
	
	onWillDiappear: function() {
		
		// run functions
		console.log("Will Disappear");
		
		// fire disappear event
		this.fire('_disappear');
		
	},
	
	onDisappear: function() {
	
		// run functions
		console.log("Disappear");
	
		// fire disappeared event
		this.fire('_disappeared');
	
	},
	
	onDidDisappear: function() {
	
		// run functions
		console.log("Did Disappear");
	
		// unbind all event handlers
		for (var i = 0, len = this.hideEvts.length; i < len; i++) {
			this.hideEvts[i].detach();
		}
		
		// allow showing
		this.disappearing = false;
		this.visible = false;
		
		// fire public disappeared event
		this.fire('disappeared');
	
	}

});

var MyViewController = ViewController.extend({

	onWillLoad: function() {
	
		// run functions
		
		// call super
		this._super();
	
	},
	
	onDidLoad: function() {
	
		// run functions
		
		// call super
		this._super();
	
	},
	
	onWillUnload: function() {
	
		// run functions
		
		// call super
		this._super();
	
	},
	
	onDidUnload: function() {
	
		// run functions
		
		// call super
		this._super();
	
	}

});

var MySecondViewController = ViewController.extend({

	onWillLoad: function() {
	
		// run functions
		
		// call super
		this._super();
	
	},
	
	onDidLoad: function() {
	
		// run functions
		
		// call super
		this._super();
	
	},
	
	onWillUnload: function() {
	
		// run functions
		
		// call super
		this._super();
	
	},
	
	onDidUnload: function() {
	
		// run functions
		
		// call super
		this._super();
	
	}

});