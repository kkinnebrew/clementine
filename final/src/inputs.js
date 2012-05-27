/**
 * inputs.js | Orange Controls Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc, ui
 * @description adds common form inputs
 */

Orange.add('inputs', function(O) {

	var AutoCompleteInput, CalendarInput, MultiSelectInput;
	
	O.AutoCompleteInput 	= AutoCompleteInput;
	O.CalendarInput				= CalendarInput;
	O.MultiSelectInput 		= MultiSelectInput;
	
}, ['mvc', 'ui'], '1.0.2');