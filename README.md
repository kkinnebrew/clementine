# OrangeUI

OrangeUI is a javascript framework for building dynamic, interactive web applications in the browser.

Many of the features of OrangeUI are stable, however the framework is still in active development and things are bound to change. Try it out on a project and make suggestions or report bugs [here].

## Getting Started

## Why does OrangeUI exist?

It is meant as a tool to rapidly develop web based applications, giving the developer a pattern for organizing individual views and decoupling their interaction logic. It provides a base set of modules handling HTML5 features in its Commons package, classes for interacting with webservices, and an Model-ViewController-View like structure to create more complex UI controls.

## Installing OrangeUI

## Release History

* 8/1/2012 - v0.4.0 - Adding web service persistence, view controller hide/show states.
* 7/8/2012 - v0.3.0 - Including view controller event helper functions, auto context proxying.
* 5/7/2012 - v0.2.0 - Updated view inheritance, bug fixes from prior version.
* 2/25/2012 - v0.1.0 - Initial release, unstable.

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

Calling the `this.super()` method inside a given class will call the override method from the superclasss.

	
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

####.on( event, callback )
*Binds an event listener to the Cache manager. The Cache manager fires a `statusChange` event with true or false representing the connection state.*

**name**  the string of the name of the custom event
**callback**  the specific callback to execute when the even is fired

---------------------------  

####.detach( event, callback )
*Unbinds an event listener to the Cache manager.*

**name**  (optional) the string of the name of the custom event
**callback**  (optional) the specific callback to remove

---------------------------  

####Examples

Manually check the connection

	O.Cache.updateNetworkStatus();
	
Bind a listener for a network change event

	O.Cache.on('statusChange', function(e) {
		
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
  

## MVC

The MVC Library provides a Model-View-Controller structure that sits on top of Commons. Included are tools allowing for structuring of UI views, reusable controls, dynamic templating with **JSON Template**, as well as data request persistence using localStorage. This library is controlled by the **Application** class which organizes and manages your underlying view controllers.

### Application

The **Application** class is wrapper class that holds the structure and configuration of your application. All underyling classes, such as models and controllers, contain an accessible reference to the instance of the application running. To create an application, a set of configuration parameters must be registered with the application manager using `App.register()`. Launching the application is as simple as calling `App.init()`. The following are stored on the application manager **O.App** on the global object.

####.register( name, config )
*Flushes all object from the localStorage object. Objects will not be flushed in offlineMode unless force is set to `true`.*

**name**  the name of the application to register  
**config**  stores configuration parameters for the application  

*required* - an array of modules required before loading  
*location* - whether to enable location services, default false  
*poll* - whether to poll for connection changes, default false  
*baseUrl* - the baseUrl to serve all content files from  
*onLoad* - a callback to run when the application is first launched  

---------------------------

####.init( name )
*Launches an instance of the application by a given name.*

**name**  the name of the application to launch

---------------------------  

### Controllers

Controllers here refer specifically to ViewControllers (those managing the activity of views). Any controllers managing business logic should ideally be server-side or at least separated from any display logic. 

The purpose of a View Controller is to manage all interaction and changes within a View. This includes binding events to specific controls, listening for events from user interaction, and reading data in and out of the DOM. View controllers are structured in a hierarchy, where each View Controller maintains references to its parent and its associated children. The base View Controller class exists on the global object `O.ViewController`. All custom views inherit from the base ViewController class. 

#### Registering View Controllers

Views Controllers are registered differently than standard classes, using the `define()` and `extend()` methods on the View Manager located at `O.View`. When defining a new view, the view must override the `type` property, a unique name for the view class. This names will be used later to instaniate these views directly from markup.

####.define( def )
*Creates a new class from the base class ViewController*

**def**  the class definition object

---------------------------  

####.extend( base, def )
*Creates a new class from a given base view class*

**base**  the base class to inherit from
**def**  the definition of the new class

---------------------------  

#### Examples

Define a new view

	O.MyNewView = O.View.define({
	
		type: 'my-new-view'
	
	});
	
Extend an existing view
	
	O.MyNewerView = O.View.extend(O.MyNewView, {
	
		type: 'my-newer-view'
	
	});

####View Controller Class
			
The base **ViewController** class provides a base set of functions and attributes to manage event handling and reference management. All custom views controllers can access or override these methods to provide new functionality. All custom view controller setup/teardown logic should be placed in the `onLoad()` and `onUnload()` methods.

####.type *[string]*
*A string of the type of a given view controller*

---------------------------  

####.name *[string]*
*A string of the name of the specific instantiated instance of the view controller*

---------------------------  

####.parent *[ViewController]*
*A reference to the parent view controller of the given instance*

---------------------------  

####.views *[associative array]*
*An associative array holding all child views keyed by name*

---------------------------  

####.elements *[associative array]*
*An associative array holding all child elements keyed by name*

---------------------------  

####.forms *[associative array]*
*An associative array holding all child forms keyed by name*

---------------------------  

####.getView( name )
*Gets a reference to a child view controller by name*

**name**  the string of the name of the view instance

---------------------------  

####.getElement( name )
*Gets a reference to a child element by name*

**name**  the string of the name of the element instance

---------------------------  

####.getForm( name )
*Gets a reference to a child form by name*

**name**  the string of the name of the form instance

--------------------------- 

####Event Handling

All interaction between View Controllers should be handled by custom events. The ViewController class provides event binding methods such that a view and fire and be bound to events. All events will bubble up from where the are originally fired until they reach the top of the view hierarchy. Any callback can call `e.stopPropagation()` inside a callback to prevent the event from bubbling further.

####.on( event, callback )
*Gets a reference to a child view controller by name*

**name**  the string of the name of the custom event
**callback**  the specific callback to execute when the even is fired

---------------------------  

####.detach( event, callback )
*Detaches events from a given view controller*

**name**  (optional) the string of the name of the custom event
**callback**  (optional) the specific callback to remove

---------------------------  

####.fire( name, data )
*Fires a custom event with an optional data payload*

**name**  the string of the name of the custom event to fire
**data**  (optional) the data payload callbacks listening for the event can access

---------------------------  

### Views

---------------------------  

### Models

---------------------------  

### Elements

---------------------------  

### Forms

---------------------------  

[here]: https://github.com/brew20k/orangeui/issues?labels=&sort=created&state=open