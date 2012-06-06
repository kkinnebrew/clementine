Orange.add('test', function(O) {

	O.namespace('Test');
	
	O.Test.TestNavigationView = O.View.extend(O.iOS.UINavigationView, {
	
		type: 'test-navigation-view',
	
		initialize: function(parent, target) {
			this._super(parent, target);			
		},
	
		onLoad: function() {
			this._super();
			this.target.on('touchend', $.proxy(this.onClick, this));
			this.target.on('click', $.proxy(this.onClick, this));
			this.target.on('touchstart', $.proxy(this.onTouchStart, this));
			this.target.on('touchend', $.proxy(this.onTouchEnd, this));
			
			this.getView('fourth').on('click', $.proxy(function() {
				this.popView();
			}, this));
			
			console.log(O.Browser.browser + ' ' + O.Browser.os + ' ' + O.Browser.version);
		},
		
		onClick: function(e) {
			if ($(e.target).hasClass('right') && $(e.target).hasClass('one')) {
				this.pushView('second');
			} if ($(e.target).hasClass('right') && $(e.target).hasClass('two')) {
				this.pushView('third');
			} if ($(e.target).hasClass('right') && $(e.target).hasClass('three')) {
				this.pushView('fourth');
			} else if ($(e.target).hasClass('left')) {
				this.popView();
			}
		},
		
		onTouchStart: function(e) {
			if ($(e.target).hasClass('ios-ui-bar-button-item')) {
				$(e.target).addClass('touched');
			}
		},
		
		onTouchEnd: function(e) {
				$(this.target).find('ios-ui-bar-button-item').removeClass('touched');
		},
		
		onUnload: function() {
			this.target.unbind();
			this._super();
		}
	
	});
	
	O.Test.TestNavigationViewFourth = O.View.extend(O.iOS.UIView, {
	
		type: 'ios-ui-view-fourth',
	
		onLoad: function() {
			this._super();
			this.find('.click').on('click', $.proxy(function() {
				this.fire('click');
			}, this));
			
			this.find('.click').on('touchend', $.proxy(function() {
				this.fire('click');
			}, this));
			
		},
	
	});
	
}, ['ui', 'ios']);