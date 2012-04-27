Orange.add('wm-models', function(O) {

	/* model definitions */

	Feed.get({
		'feedId': { 'cond': 'eq', 'value': 12 }
	});
	
	O.Test.MyViewController = O.View.extend(O.iOS.UINavigationController, {
	
		onLoad: function() {
		
			// get events
			var events = O.Model.Event.get({
				'userId': { 'cond': 'eq', 'value': 12 }
			});
			
			// bind to table view
			this.setData(events);
			
			// update on changes
			events.on('change', this.refresh);
			
			
		},
		
		refresh: function() {
			
			// refresh table view
			
		}
		
		
	
	});

	O.Model.define('Feed', {
		feedId: { type: 'int', name: 'SocialEventId' },
		eventName: { type: 'string', name: 'SocialEventName' },
		eventDate: { type: 'date', name: 'SocialEventDate' },
		eventDescription: { type: 'string', name: 'SocialEventDescription' },
		isAttending: { type: 'bool', name: 'SocialEventIsAttending' }
	}, '/MyFeed/');

	O.Model.define('Event', {
		eventId: { type: 'int', name: 'SocialEventId' },
		eventName: { type: 'string', name: 'SocialEventName' },
		eventDate: { type: 'date', name: 'SocialEventDate' },
		eventDescription: { type: 'string', name: 'SocialEventDescription' },
		isAttending: { type: 'bool', name: 'SocialEventIsAttending' }
	});
	
	O.Model.define('User', {
		userId: { type: 'int', name: 'SocialEventId' },
		eventName: { type: 'string', name: 'SocialEventName' },
		eventDate: { type: 'date', name: 'SocialEventDate' },
		eventDescription: { type: 'string', name: 'SocialEventDescription' },
		isAttending: { type: 'bool', name: 'SocialEventIsAttending' }
	});
	
	O.Model.define('Subscription', {
		subscriptionId: { type: 'int', name: 'SocialEventId' },
		eventName: { type: 'string', name: 'SocialEventName' },
		eventDate: { type: 'date', name: 'SocialEventDate' },
		eventDescription: { type: 'string', name: 'SocialEventDescription' },
		isAttending: { type: 'bool', name: 'SocialEventIsAttending' }
	});	

}, ['ios', 'ui', 'db'], '0.1');