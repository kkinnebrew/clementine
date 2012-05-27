/**
 * db.js | Orange DB Module 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc
 * @description adds common data source types
 */

Orange.add('db', function(O) {

	var AjaxSource, LocalStorageSource, RestSource, SessionStorageSource;
	
	
	AjaxSource = Source.extend({
	
	});
	
	
	LocalStorageSource = Source.extend({
	
	});
	
	
	RestSource = Source.extend({
	
	});
	
	
	SessionStorageSource = Source.extend({
	
	});
	
	
	O.AjaxSource 						= AjaxSource;
	O.LocalStorageSource 		= LocalStorageSource;
	O.RestSource 						= RestSource;
	O.SessionStorageSource 	= SessionStorageSource;
	
}, ['mvc'], '1.0.2');