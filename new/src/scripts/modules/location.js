/**
 * log.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none
 */

OrangeUI.add('location', function(O) {

	O.Location = (function() {
	
		var Location = {},
		
		_coords = 12, // stores the coordinates of the location
		
		_timestamp = null, // the last time the location was fetched
		_expire = 60 * 60 * 1000; // location expiration
		
		
		var _fetchLocation = function() {
		
			if(O.App.isOnline === false) return;
		
			if (navigator.geolocation) {
			
				navigator.geolocation.getCurrentPosition ( 
			 
					function (position) {
						_coords = position.coords;
						_timestamp = (new Date().getTime());
						O.Log.info('Location services went online');
					}, 
					
					// next function is the error callback
					function (error)
					{
						switch (error.code) 
						{
							case error.TIMEOUT:
								O.Log.error('Timeout');
								break;
							case error.POSITION_UNAVAILABLE:
								O.Log.error('Position unavailable');
								break;
							case error.PERMISSION_DENIED:
								O.Log.error('Please Enable Location Services');
								break;
							case error.UNKNOWN_ERROR:
								O.Log.error('Unknown error');
								break;
						}
					}
				);
			}
		}
		
		Location.init = function () {
						
			if (navigator.geolocation) {
				_fetchLocation();
			} else {
				O.Log.warn("Location services not supported");
			}
			
		};
		
		Location.getLocation = function () {
			// fetch location if expired or null
			if (_timestamp == undefined || ((new Date()).getTime() - _timestamp) > _expire) {
				_fetchLocation();
			}
			return _coords;
		};
		
		return Location;
	
	})();

}, ['log']);