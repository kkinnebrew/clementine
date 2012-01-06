/**
 * dom.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

if (typeof O === 'undefined') {
    var O = {};
}

O.DOM = {

	DIV: function() { return (Y.DB._gen("DIV", Array.prototype.slice.call(arguments))); }, 
    LI: function() { return (Y.DB._gen("LI", Array.prototype.slice.call(arguments))); }, 
    SPAN: function() { return (Y.DB._gen("SPAN", Array.prototype.slice.call(arguments))); }, 
    A: function() { return (Y.DB._gen("A", Array.prototype.slice.call(arguments))); }, 
    INPUT: function() { return (Y.DB._gen("INPUT", Array.prototype.slice.call(arguments))); }, 
    TEXTAREA: function() { return (Y.DB._gen("TEXTAREA", Array.prototype.slice.call(arguments))); },   
    SELECT: function() { return (Y.DB._gen("SELECT", Array.prototype.slice.call(arguments))); },   
    OPTION: function() { return (Y.DB._gen("OPTION", Array.prototype.slice.call(arguments))); },   
    IMG: function() { return (Y.DB._gen("IMG", Array.prototype.slice.call(arguments))); },   
  
    _gen: function(tag, args) {

      var n = document.createElement(tag);
      var examineIdx = 0;
    
      // locate classnames
    
      if (args.length > examineIdx && typeof(args[examineIdx]) == "string") {
        n.className = args[examineIdx];
        ++examineIdx;
      }
    
      // locate extended properties
      // there are more arguments, that look like objects, that are NOT arrays, that are NOT YUI.Node objects
    
      if (args.length > examineIdx && args[examineIdx] != null && typeof(args[examineIdx]) == "object" && !(args[examineIdx] instanceof Array) && (args[examineIdx].getAttribute == null) && (args[examineIdx]._node == null)) { 
    
        var props = args[examineIdx];
        ++examineIdx;
      
        // construct a deeper object
      
        for (k in props) {
          if (k == "html") {
            n.innerHTML = props[k];
          } else if (k == "data") {
            n.data = props[k];
          } else {
            n.setAttribute(k, props[k]);
          }
        }
      
        // defaults for certain objects
      
        if (tag == "A") {
          if (!props.href) { n.href = "javascript:noop();"; }
        }
      
      }
    
      // decompose an array if misused
    
      //if (args.length > examineIdx && (args[examineIdx] instanceof Array)) {
      //  args = args[examineIdx];
      //  examineIdx = 0;
      //}

      // append the rest as children
    
      n = $(n);

      for (var i = examineIdx; i < args.length; ++i) {
        if (args[i] instanceof Array) {
          for (var j = 0; j < args[i].length; ++j) {
            var child = args[i][j];
            n.append(child);
          }
        } else {
          var child = args[i]
          n.append(child);
        }
      }
    
      return n;
    
    }

};