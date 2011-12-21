/**
 * ui-table-view.js | OrangeUI Framework 0.1 | 12.21.2011 
 */
 
if(UI == undefined) var UI = {};

if(UI.iOS == undefined) UI.iOS = {};

UI.iOS.UITableView = Class.create({

	initialize: function(selector) {
				
		// lookup selector
		if(typeof selector != 'object') return;
		this.target = selector;
			
		// calculate dimensions
		this.pullDownEl = $(selector).find('.ios-pull-down-to-refresh').get(0);
		this.pullDownOffset = this.pullDownEl.offsetHeight;	

		this.generatedCount = 0;
		
		// setup iScroll
		this.myScroll = new iScroll(this.target, {
				
			useTransition: true,
			topOffset: this.pullDownOffset,
			pullDownEl: this.pullDownEl,
			
			onBeforeScrollStart: this.onBeforeScrollStart,
			onRefresh: this.onRefresh,
			onScrollMove: this.onScrollMove,
			onScrollEnd: this.onScrollEnd,
			onBeforeScrollEnd: this.onRowUnselected
			
		});
		
		var that = this.target;
		
		setTimeout(function () { that.style.left = '0'; }, 800);
		
	},
	
	onBeforeScrollStart: function(e) {
		
		var target = e.target;
		clearTimeout(this.hoverTimeout);
	
		while (target.nodeType != 1) target = target.parentNode;
				
		var hoverRegex = new RegExp('(^|\\s)selected(\\s|$)');
				
		this.hoverTimeout = setTimeout(function () {
			if (!hoverRegex.test(target.className)) target.className = target.className ? target.className + ' selected' : 'selected';
		}, 80);
	
		this.hoverTarget = target;
		
		e.preventDefault();
	},
	
	onRefresh: function() {
				
		if (this.pullDownEl.className.match('loading')) {
			this.pullDownEl.className = 'ios-pull-down-to-refresh';
			this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
		}
	
	},

	onScrollMove: function() {
	
		if (this.hoverTarget) {
			clearTimeout(this.hoverTimeout);
			this.hoverTarget.className = this.hoverTarget.className.replace(new RegExp('(^|\\s)selected(\\s|$)'), '');
			this.target = null;
		}
				
		if (this.y > 5 && !this.pullDownEl.className.match('flip')) {
			this.pullDownEl.className = 'ios-pull-down-to-refresh flip';
			this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
			this.minScrollY = 0;
		} else if (this.y < 5 && this.pullDownEl.className.match('flip')) {
			this.pullDownEl.className = 'ios-pull-down-to-refresh ';
			this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
			this.minScrollY = -pullDownOffset;
		}
	
	},

	onScrollEnd: function() {
			
		if (this.pullDownEl.className.match('flip')) {
			this.pullDownEl.className = 'ios-pull-down-to-refresh loading';
			this.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';				
			
			var el, li, i;
									
			el = $(this.wrapper).find('ul').get(0);
				
			for (i=0; i<3; i++) {
				li = document.createElement('li');
				li.className = 'ios-ui-table-view-cell';
				li.innerHTML = '<span>Generated row ' + 1 + '</span>';
				el.insertBefore(li, el.childNodes[0]);
			}
			
			this.refresh();		// Remember to refresh when contents are loaded (ie: on ajax completion)
			
		} 
		
	},
	
	onRowUnselected: function() {
		
		if (this.hoverTarget) {
			clearTimeout(this.hoverTimeout);
			this.hoverTarget.className = this.hoverTarget.className.replace(new RegExp('(^|\\s)selected(\\s|$)'), '');
			this.target = null;
		}
		
	}

});