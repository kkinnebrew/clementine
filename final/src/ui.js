/**
 * ui.js | Orange UI Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, jquery-1.7.2
 * @description commonly used view controllers
 */

Orange.add('ui', function(O) {

	var Binding, Control, Form, GridViewController, LightboxViewController, ListViewController, MapViewController, MultiViewController, 
			ProgressViewController, TableViewController, TabViewController, TooltipViewController, ViewController;
	
	
	Binding = Class.extend({
	
	});
	
	
	Control = Class.extend({
	
	});
	
	
	Form = Class.extend({
	
	});
	
	
	ViewController = Class.extend({
	
	});
	
	
	O.Binding = Binding;
	O.Control	= Control;
	O.Form		= Form;
	
	O.GridViewController			= GridViewController;
	O.LightboxViewController	= LightboxViewController;
	O.ListViewController			= ListViewController;
	O.MapViewController				= MapViewController;
	O.MultiViewController			= MultiViewController;
	O.ProgressViewController	= ProgressViewController;
	O.TableViewController			= TableViewController;
	O.TabViewController				= TabViewController;
	O.TooltipViewController		= TooltipViewController;
	O.ViewController					= ViewController;
	
}, ['mvc'], '1.0.2');