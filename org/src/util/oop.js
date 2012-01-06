/**
 * oop.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

if (typeof(console) == "undefined") {
  console = { log: function() { }, dir: function() { } };
}

function noop() { }
 
var Class = {

  create: function(protoDef) {

    var c;
 
    if (protoDef.initialize) {
      c = function() {
        this.initialize.apply(this, arguments);
      };
    } else {
      c = function() { };
    }

    c.prototype = protoDef;

    c.extend = function(protoDef) { 
      return Class.extend(this, protoDef);
    };
    
    c.prototype.loadProperties = function(defaults, user) {

      this.properties = defaults;
      for (key in user) {
        this.properties[key] = user[key];
      }

    };

    return c;

  },

  extend: function(base, protoDef) {
    
    if (!protoDef.initialize) {
      protoDef.initialize = base.prototype.initialize;
    }

    var c = Class.create(protoDef);
    
    for (property in base.prototype) {
      if (!c.prototype[property]) {
        c.prototype[property] = base.prototype[property];
      }
    }
    
    c.superclass = base.prototype;

    return c;

  }

};

var Dictionary = Class.create({

	initialize: function() {
	
		this.storage = {};
	
	},

	set: function(name, value) {
	
		this.storage[name] = value;
	
	},
	
	get: function(name) {
	
		if(this.storage[name] != undefined) return this.storage[name];
		else return null;
	
	},
	
	unset: function(name) {
	
		if(this.storage[name] != undefined) this.storage[name] = undefined;
	
	},
	
	process: function(callback) {
	
		for(var i=0; i<this.storage.length; i++) {
			callback(this.storage[i]);
		}
	
	},
	
	destroy: function() {
		
		delete this.storage;
		
	}

});

