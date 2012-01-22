if(document.addEventListener) document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

function applyUIIOSSearchBar() {

	var isFF = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
	
	if (isFF){
		$(".ui-ios-search-bar input[type=text]").wrap('<div class="ui-ff-ios-search-bar-wrapper" />');
	}
	
	var isMSIE = /*@cc_on!@*/0;
	
	if (isMSIE) {
		$(".ui-ios-search-bar input[type=text]").wrap('<div class="ui-ff-ios-search-bar-wrapper" />');
	} 
	
	$(".ui-ios-search-bar input[type=text]").on('keypress', function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) { //Enter keycode
            if (!e) var e = window.event;

            e.cancelBubble = true;
            e.returnValue = false;

            if (e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
            }
            
            $(this).blur();
        }
    });

	$(".ui-ios-search-bar input[type=text]").on("focus", function() {
		
		var bar = $(this).parent();
		var input = $(this);
		var ff = false;
		
		if(bar.hasClass("ui-ff-ios-search-bar-wrapper")) {
			input = bar;
			ff = true;
			bar = bar.parent();
		}

		bar.find('.ui-ios-search-button').css('display', 'block');
				
		input.stop().animate({
		  right: (ff ? '117px' : '80px')
		}, (ff ? 0 : 200)).parent().stop().find('.ui-ios-search-button').animate({
		  right: '7px'
		}, (ff ? 0 : 200));
		
	});
	
	$(".ui-ios-search-bar input[type=text]").on("blur", function() {
		
		var bar = $(this).parent();
		var input = $(this);
		var ff = false;
		
		if(bar.hasClass("ui-ff-ios-search-bar-wrapper")) {
			input = bar;
			ff = true;
			bar = bar.parent();
		}
		
		input.stop().animate({
		  right: (ff ? '44px' : '7px')
		}, (ff ? 0 : 200)).parent().stop().find('.ui-ios-search-button').animate({
		  right: '-64px'
		}, (ff ? 0 : 200), function() {
			bar.find('.ui-ios-search-button').css('display', 'none');
		});

	});
	
	$(".ui-ios-search-bar .ui-ios-search-button").on("click", function() {
		
		$(this).parent().find("input[type=text]").blur();

	});
	
}

function applyBodyDelegates() {
	
	var uagent = navigator.userAgent.toLowerCase();
	
	if (uagent.search("iphone") > -1 || uagent.search("ipad") > -1) {
		
		$("body").on("touchstart", function(e) {
		
			var el = $(e.target);
			
			if(el.hasClass("ui-ios-search-button")) {
				el.addClass("touched");
			} else if(el.hasClass("ui-ios-bar-button-item")) {
				el.addClass("touched");
			} else if(el.hasClass("ui-ios-segment")) {
				el.parent().find('.ui-ios-segment').removeClass('selected');
				el.addClass('selected');
			}
			
		});
		
		$("body").on("touchend", function(e) {
			
			var el = $(e.target);
			
			if(el.hasClass("ui-ios-search-button")) {
				el.removeClass("touched");
			} else if(el.hasClass("ui-ios-bar-button-item")) {
				el.removeClass("touched");
			} else if(el.hasClass("ui-ios-segment")) {
				el.parent().find('.ui-ios-segment').removeClass('selected');
				el.addClass('selected');
				el.parent().trigger("touchend");
			}
			
		});
		
	}
	else {
		
		$("body").on("click", function(e) {
			
			var el = $(e.target);
			
			if(el.hasClass("ui-ios-segment")) {
				el.parent().find('.ui-ios-segment').removeClass('selected');
				el.addClass('selected');
				el.parent().trigger("click");
			}
			
		});
		
	}
	
}

function applyUIIOSSegmentedControls() {

	applyUIIOSSegmentedControlsCall();
	
	$(window).resize(function() {
	  applyUIIOSSegmentedControlsCall();
	});
	
}

function applyUIIOSSegmentedControlsCall() {

	$(".ui-ios-segmented-control").each(function() {
	
		var width = $(this).width();
		var elements = $(this).find(".ui-ios-segment").size();
		var padding = parseInt($(this).find(".ui-ios-segment:first").css('padding-left').replace("px", "")); 
		padding += parseInt($(this).find(".ui-ios-segment:first").css('padding-right'));
		
		var equalWidths = 0;
		
		if(elements > 1) {
			equalWidths = Math.round(width/elements);
		}
		else if(elements = 1) equalWidths = width;
		else return;
		
		var adj = 0;
		
		if((equalWidths*elements) != width) {
			adj = (equalWidths*elements) - width;
		}
				
		$(this).find(".ui-ios-segment").width(equalWidths-padding);
		$(this).find(".ui-ios-segment:last").width(equalWidths - padding - adj);	
	
	});

}

function applyUIIOSScrollView() {


	$(".ui-ios-scroll-view").each(function() {
		
		$(this).wrapInner('<div class="scroller" />');
	
		var el = $(this).get(0);
	
		// look up internal references
		var pullDownEl = $(el).find(".ui-ios-pull-to-refresh:first").get(0);
		var pullDownOffset = 0;
		
		if(pullDownEl) pullDownOffset = pullDownEl.offsetHeight;
				
		// create common functions
		
		var removeClass = function(className, remove) {
		
			var classes = className.split(" ");
			var output = "";
			
			for(var i=0; i<classes.length; i++) {
				if(classes[i] != remove) {
					output += classes[i];
					if(i < classes.length-1) output += ' ';
				}
			}
			
			return output;

		}
		
		var onRefresh = function(pullDownEl) {
			if (pullDownEl.className.match('loading')) {
				pullDownEl.className = 'ui-ios-pull-to-refresh';
				pullDownEl.querySelector('.message').innerHTML = 'Pull down to refresh';
			}
		}
		
		var onScrollMove = function(pullDownEl, scroller) {
			if (scroller.y > 5 && !pullDownEl.className.match('flip')) {
				pullDownEl.className = 'ui-ios-pull-to-refresh flip';
				pullDownEl.querySelector('.message').innerHTML = 'Release to refresh';
				scroller.minScrollY = 0;
			} else if (this.y < 5 && pullDownEl.className.match('flip')) {
				pullDownEl.className = 'ui-ios-pull-to-refresh';
				pullDownEl.querySelector('.message').innerHTML = 'Pull down to refresh';
				scroller.minScrollY = -pullDownOffset;
			} 
		}
		
		var onScrollEnd = function (pullDownEl, pullDownAction, scroller) {
			if (pullDownEl.className.match('flip')) {
				pullDownEl.className = 'ui-ios-pull-to-refresh loading';
				pullDownEl.querySelector('.message').innerHTML = 'Loading ...';				
				pullDownAction(scroller);	// Execute custom function (ajax call?)
			} 
		}
		
		var pullDownAction = function(scroller) {
			setTimeout(function () {
				scroller.refresh();	
			}, 1000);
		}
		
		// setup iScroll
		if(pullDownOffset == 0) {
		
			var scrollInstance = new iScroll(el, {
				scrollbarClass: 'ui-ios-scrollbar'
			});
			
		} 
		else {
		
			var scrollInstance = new iScroll(el, {
				topOffset: pullDownOffset,
				scrollbarClass: 'ui-ios-scrollbar',
				onRefresh: function () {
					onRefresh(pullDownEl);
				},
				onScrollMove: function () {
					onScrollMove(pullDownEl, this);
				},
				onScrollEnd: function () {
					onScrollEnd(pullDownEl, pullDownAction, this);
				}
			});
			
		}		
	
	});
	
}