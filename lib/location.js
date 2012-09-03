// ------------------------------------------------------------------------------------------------
// Location Object
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Location = {};
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Browser     = Orange.Browser;
  
  
  // ------------------------------------------------------------------------------------------------
  // Functions
  // ------------------------------------------------------------------------------------------------
  
  var location = null;
  var timestamp = null;
  var ttl = 60 * 60 * 1000;
  
  function isExpired() {
    return ((new Date()).getTime() - timestamp) > ttl;
  }
  
  function onCurrentPosition(success, position) {
    timestamp = (new Date().getTime());
    location = position.coords;
    
    // call success function
    if (typeof success === 'function') { success(position.coords); }
    
  }
  
  function onError(ex) {
    switch (ex.code) {
      case ex.TIMEOUT:
        Log.warn('Location services timeout'); break;
      case ex.POSITION_UNAVAILABLE:
        Log.warn('Position unavailable'); break;
      case ex.PERMISSION_DENIED:
        Log.warn('Please Enable Location Services'); break;
      default:
        Log.info('Unknown location services error'); break;
    }
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Location Methods
  // ------------------------------------------------------------------------------------------------
  
  Location.get = function(success, failure) {
  
    if (!Browser.location) {
      failure.call(this);
      return;
    }
    
    if (typeof success !== 'function') {
      return;
    }
    
    if (location && !isExpired()) {
      return success(location);
    }
    
    var errorFn = function(ex) {
      onError(ex);
      if (failure) { failure.call(this); }
    }, successFn = function(position) {
      onCurrentPosition(success, position);
    };
    
    navigator.geolocation.getCurrentPosition(successFn, errorFn);
  
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Location = Location;
  

}(Orange));