/**
 * ios.js | Orange iOS Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc, ui, jquery-1.7.2
 * @description adds ios specific controllers
 */

Orange.add('ios', function(O) {

	var Application, UIFlipViewController, UIModalViewController, UINavigationViewController, UIScrollViewController, 
			UISearchViewController, UISplitViewController, UITabBarController, UITableViewController, UIViewController;
	
	O.namespace('iOS');
	
	O.iOS.Application	= Application;
	
	O.iOS.UIFlipViewController 				= UIFlipViewController;
	O.iOS.UIModalViewController				= UIModalViewController;
	O.iOS.UINavigationViewController 	= UINavigationViewController;
	O.iOS.UIScrollViewController 			= UIScrollViewController;
	O.iOS.UISearchViewController 			= UISearchViewController;
	O.iOS.UISplitViewController 			= UISplitViewController;
	O.iOS.UITabBarController					= UITabBarController;
	O.iOS.UITableViewController 			= UITableViewController;
	O.iOS.UIViewController 						= UIViewController;
	
}, ['mvc', 'ui'], '1.0.2');