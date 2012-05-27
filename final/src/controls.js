/**
 * controls.js | Orange Controls Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc, ui
 * @description adds common form controls
 */

Orange.add('controls', function(O) {

	var AutoCompleteControl, CalendarControl, MultiSelectControl;
	
	O.AutoCompleteControl 	= AutoCompleteControl;
	O.CalendarControl				= CalendarControl;
	O.MultiSelectControl 		= MultiSelectControl;
	
}, ['mvc', 'ui'], '1.0.2');