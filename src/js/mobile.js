/**
 * mobile.js | OrangeUI Framework 0.1 | 12.21.2011 
 */
 
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

$(document).ready(function() {

	$(".ios-ui-bar-button-item").bind("touchstart", function(e) {
		
		$(this).addClass("ios-bar-button-gradient-touch");
	
	});
	
	$(".ios-ui-bar-button-item").bind("touchcancel", function(e) {
		
		$(".ios-ui-bar-button-item").removeClass("ios-bar-button-gradient-touch");
	
	});
	
	$(".ios-ui-bar-button-item").bind("touchend", function(e) {
		
		$(".ios-ui-bar-button-item").removeClass("ios-bar-button-gradient-touch");
	
	});

});
