// ------------------------------------------------------------------------------------------------
// Application Class
// ------------------------------------------------------------------------------------------------

/** 
 * @module UI
 */
(function(Orange) {

  var Application;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Cache          = Orange.Cache;
  var Storage        = Orange.Storage;
  var View           = Orange.View;
  var ViewController = Orange.ViewController;

  
  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------

  Application = Class.extend({
    
    /**
     * The Application class manages the entire application lifecycle, from setup to authentication
     * to accessing services and loading the DOM.
     *
     * @class Application
     * @constructor
     * @param {object} config  The application is passed your app.json file.
     */  
    initialize: function(config) {
      
    }
  
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Application = Application;
    
  
}(Orange));