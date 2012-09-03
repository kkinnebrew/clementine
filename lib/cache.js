// ------------------------------------------------------------------------------------------------
// Cache Object
// ------------------------------------------------------------------------------------------------

(function(Orange) {

  var Cache = {};
  
  var active = null;
  var poll = false;
  var online = false;
  var loaded = false;
  var inited = false;
  
  
  function stop() {
    if (active !== null) {
       clearTimeout(active);
       active = null;
    }
  }
  
  function statusCallback(callback) {
    
    var id = Math.floor(Math.random() * 10000);
    
    if (navigator.onLine && !loaded) {
    
      online = true;
      loaded = true;
      Cache.fire('online', true);
      
      if (callback) {
        callback(true);
      }
      if (poll) {
        setTimeout(statusCallback, 10 * 1000);
      }
      return;
    }
    
    stop();
    
    active = setTimeout(function() {
    
      if (navigator.onLine && !loaded) {
      
        online = true;
        loaded = true;
        Cache.fire('online', true);
        
      } else if (navigator.onLine) {
      
        $.ajax({
          url: 'ping.js?q='+id,
          type: "GET",
          success: function() {
            if (online === false) {
              online = true;
              Cache.fire('online', true);
            }
          },
          error: function() {
            if (online === true) {
              online = false;
              Cache.fire('online', false);
            }
          }
        });
      
      } else {
      
        setTimeout(function() {
          if (online === true) {
            online = false;
            Cache.fire('online', false);
          }
        }, 100);
      
      }
      
      active = null;
      
      if (poll) { setTimeout(statusCallback, 10 * 1000); }
      
    }, (loaded ? 100 : 0));
    
  }
  
  function onUpdateReady() {
  
    window.applicationCache.swapCache();
    Log.debug("Cache updated and ready");
    window.location.reload(true);
    
  }
  
  for (var i in Events) {
    Cache[i] = Events[i];
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Cache Methods
  // ------------------------------------------------------------------------------------------------
  
  Cache.init = function(callback, context) {
  
    if (inited) { return; }
    poll = true;
    inited = true;
    
    $(window).bind('offline', statusCallback);
    $(window).bind('online', statusCallback);
    $(window).bind('updateready', onUpdateReady);
    
    statusCallback.call(Cache, proxy(callback, context));
  
  };
  
  Cache.updateNetworkStatus = function(callback) {
    statusCallback.call(Cache);
  };
  
  Cache.isActive = function() {
    return inited;
  };
  
  Cache.isOnline = function() {
    return online;
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------

  Orange.Cache = Cache;


}(Orange));