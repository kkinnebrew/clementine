O.Model = O.define({

});

O.DataSource = O.define({

});

// usage

O.DataSource.register({

	name: 'mysource',
	basePath: '/orangeui',
	
	paths: {
		contacts: { 
			path: '/contacts', 
			offline: true, 
			allows: ['GET', 'POST', 'PUT', 'DELETE']
		},
		accounts: { 
			path: '/accounts', 
			offline: true, 
			allows: ['GET', 'POST', 'PUT']
		},
		login: { 
			path: '/login', 
			offline: false, 
			allows: ['GET']
		},
		logout: { 
			path: '/logout', 
			offline: true, 
			allows: ['GET']
		}
	},
	
	mapItem: function(data) {
		return data[this.path.name];
	},
	
	mapItems: function(data) {
		return data[this.path.list];
	}

});

O.DataSource.register({

	name: 'mylocalsource',
	basePath: 'localStorage',
	
	paths: {
		comments: { 
			path: 'comments', 
			offline: true, 
			allows: ['GET', 'POST', 'PUT', 'DELETE']
		},
		deviceSettings: { 
			path: 'deviceSettings', 
			offline: true, 
			allows: ['GET', 'POST', 'PUT', 'DELETE']
		}
	}

});


O.Model.register({

	name: 'Contact', 
	id: 'id',
	source: 'mysource',
	path: 'contacts', 
	
	fields: {
		contactId: { type: 'int', name: 'id', nullable: false },
		firstName: { type: 'string', name: 'first_name', nullable: false  },
		lastName: { type: 'string', name: 'last_name', nullable: false  },
		email: { type: 'email', name: 'email', nullable: true  },
		phone: { type: 'tel', name: 'phone', nullable: true  },
		birthday: { type: 'date', name: 'birthday', nullable: true  },
		website: { type: 'url', name: 'website', nullable: true }
	}, 

	mapItem: function(data) {
		return data['Contact'];
	},
	
	mapItems: function(data) {
		return data['contacts'];
	}
	
});