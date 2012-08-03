# Commons

The Commons module is a base set of tools to help improve the structure of your application. It provides you with:

* Object-oriented javascript objects
* Event mixin for objects
* HTML5 wrapper functions
* Module dependency management

## Documentation

### Class

* [extend()](#class-extend)
* [include()](#class-include)
* [proxy()](#class-proxy)

### Events

* [on()](#events-on)
* [once()](#events-once)
* [fire()](#events-fire)
* [detach()](#events-detach)

### EventHandle

* [detach()](#event-handle-detach)

### EventTarget

* [currentTarget](#event-target-current-target)
* [target](#event-target-target)
* [stopPropagation()](#event-target-stop-propagation)

### Modules

* [add()](#modules-add)
* [use()](#modules-use)
* [include()](#modules-include)
* [exports](#modules-exports)

### Cache

* [init()](#cache-init)
* [updateNetworkStatus()](#cache-update-network-status)
* [isActive()](#cache-is-active)

**includes Events mixin*

### Storage

* [get()](#storage-get)
* [set()](#storage-set)
* [remove()](#storage-remove)
* [flush()](#storage-flush)
* [flushExpired()](#storage-flush-expired)
* [isSupported()](#storage-is-supported)

### Location

* [getLocation()](#location-get-location)

## Class

OrangeUI provides basic OOP tools via the **Class** object, which can be used to create and extend classes, include mixins, and proxy functions.

<a name="class-extend" />
### extend(object)

Class method `extend()` can be used to create new classes and subclass existing classes. Each base class definition expects an initialize() method. Calling `this._super()` in an instance method will access and execute the superclass' method.

**Arguments**

* object - the javascript object representing the class instance methods. The object must implement the method initialize() as its constructor if it is not inheriting from another class.

**Example**

```js
// creates a new class 'MyClass'
var MyClass = Class.extend({

	initialize: function() {
		console.log('Hello World');
	},

	getAge: function() {
		return 25;
	}

});

// creates a subclass of 'MyClass'
var MySubClass = MyClass.extend({

	getMyAge: function() {
		return 'My age is ' + this.getAge();
	}

});
```

```js
// accessing the superclass
var MySubClass = MyClass.extend({
	
	getAge: function() {
		return this._super() + 5; // returns 30
	}

});
```

---------------------------------------

<a name="class-include" />
### include(mixin)

Binds a mixin of functions to an existing class so that all mixin methods are available to instances of that class.

**Arguments**

* mixin - the object containing the functions to add to the given class

**Example**

```js
var MyClass = Class.extend({
	
	initialize: function() {
		console.log('Hello World');
	}

});

var MyMixin = {
	myMethodOne: function() {
		return 'one';
	},
	myMethodTwo: function() {
		return 'two';
	}
};

MyClass.include(MyMixin);

var instance = new MyClass();
instance.myMethodTwo(); // will return 'two'
```

---------------------------------------

<a name="class-proxy" />
### proxy(function, context)

Returns a function bound to a given context object for execution at a later time. This provides the same functionality as jQuery's `$.proxy()` function.

**Arguments**

* function - the function to bind the context to
* context - the object to use as the context

**Example**

```js
// proxies a function with a context object
Class.proxy(function() {
	console.log(this.name); // prints 'my-context'
}, { name: 'my-context' });
```


## Events

OrangeUI provides the *Event* mixin that can be used to bind events to objects. Objects including this mixin have access to the `once()`, `on()`, `fire()`, and `detach()` methods to handle all event listening on an object. An optional parent can be passed to the mixin to allow for event bubbling up a heirarchy you define.

The `on()` function will return an event handle that can be used to detach the event at a later time. Callbacks receive an `e` argument and a `data` argument when executed, the `e` argument including the target, currentTarget, and access to call `e.stopPropagation` to prevent event bubbling. The `data` argument is set to the optional second argument passed to the `fire()` method to trigger an event.

<a name="events-on" />
### on(event, callback, context)

Subscribes a callback to a given event and returns an **EventHandle** instance for later detaching.

**Arguments**

* event -	a string of the event to listen for 
* callback - a function to execute when the event is fired 
* context - an optional context to proxy the callback with 

**Examples**

```js
// bind an 'load' event
myEventedClass.on('load', function(e, data) {
	console.log('Loaded!');
});

```js
// or with an optional context

var context = {
	msg: "Appeared!"
};

myEventedClass.on('appear', function(e, data) {
	console.log(this.msg); // prints 'Appeared!'
}, context);
```

---------------------------------------

<a name="events-once" />
### once(event, callback, context)

Subscribes a callback to an event just once. Once the event is fired, all callbacks defined using `once()` will be detached.

**Arguments**

* event - a string of the event to listen for 
* callback - a function to execute when the event is fired 
* context - an optional context to proxy the callback with 

**Examples**

```js
// bind once event
myEventedClass.once('appear', function(e, data) {
	console.log('Firing');
});

myEventedClass.fire('appear'); // prints 'Firing'
myEventedClass.fire('appear'); // prints nothing

```

---------------------------------------

<a name="events-fire" />
### fire(event, [data])

Fires an event of a given name and passes an optional payload to all subscribing callbacks.

**Arguments**

* event - a string of the event to fire 
* data - a payload to pass to all registered callbacks 

**Examples**

```js
// bind once event
myEventedClass.on('load', function(e) {
	console.log('Loaded!');
});

myEventedClass.fire('appear'); // prints 'Loaded!'
```

```js
// bind once event
myEventedClass.on('appear', function(e, data) {
	console.log(data);
});

// prints { msg: 'hello' }
myEventedClass.fire('appear', { msg: 'hello'});
```

---------------------------------------

<a name="events-detach" />
### detach([event], [callback])

Detaches listeners from a given object. It will detach all listeners for an event when a callback is not set, and all listeners on that object when no arguments are passed.

**Arguments**

* event -	the event string to unbind listeners for 
* callback - the callback to unbind from an given event 

**Examples**

```js
// unbinds a specific listener
var onLoad = function(e) {
	console.log('Loaded!');
};

// bind the event
myEventedClass.on('load', onLoad);

// detach that event
myEventedClass.detach('load', onLoad);
```

```js
// unbinds all listeners for 'load'
myEventedClass.detach('load');
```

```js
// unbinds all listeners
myEventedClass.detach();
```

## EventHandle

<a name="event-handle-detach" />
### detach()

Detaches the listener bound to the given EventHandle

**Examples**

```js
var handle = myEventedClass.on('load', function(e) {
	console.log('Loaded!');
});

handle.detach(); // detaches the event
```

## EventTarget

The EventTarget is passed as the `e` argument to all callback functions when an event is fired. If a class has defined its `_parent` reference, the EventTarget will attempt to bubble events up the hierachy until it either reaches a parent of `null` or `stopPropagation()` is called.

<a name="event-target-current-target" />
### currentTarget

Returns the current object the event is firing on.

---------------------------------------

<a name="event-target-target" />
### target

Returns the object the event was originally triggered on.

---------------------------------------

<a name="event-target-stop-propagation" />
### stopPropagation()

Stops the bubbling of an event up the parent hierarchy when called inside a callback.

**Examples**

```js
myEventedClassParent.on('load', function(e) {
	console.log('Loaded Parent!');
});

myEventedClass._parent = myEventedClassParent;

myEventedClass.on('load', function(e) {
	e.stopPropagation();
	console.log('Loaded!');
});

myEventedClassChild._parent = myEventedClass;

myEventedClassChild.on('load', function(e) {
	console.log('Loaded Child!');
});

myEventedClassChild.fire('load');

// prints 'Loaded Child!'
// prints 'Loaded!'
// doesn't print 'Loaded Parent!'
```

## Modules

Modules give an easy way to manage dependencies and organize logically separate code components. Since client-side code is executed as it is included in your HTML files, modules are registered via the `add()` function on the global object. This method specifics the code to add as well as the modules it is dependent on, and the version of the module.

<a name="modules-add" />
### add(module, fn, dep, version)

Adds a module with a given name and associates it with a given number of dependencies and versions. The `add()` method is available globally on the `Orange` object.

**Arguments**

* module - the module string name 
* fn - the function containing the modules code 
* dep -	an array of module dependency name strings 
* version -	the string version number of the module 

**Examples**

```js
Orange.add('my-module', function() {
		
	// my code here

}, ['my-other-module'], '0.1');
```

---------------------------------------

<a name="modules-use" />
### use(dependencies…, fn)

On occasion, it might be necessary to run adhoc code without necessarily creating a module. This can be done using the `use()` method, which loads required dependencies for the code. The code within the function will be run immediately when `use()` is executed. The `use()` method is available globally on the `Orange` object.

**Arguments**

* dependencies - (multiple) the string names of the modules 
* fn - a function containing the adhoc code 

**Examples**

```js
Orange.use('my-module-one', 'my-module-two', function() {
		
	// code goes here

});
```

---------------------------------------

<a name="modules-include" />
### include(module)

 To load required components, OrangeUI uses a convention similar to that seen in NodeJS. Requires and loads an external module and returns the object associated with that module's `exports` object. The `include()` method is available in the global scope.

**Arguments**

* module - the name of the module to import

**Examples**

```js
// returns the exports object of module myClass
var myClass = include('myClass');
```

---------------------------------------

<a name="modules-exports" />
### exports

To export private code components, the exports object is passed to the function. It can either be set in its entirety, or have attributes added to it.

**Examples**

```js
Orange.add('my-module', function(exports) {
		
	var myClass = include('myClass');

	var newClass = myClass.extend({
		getName: function() {
			return 'newClass';
		}
	});
		
	exports.newClass = newClass; // the class is an attribute

	exports = newClass; // the class is the entire object

}, ['my-other-module'], '0.1');
```

## Cache - HTML5 Offline Mode

Commons provides built in support for HTML5's offline mode caching and online/offline javascript events. In conjunction with a **cache.manifest** file for your web application resources, it is possible to create a fully functional offline web application in the browser.

Offline caching can be accessed through the **Cache** object, which supports `updateNetworkStatus()` method for checking the current connection and fires the custom online/offline event **statusChange** with a boolean payload for if the connection is online. You can also bind events on to the Cache object to listen for status changes.

<a name="cache-init" />
### init()

Initializes the Cache and starts listening for online or offline events. 

**Examples**

```js
Cache.init();
```

<a name="cache-update-network-status" />
### updateNetworkStatus()

Requests a manual update of the current status of the web application's network connection. Supported browsers will fire `statusChange` events when the browser goes online/offline, and fall back to polling if the navigator.onLine property is not available.

**Examples**

```js
Cache.updateNetworkStatus(); // will fire 'statusChange' event
```

<a name="cache-is-active" />
### isActive()

Returns a boolean value stating whether the Cache has been initialized.

```js
var active = Cache.isActive();
console.log(active); // prints true or false
```

## Storage - HTML5 Local Storage

The **Commons** module provides a wrapper for the HTML5 localStorage feature, adding support for the serializing of Javascript objects and setting autoexpirable keys. The **Storage** object supports `get()`, `set()`, `remove()`, `flush()`, and `flushExpired()`.

<a name="storage-get" />
### get(key, [defaultValue])

Returns the value for a key from localStorage.

**Arguments**

* key - a key to lookup from the local storage object  
* defaultValue - the default value to return when the key is not found  

**Examples**

```js
var myKey = Storage.get('myKey');
```

---------------------------

<a name="storage-set" />
### set(key, value, [ttl])

Sets an object value to localStorage for a given key.

**Arguments**

* key - a key store the local storage object to  
* value - the value to store for the given key  
* ttl - optional how long before the object should be auto flushed in milliseconds

**Examples**

```js
// store a string
Storage.set('myKey', 'myValue');

// or an object
Storage.set('myKey', { value: 'myValue' });
```

---------------------------

<a name="storage-remove" />
### remove(key)

Removes an object from localStorage for a given key.

**Arguments**

* key - a key to remove from localStorage

**Examples**

```js
Storage.remove('myKey');
```

---------------------------

<a name="storage-flush" />
### flush(force)

Flushes all object from the localStorage object. Objects will not be flushed in offlineMode unless force is set to `true`.

**Arguments**

* force - whether to force clearing in offline mode

**Examples**

```js
Storage.flush();
```

---------------------------

<a name="storage-flush-expired" />
### flushExpired(force)

Flushes all expired objects from the localStorage object. Objects will not be flushed in offlineMode unless force is set to `true`.

**Arguments**

* force -  whether to force clearing in offline mode 

**Examples**

```js
Storage.flushExpired();
```

<a name="storage-is-supported" />
### isSupported()

Returns a boolean value checking if the localStorage cache is supported.


## Location - HTML5 Geolocation

Commons provides a wrapper for **HTML5 Geolocation** fetching of the current location from the user's browser. The **Location** object supports the `getLocation()` method, which accepts a success and failure callback. The location is fetched asynchronously.

### getLocation(success, failure)

Submits an asynchronous request for the location of the user's browser. The success callback will receive the coordinates object returned as its argument.

**Arguments**

* success(coords) - the callback that the location coordinates will be passed to.
* failure(err) - the callback that will be called if the coordinates cannot be retreived

**Examples**

```js
Location.getLocation(function(coords) {
		
		alert(coords); // success
		
	}, function(err) {
	
		alert('Location error', err); // failure
	
	});
```