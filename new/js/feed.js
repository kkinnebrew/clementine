/**
 * feed.js | WMSocial 1.0
 * @date 2.18.2011
 * @author Kevin Kinnebrew
 * @dependencies OrangeUI 0.1.0, jQuery 1.7.1
 */

OrangeUI.add('wmsocial-feed', function(O) {

	O.namespace("WMSocial");
	
	O.WMSocial.RootController = Class.create({
	
		/* constructors/destructors */
	
		initialize: function() {
		
			// bind offline/online events
			O.Handle.on('offline', this.onOffline);
			O.Handle.on('online', this.onOnline);
		
		},
		
		destroy: function() {
		
		
		},
		
		
		/* setup/teardown */
		
		setup: function() {
		
		
		},
		
		teardown: function() {
		
		
		},
		
		/* state changes */
		
		onOffline: function() {
		
			console.log("offline!");
		
		},
		
		onOnline: function() {
		
			console.log("online!");
		
		}
	
	});

});