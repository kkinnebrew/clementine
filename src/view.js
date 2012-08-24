// ------------------------------------------------------------------------------------------------
// View Object
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var View = {};
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Definition
  // ------------------------------------------------------------------------------------------------
  
  var templates = {};
  
  View.get = function(path, control, name) {
  
    var that = this;
    var views = [];
    var output;
    
    if (!templates.hasOwnProperty(path)) {
      throw 'Path ' + path + ' has not been loaded';
    }
    
    $('<div>' + templates[path] + '</div>').children().each(function() {
      views.push($(this));
    });
    
    for (var i=0; i<views.length; i++) {
      if (typeof control !== 'undefined' && views[i].attr('data-control') !== control) { continue; }
      if (typeof name !== 'undefined' && views[i].attr('data-name') !== name) { continue; }
      return views[i];
    }
    throw 'Could not find view ' + control + ' at ' + path;
    
  };
  
  View.fetch = function(path, success, sync) {
    return $.ajax({
      async: sync !== true,
      cache: false,
      contentType: "text/html; charset=utf-8",
      dataType: "text",
      timeout: 10000,
      url: path,
      success: function(html) {
        success(path, html);
      },
      error: function() {
        throw "Error: template not found";
      }
    }).responseText;
  };
  
  View.load = function(paths, callback) {
    
    var path;
    var count = paths.length;
    
    function onFetch(path, html) {
      templates[path] = html; count--;
      if (count === 0) { callback(); }
    }
    
    for (var i=0; i<paths.length; i++) {
      path = paths[i];
      this.fetch(paths[i], proxy(onFetch, this));
    }
  };
    
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine.View = View;
  

}(Clementine));