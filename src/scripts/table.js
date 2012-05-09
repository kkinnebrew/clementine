Orange.add('ios', function(O) {

	O.namespace('iOS');
	
	O.iOS.UITableView = O.View.define({
	
		initialize: function() {
			
		},
		
		onWillLoad: function() {
			
			// get table cell template
			var tableCell = this.target.attr('data-cell-element');
			if (typeof tableCell === 'undefined') throw "UITableView '" + this.name + "' missing 'data-cell-element' attribute";
			this.tableCell = O.TemplateManager.load('app/elements/' + tableCell);
			
			// wrap the view
			this.target.wrapInner('<div class="scroll-view"><ul></ul></div>');

			// setup iscroll
			this.myScroll = new iScroll(this.target.get(0));
			this._super();
			
			// bind select event
			this.target.on('click', $.proxy(this.onSelect, this));
			this.target.removeAttr('data-cell-element');
			
			this.target.on('touchstart', $.proxy(function(e) {
			
				this.timeout = setTimeout($.proxy(function() {
				
					var target = $(e.target);
				
					// check if target is a table cell
					if (target.hasClass('ios-ui-table-cell')) {
						cell = target;
					} else if (target.parent().hasClass('ios-ui-table-cell')) {	
						cell = target.parent();
					}
					
					if(cell != null) {
						cell.addClass('touched');
					}
				
				}, this), 50);
				
			}, this));
			
			this.target.on('touchmove', $.proxy(function(e) {
				clearTimeout(this.timeout);
				this.target.find('.ios-ui-table-cell').removeClass('touched');
			}, this));
			
			this.target.on('touchend', $.proxy(function(e) {
				clearTimeout(this.timeout);
				this.target.find('.ios-ui-table-cell').removeClass('touched');
			}, this));
			
		},
		
		onDidLoad: function() {
			
		},
		
		onWillUnload: function() {
			
		},
		
		onDidUnload: function() {
			
		},
		
		destroy: function() {
			
		}
	
	});

}, ['ui', 'db'], '0.1');