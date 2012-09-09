// ------------------------------------------------------------------------------------------------
// Storage Object
// ------------------------------------------------------------------------------------------------

(function(Orange) {
  
  var Storage = {};
  
  var db = window.localStorage;
  var supported = false;
  var online = false;
  
  
  // ------------------------------------------------------------------------------------------------
  // Feature Detection
  // ------------------------------------------------------------------------------------------------
  
  if ('localStorage' in window) {
    try {
      window.localStorage.setItem('_test', 1);
      supported = true;
      window.localStorage.removeItem('_test');
    } catch (e) {}
  }
  
  if (supported) {
    try {
      if (window.localStorage) {
        db = window.localStorage;
      }
    } catch (e) {}
  } else if ('globalStorage' in window) {
    try {
      if (window.globalStorage) {
        db = window.globalStorage[window.location.hostname];
        supported = true;
      }
    } catch(e) {}
  }
  
  if (!JSON && !JSON.hasOwnProperty('stringify')) {
    supported = false;
  }
  
  if (!supported) {
    Log.warn('No native JSON parser found');
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Storage Methods
  // ------------------------------------------------------------------------------------------------
  
  Storage.get = function(key) {
  
    if (!supported) { return; }
    
    try {
      var item = JSON.parse(db.getItem(key));
      if (item !== undefined && item.data !== undefined) {
        if (online && item.ttl !== -1 && ((new Date()).getTime() - item.timestamp) > item.ttl) {
          db.removeItem(key);
        }
        return item.data;
      }
    } catch(e) {
      Log.error("Error fetching object from localStorage");
    }
  
  };
  
  Storage.set = function(key, value, ttl) {
  
    if (!supported || typeof value === 'undefined' || !!key.match(/[^A-Za-z:0-9_\[\]]/g)) {
      return false;
    }
        
    var obj = {
      data: value,
      timestamp: (new Date()).getTime(),
      ttl: ttl ? ttl : (24 * 60 * 60 * 1000)
    };
    
    try {
      db.setItem(key, JSON.stringify(obj));
      return true;
    } catch (e) {
      if (e === QUOTA_EXCEEDED_ERR) {
        Log.error("Storage quota has been exceeded", e);
      }
    }
    return false;
    
  };
  
  Storage.remove = function(key) {
    if (!supported) { return false; }
    db.removeItem(key);
  };
  
  Storage.flushExpired = function(force) {
    if (!supported || (online === false && force !== true)) { return; }
    for (var key in db) {
      Storage.get(key);
    }
  };
  
  Storage.flush = function(force) {
    if (!supported || (online === false && force !== true)) { return; }
    db.clear();
    Log.info("Clear: Local storage cleared");
  };
  
  Storage.isSupported = function() {
    return supported;
  };
  
  Storage.goOnline = function() {
    online = true;
  };
  
  Storage.goOffline = function() {
    online = false;
  };
    
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Orange.Storage = Storage;
  

}(Orange));