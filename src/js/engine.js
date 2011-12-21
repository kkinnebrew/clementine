/**
 * engine.js | OrangeUI Framework 0.1 | 12.21.2011 
 */

UI.Engine = Class.create({

	initialize: function() {
	
		$(".ios-ui-table-view").each(function() {
		
			var table = new UI.iOS.UITableView($(this).get(0));
		
		});
	
	}

});