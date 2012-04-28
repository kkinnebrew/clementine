# OrangeUI Wiki

OrangeUI is a javascript framework for building dynamic, interactive web applications in the browser.

## Introduction

The OrangeUI framework is meant as a tool to rapidly develop web based applications, giving the developer a pattern for organizing individual views and their interaction. It provides a base set of modules handling HTML5 features in its Commons package, as well as allows the extending of current view classes to create more complex UI controls.

================
## Commons

The Commons Library is a base set of tools to help improve the structure of your application. Included are a set of HTML5 feature wrappers (localStorage, offline mode, geolocation) as well as a class-based module pattern similar to what is included with YUI.

### Modules

The simplest way to access Commons is with the `Orange.use()` method, which takes in as its arguments, a list of module dependencies and the function wrapping your code to execute. The function is passed the global object O, the base object for all framework and application code.

	Orange.use('module_one', 'module_two', function(O) {

		// my code goes here

	});

In most cases, application code should be defined within modules, which can be namespaced based on what you are building. Modules provide a way to logically separate code as well as load only what parts you need for  a given application. To define a module:

	Orange.add('module_name', function(O) {
	
		O.namespace('MyNamespace');
	
	}, ['module_one', 'module_two'], '0.1');
	
The `add()` method takes in a module name, function wrapping the code to execute, an array of module dependencies, and an optional version number.

When defining a namespace at `O.namespace('MyNamespace')`, the object O.MyNamespace will be made available to you for storing your application code.

### Classes

The Commons library is setup for you to define Javascript classes. `O.define()` and `O.extend()` can be used to create new classes and subclass existing classes. Each base class definition expects an initialize() method. For example: 

	Orange.add('my_module', function(O) {
	
		O.namespace('MyNamespace');
		
		// define a new class
		O.MyNamespace.MyClass = O.define({
		
			initialize: function() {
			
				// initialize here
			
			},
			
			setTitle: function(title) {
			
			}
			
		
		});
		
		// extend a class
		O.MyNamespace.MySubClass = O.extend(T.MyNamespace.MyClass, {
		
			// adds a class to the base class
			setName: function(name) {
			
			},
			
			setTitle: function(title) {
			
				// call the superclass
				this._super(title);
			
			}
		
		});
	
	}, ['module_one'], '0.1');
	
	
### HTML5
	
The Commons Library provides a base set of methods used to wrap native HTML5 functionality such as localStorage, offline mode, and geolocation.

### Local Storage

All local storage can be accessed through the **O.Storage** manager on the global object. This object supports `get()`, `set()`, `remove()`, `flush()`, and `flushExpired()`.

####.get( key, defaultValue )
*Returns the value for a key from localStorage*

**key** a key to lookup from the local storage object  
**defaultValue** the default value to return when the key is not found  

---------------------------

####.set( key, value, ttl )
*Sets an object value to localStorage for a given key*

**key** a key store the local storage object to  
**value** the value to store for the given key  
**ttl** *optional* how long before the object should be auto flushed in milliseconds

---------------------------

####.remove( key )
*Removes an object from localStorage for a given key*

**key** a key to remove from localStorage

---------------------------

####.flush( force )
*Flushes all object from the localStorage object. Objects will not be flushed in offlineMode unless force is set to `true`.*

**force**  whether to force clearing in offline mode 

---------------------------

####.flushExpired( force )
*Flushes all expired objects from the localStorage object. Objects will not be flushed in offlineMode unless force is set to `true`.*

**force**  whether to force clearing in offline mode 

---------------------------

####Examples

Set an object to localStorage

	var user = { name: 'Kevin' };
	O.Storage.set('user', user, 60*1000);
	
Get an object from localStorage

	var user = O.Storage.get('user');
	
Remove an object from localStorage

	O.Storage.remove('user');
	
Clear all objects from localStorage

	O.Storage.flush();
	
Clear all expired objects from localStorage, even in offlineMode

	O.Storage.flushExpired(true);
	
---------------------------

### Offline Mode

Commons provides built in support for HTML5's offline mode caching and online/offline javascript events. In conjunction with a **cache.manifest** file for your web application resources, it is possible to create a fully functional offline web application in the browser.

Offline caching can be accessed through the **O.Cache** manager on the global object. The object supports `updateNetworkStatus()` method for checking the current connection and fires the custom online/offline event **statusChange** with a code of online -> true or offline -> false. You can also bind events on to the Cache manager to listen for status changes.

####.updateNetworkStatus()
*Requests a manual update of the current status of the web application's network connection. Supported browsers will fire `statusChange` events when the browser goes online/offline, and fall back to polling if the navigator.onLine property is not available.*

---------------------------

####.bind( event, callback )
*Binds an event listener to the Cache manager. The Cache manager fires a `statusChange` event with true or false representing the connection state.*

---------------------------

####Examples

Manually check the connection

	O.Cache.updateNetworkStatus();
	
Bind a listener for a network change event

	O.Cache.bind('statusChange', function(e) {
		
		if (e.data == true) {
			alert('Connection Online');
		} else {
			alert('Connection Offline');
		}
		
	});
	
---------------------------

### Location

Commons provides a wrapper for fetching the current location from the user's browser. This can be accessed through the **O.Location** manager on the global object. The object supports the `getLocation()` method, which accepts a success and failure callback. The location is fetched asynchronously.

####.getLocation( success, failure )
*Submits an asynchronous request for the location of the user's browser. The success callback will receive the coordinates object returned as its sole argument.*

**success**  callback when the location is found
**failure**  callback when the location is not found

---------------------------

####Examples

Check the location of the browser

	O.Location.getLocation(function(coords) {
		
		// success
		alert(coords);
		
	}, function() {
	
		// failure
		alert('Location error');
	
	});

---------------------------