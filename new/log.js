/**
 * log.js | OrangeUI Framework 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none
 */

OrangeUI.add('log', function(O) {

	O.Log = (function () {
	
		var Log = {};
	
	
		/* constant definitions */
		
		var LOG_DEBUG 	= 1;
		var	LOG_INFO 	= 2;
		var	LOG_WARN 	= 3;
		var	LOG_ERROR 	= 4;
		var	LOG_OFF 	= 5;
		
		
		/* private variables */
		
		var _logLevel 	= LOG_DEBUG;
		var _log 		= new Array();
		
		
		/* private methods */
		
		var _logMessage = function (message, level, ex) {
			
			// build log entry
			var entry = {
				message: message,
				ex: ex != undefined ? ex : null,
				level: level,
				timestamp: (new Date()).getTime()
			};
					
			// write message
			if(level >= _logLevel) {
					
				switch(level) {
					case LOG_DEBUG:
						console.log("[DEBUG] " + message.toString());
						break;
					case LOG_INFO:
						console.log("[INFO] " + message.toString());
						break;
					case LOG_WARN:
						console.log("[WARN] " + message.toString());
						break;
					case LOG_ERROR:
						console.log("[ERROR] " + message.toString());
						break;
				}
			}
			
			// push on log list
			_log.push(entry);
		
		};	
	
	
		/* set public methods */
	
		Log.setLevel = function (level) {
			_logLevel = level; // sets the logging level
		},
		
		Log.debug = function (message, ex) {
			_logMessage(message, LOG_DEBUG, ex); // log message to console
		},
		
		Log.info = function (message, ex) {
			_logMessage(message, LOG_INFO, ex); // log message to console
		},
		
		Log.warn = function (message, ex) {
			_logMessage(message, LOG_WARN, ex); // log message to console
		},
		
		Log.error = function (message, ex) {
			_logMessage(message, LOG_ERROR, ex); // log message to console
		}
		
		return Log;
	
	})();
	
});
