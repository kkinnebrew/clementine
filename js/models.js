Orange.add('wm-models', function(O) {

	/* model definitions */

	Feed.get({
		'feedId': { 'cond': 'eq', 'value': 12 }
	});

	O.Model.define('Feed', {
		feedId: { type: 'int', name: 'SocialEventId' },
		eventName: { type: 'string', name: 'SocialEventName' },
		eventDate: { type: 'date', name: 'SocialEventDate' },
		eventDescription: { type: 'string', name: 'SocialEventDescription' },
		isAttending: { type: 'bool', name: 'SocialEventIsAttending' }
	}, '/MyFeed/', ['feedId', 'eventDate', 'isAttending']);

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