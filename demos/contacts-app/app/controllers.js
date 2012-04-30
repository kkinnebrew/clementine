Orange.add('contacts-controllers', function(O) {

	O.namespace('Contacts');
	
	/* manages the main application */
	O.Contacts.ContactsApplicationView = O.View.extend(O.iOS.UINavigationView, {
		
		type: 'contacts-app-view',
		triggers: [],
		
		onLoad: function() {
		
			// instantiate modal view
			this.modal = new O.Contacts.ContactModalView(this, O.Template.fetch('create-contact.html'));
		
			// bind create event
			this.getView('contacts-list').on('create', $.proxy(this.onCreate, this));
			this.getView('contacts-list').on('select', $.proxy(this.onSelect, this));
			
			this.getView('contact').on('back', $.proxy(this.onBack, this));
		
		},
		
		onCreate: function(e) {
		
			// prevent bubbling
			e.stopPropagation();
			
			// launch modal view
			this.modal.presentModalView();
		
		},
		
		onSelect: function(e) {
		
			// prevent bubbling
			e.stopPropagation();
			
			// push the view
			this.pushView(this.getView('contact'));
		
		},
		
		onBack: function(e) {
		
			// prevent bubbling
			e.stopPropagation();
			
			// push the view
			this.popToRootView();
		
		},
		
		onUnload: function() {
		
		}
	
	});
	
	
	/* manages the list of contacts */
	O.Contacts.ContactsListView = O.View.extend(O.iOS.UIView, {
		
		type: 'contacts-list-view',
		triggers: ['create', 'select'],
		
		onLoad: function() {
		
			// setup models
			this.getView('contact-list').bindData(O.Model.Contacts.get());
		
			// bind dom events
			this.getElement('add-btn').target.on('click', $.proxy(this.onAdd, this));
			
			// bind table select event
			this.getView('contact-list').on('select', $.proxy(this.onSelect, this));
		
		},
		
		onAdd: function(e) {
			this.fire('create');
		},
		
		onSelect: function(e) {
			
			// get data model
			var data = e.data;
			
			// set data to view
			this.getView('contact').setData(data);
			
		},
		
		onUnload: function() {
		
		}
	
	});
	
	
	/* manages the list of contacts */
	O.Contacts.ContactView = O.View.extend(O.iOS.UIView, {
		
		type: 'contacts-view',
		triggers: ['back'],
		
		onLoad: function() {
		
			// bind dom events
			this.getElement('back-btn').target.on('click', $.proxy(this.onBack, this));
		
		},
		
		onBack: function() {
			this.fire('back');
		},
		
		setData: function(data) {
		
			// get form
			var form = this.getForm('create-contact');
		
			// sets the values of the view
			form.get('contact_id').val(data.contactId);
			form.get('first_name').val(data.firstName);
			form.get('last_name').val(data.lastName);
			form.get('email').val(data.email);
			form.get('phone').val(data.phone);
			form.get('birthday').val(data.birthday);
		
		},
		
		onUnload: function() {
		
		}
	
	});
	
	
	/* manages the modal view for creating contacts */
	O.Contacts.ContactModalView = O.View.extend(O.iOS.UIModalView, {
		
		type: 'contacts-modal-view',
		triggers: [],
		
		onLoad: function() {
		
			// bind events
			this.getView('create-contact').on('create', $.proxy(this.onCreate, this));
		
		},
		
		onCreate: function(e) {
		
			// prevent bubbling
			e.stopPropagation();
		
			// close the view
			this.dismissModalView();
			
		},
		
		onClose: function(e) {
		
			// prevent bubbling
			e.stopPropagation();
		
			// close the view
			this.dismissModalView();
		
		}
		
		onUnload: function() {
		
		}
	
	});
	
	
	/* creating contact form */
	O.Contacts.CreateContactView = O.View.extend(O.iOS.UIView, {
		
		type: 'contacts-create-view',
		triggers: ['create', 'close'],
		
		onLoad: function() {
		
			// bind event handler to form submit
			this.getForm('create-contact').get('submit').on('click', $.proxy(this.onSubmit, this));
		
		},
		
		onSubmit: function(e) {
		
			// get form data
			var form = this.getForm('create-contact');
		
			// sets the values of the view
			var data = {
				'contactId': form.get('contact_id'),
				'firstName': form.get('first_name'),
				'lastName': form.get('last_name'),
				'email': form.get('email'),
				'phone': form.get('phone'),
				'birthday': form.get('birthday'),
				'website': form.get('website')
			};
		
			// validate model
			if (O.Model.get('Contact').validate(data)) {
			
				// save model
				O.Model.get('Contact').save(data, $.proxy(this.onSuccess, this), $.proxy(this.onFailure, this));
			
			} else {
			
				// show validation error	
			
			}
		
		},
		
		onSuccess: function(e) {
			this.fire('create');
		},
		
		onFailure: function(e) {
		
			// show save error
		
		},
		
		onUnload: function() {
		
		}
	
	});

}, ['ios', 'ui', 'db'], '0.1');