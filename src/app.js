// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Application;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Loader           = Orange.Loader;
  var Service          = Orange.Service;
  var View             = Orange.View;
  var ViewController   = Orange.ViewController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  Application = Class.extend({
      initialize: function (a) {
          if (!a.hasOwnProperty("name") || (new RegExp(/[^A-Za-z:0-9_\[\]]/g)).test(a.name)) {
              throw "Invalid application name";
          }
          this.loaded = false;
          this.registered = false;
          this.config = a;
          if (a.hasOwnProperty('views')) {
            View.register(a.views, Class.proxy(function() {
              this.registered = true;
              if (this.loaded) { this.onLoad(); }
            }, this));
          }
          window.onload = Class.proxy(function() {
            this.loaded = true;
            if (this.registered) { this.onLoad(); }
          }, this);
      },
      onLoad: function () {
          var b = $("[data-root]"),
              e = b.attr("data-control"),
              d = b.attr("data-name");
          if (typeof e === "undefined" || typeof d === "undefined") {
              throw "Root view not found";
          }
          b.removeAttr("data-root");
          var f = ViewController.get(e);
          var a = new f(null, b);
          a.on("load", function () {
              a.show();
          });
          a.load();
          this.root = a;
          $(window).bind('hashchange', Class.proxy(this.onHashChange, this));
          $(window).trigger('hashchange');
      },
      onHashChange: function() {
        var hash = location.hash;
        if (!hash) {
          this.root.setState();
        } else {
          this.root.setState(hash.replace('#', '').split('/'));
        }
      }
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application  = Application;
  

}(Clementine));