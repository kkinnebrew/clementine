Orange.add('contacts-models', function(O) {

	O.Model.define({
	
		name: 'Contact', 
		id: 'contactId',
		path: '/contacts/', 
		
		fields: {
			contactId: { type: 'int', name: 'contact_id', nullable: false },
			firstName: { type: 'string', name: 'first_name', nullable: false  },
			lastName: { type: 'string', name: 'last_name', nullable: false  },
			email: { type: 'email', name: 'email', nullable: true  },
			phone: { type: 'tel', name: 'phone', nullable: true  },
			birthday: { type: 'date', name: 'birthday', nullable: true  },
			website: { type: 'url', name: 'website', nullable: true }
		}, 

		// map source into the form of a single json object
		mapItem: function(data) {
			return data;
		},
		
		// map source into the form of an array of source objects
		mapItems: function(data) {
			return data;
		}
		
	});

});