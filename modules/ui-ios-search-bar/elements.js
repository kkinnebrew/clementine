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
		
		$(".ui-ios-table-view").on("touchstart", function(e) {
		
			var el = $(e.target);
					
			if(el.is("li")) {
				el.addClass("touched");
			}
		
		});
		
		$(".ui-ios-table-view").on("touchmove", function(e) {
		
			$(this).find("li").removeClass("touched");
		
		});
		
		$(".ui-ios-table-view").on("touchend", function(e) {
				
			$(this).find("li").removeClass("touched");
		
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
		
		
		$(".event-pop-view").live('touchend', function(e) {
		
			var current = $(this).closest('.ui-ios-navigation-controller');
			popNavigationView(current);
		
		});
		
		$(".event-push-view").live('touchend', function(e) {
		
			var current = $(this).closest('.ui-ios-navigation-controller');
			pushNavigationView(current);
		
		});
		
		$(".event-pop-to-root-view").live('touchend', function(e) {
		
			var current = $(this).closest('.ui-ios-navigation-controller');
			popToRootViewController(current);
		
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
		
		$(".event-pop-view").live('click', function(e) {
		
			var current = $(this).closest('.ui-ios-navigation-controller');
			popNavigationView(current);
		
		});
		
		$(".event-push-view").live('click', function(e) {
		
			var current = $(this).closest('.ui-ios-navigation-controller');
			pushNavigationView(current);
		
		});
		
		$(".event-pop-to-root-view").live('click', function(e) {
		
			var current = $(this).closest('.ui-ios-navigation-controller');
			popToRootViewController(current);
		
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

function applyUIIOSNavigationController() {

	$(".ui-ios-navigation-controller").each(function() {
		
		var current = $(this).find('.ui-ios-view.active');
		if(current.length == 0) {
			var current = $(this).find('.ui-ios-view:first').addClass('active');
		}
		if(current.length == 0) return;
		
		var leftBtn = current.find('.ui-ios-bar-button-item.left');
		var rightBtn = current.find('.ui-ios-bar-button-item.right');
		var navigationBar = $(this).find('.ui-ios-navigation-bar');
		
		if(leftBtn.length != 0) {
			var leftControlBtn = leftBtn.clone();
			leftControlBtn.appendTo(navigationBar);
		}
		
		if(rightBtn.length != 0) {
			var rightControlBtn = rightBtn.clone();
			rightControlBtn.appendTo(navigationBar);
		}
	
	});

}


function popNavigationView(name) {
	
	var controller = typeof name == "object" ? name : $(".ui-ios-navigation-controller.name-" + name);
	if(controller.length == 0) return;
	
	var current = controller.find('.ui-ios-view.active');
	if(current.length == 0) return;
	
	var prev = current.prev('.ui-ios-view');
		
	if(prev.length != 0) {		
	
		var leftBtn = prev.children('.ui-ios-bar-button-item.left');
		var rightBtn = prev.children('.ui-ios-bar-button-item.right');
		var navigationBar = controller.find('.ui-ios-navigation-bar');
		
		// hide existing buttons
		navigationBar.find('.ui-ios-bar-button-item').each(function() {
			$(this).fadeOut(300, function() { $(this).remove(); });
		});
		
		if(leftBtn.length != 0) {
			var leftControlBtn = leftBtn.clone().hide();
			leftControlBtn.appendTo(navigationBar);
			leftControlBtn.fadeIn(300);
		}
		
		if(rightBtn.length != 0) {
			var rightControlBtn = rightBtn.clone().hide();
			rightControlBtn.appendTo(navigationBar);
			rightControlBtn.fadeIn(300);
		}
	
		prev.addClass('unloading').removeClass('unloaded');
		current.removeClass('active').addClass('preloaded');
		setTimeout(function() {
			current.find("input").attr('disabled', 'disabled').blur();
			current.find("select").attr('disabled', 'disabled').blur();
			prev.addClass('active').removeClass("unloading");
		}, 400);
		
		prev.find("input").removeAttr('disabled');
		prev.find("select").removeAttr('disabled');
		
	}
	
}

function popToRootViewController(name) {
	
	var controller = typeof name == "object" ? name : $(".ui-ios-navigation-controller.name-" + name);
	if(controller.length == 0) return;
		
	var current = controller.find('.ui-ios-view.active');
	if(current.length == 0) return;
		
	var prev = controller.find('.ui-ios-view:first');
				
	if(prev.length != 0) {
	
		var leftBtn = prev.children('.ui-ios-bar-button-item.left');
		var rightBtn = prev.children('.ui-ios-bar-button-item.right');
		var navigationBar = controller.find('.ui-ios-navigation-bar');
		
		// hide existing buttons
		navigationBar.find('.ui-ios-bar-button-item').each(function() {
			$(this).fadeOut(300, function() { $(this).remove(); });
		});
		
		if(leftBtn.length != 0) {
			var leftControlBtn = leftBtn.clone().hide();
			leftControlBtn.appendTo(navigationBar);
			leftControlBtn.fadeIn(300);
		}
		
		if(rightBtn.length != 0) {
			var rightControlBtn = rightBtn.clone().hide();
			rightControlBtn.appendTo(navigationBar);
			rightControlBtn.fadeIn(300);
		}
		
		var notFirst = controller.find('.unloaded:not(:first)').css('display', 'none');
		setTimeout(function() {
			notFirst.css('display', 'block');
		}, 400);
		prev.addClass('unloading').removeClass('unloaded');
		current.removeClass('active').addClass('preloaded');
		setTimeout(function() {
			current.find("input").attr('disabled', 'disabled').blur();
			current.find("select").attr('disabled', 'disabled').blur();
			prev.addClass('active').removeClass("unloading");
		}, 400);
		
		controller.find('.unloaded').removeClass('unloaded').addClass('preloaded');
		
		prev.find("input").removeAttr('disabled');
		prev.find("select").removeAttr('disabled');
		
	}
	
}

function pushNavigationView(name, viewName) {
		
	var controller = typeof name == "object" ? name : $(".ui-ios-navigation-controller.name-" + name);
	if(controller.length == 0) return;
		
	var current = controller.find('.ui-ios-view.active');
	if(current.length == 0) var current = controller.find('.ui-ios-view:first');
	if(current.length == 0) return;
		
	if(viewName == undefined) var next = current.next('.ui-ios-view');
	else var next = controller.find('.ui-ios-view.name-' + viewName);
			
	if(next.length != 0) {
		
		var leftBtn = next.children('.ui-ios-bar-button-item.left');
		var rightBtn = next.children('.ui-ios-bar-button-item.right');
		var navigationBar = controller.find('.ui-ios-navigation-bar');
		
		// hide existing buttons
		navigationBar.find('.ui-ios-bar-button-item').each(function() {
			$(this).fadeOut(300, function() { $(this).remove(); });
		});
				
		if(leftBtn.length != 0) {
			var leftControlBtn = leftBtn.clone().hide();
			leftControlBtn.appendTo(navigationBar);
			leftControlBtn.fadeIn(300);
		}
		
		if(rightBtn.length != 0) {
			var rightControlBtn = rightBtn.clone().hide();
			rightControlBtn.appendTo(navigationBar);
			rightControlBtn.fadeIn(300);
		}
		
		var cursor = next.prev('.ios-ui-view');
		
		while(cursor.length != 0) {
			if(cursor.hasClass('preloaded')) {
				cursor.css('display', 'none').removeClass('preloaded').addClass('unloaded');
				var currentCursor = cursor;
				setTimeout(function() {
					currentCursor.css('display', 'block')
				}, 400);
			}
			
			cursor = cursor.prev('.ios-ui-view');
			
		}
		
		next.addClass('loading').removeClass('preloaded');
		current.removeClass('active').addClass('unloaded');
	
		setTimeout(function() {
			current.find("input").attr('disabled', 'disabled').blur();
			current.find("select").attr('disabled', 'disabled').blur();
			next.addClass('active').removeClass("loading");
		}, 400);
		
		next.find("input").removeAttr('disabled');
		next.find("select").removeAttr('disabled');
		
	}

}
