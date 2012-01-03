/**
 * main.js | Test Application 0.1 | 1.3.2012
 * 
 * handles main execution of the rendering engine
 * 
 */

$(document).ready(function() {

	var engine = new Orange.UI.Engine();
		
	// add a navigation bar
	var navBar = new Orange.UI.IOS.UINavigationBar();
	navBar.setTitle("Welcome");
	engine.append(navBar.render());
	
	// add buttons
	var leftButton = new Orange.UI.IOS.UIBarButtonItem();
	leftButton.setLabel("Back");
	navBar.setLeftBarButtonItem(leftButton);
	
	var rightButton = new Orange.UI.IOS.UIBarButtonItem();
	rightButton.setLabel("Email");
	navBar.setRightBarButtonItem(rightButton);
	
	var table = new Orange.UI.IOS.UITableView();
	
	for(var i=0; i<10; i++) {
		table.appendCell(new Orange.UI.IOS.UITableViewCell());	
	}
	
	engine.append(table.render());

});