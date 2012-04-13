/**
 * orange-oop.js | OrangeUI OOP 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-commons-0.1, jquery-1.7.2
 * @description adds base controller elements
 */

Class = {

	create: function(def) {
		
		var c;
		 
	  if (def.initialize) {
	    c = function() {
	      this.initialize.apply(this, arguments);
	    };
	  } else {
	    c = function() { };
	  }
	
	  c.prototype = def;
	
	  c.extend = function(def) { 
	    return Class.extend(this, def);
	  };
	  
	  c.prototype.loadProperties = function(defaults, user) {
	
	    this.properties = defaults;
	    for (key in user) {
	      this.properties[key] = user[key];
	    }
	
	  };
	
	  return c;
	
	},
	
	extend: function(base, def) {
	
		if (!def.initialize) {
	    def.initialize = base.prototype.initialize;
	  }
	
	  var c = Class.define(def);
	  
	  for (property in base.prototype) {
	    if (!c.prototype[property]) {
	      c.prototype[property] = base.prototype[property];
	    }
	  }
	  
	  c.super = base.prototype;
	
	  return c;
	
	}
	
}