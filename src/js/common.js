/**
 * common.js | OrangeUI Framework 0.1 | 12.21.2011 
 */
 
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

var UI = {};