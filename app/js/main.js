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
	engine.append(navBar.render());

});