// ------------------------------------------------------------------------------------------------
// View Object
// ------------------------------------------------------------------------------------------------

/**
 * @module UI
 */
(function(Orange) {
  
  /**
   * The static view loader class that asynchronously loads view
   * fragments and caches them on the client for use.
   *
   * @class View
   * @static
   */
  var View = {};
  
  
  // ------------------------------------------------------------------------------------------------
  // Object Definition
  // ------------------------------------------------------------------------------------------------
  
  /**
   * Returns the source for a cached view by a given name. Multiple views can be stored
   * in the same template file. To distingush between them, set the optional parameters control
   * and name that correspond to the **[data-control]** and **[data-name]** attributes on the view.
   * Omitting both will return the first view it finds. Omitting [data-control] will return the
   * first view matching **[data-control]** if more than one exists. Views should have unique
   * **[data-name]** attributes.
   *
   * @method find
   * @static
   * @param path {string}  The path to look up within.
   * @param [control] {string}  The optional ViewController type to lookup.
   * @param [name] {string}  The optional ViewController name to lookup.
   */
  View.find = function(path, control, name) {
  
  };
  
  /**
   * Registers a list of view paths, retrieves the source of each view asynchronously,
   * and caches the view markup for later use. This should be run before your application
   * has launched if you are using any view fragements *(ie. [data-template] attributes)*.
   * By default, the paths registered are relative to the `templates/` directory.
   *
   * @method register
   * @static
   * @param paths {Array} An array of view paths.
   * @return {Promise}  A promise that resolves when the views have been loaded.
   */
  View.register = function(paths) {
  
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.View = View;
  

}(Orange));

