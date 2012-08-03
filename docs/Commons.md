# Overview

The Commons module is a base set of tools to help improve the structure of your application. It provides you with:

- Object-oriented javascript objects
- Event mixin for objects
- HTML5 wrapper functions
- Module dependency management

## Object Oriented Javascript

OrangeUI provides basic OOP tools via the *Class* object, which can be used to create and extend classes, include mixins, and proxy functions. Class method `extend()` can be used to create new classes and subclass existing classes. Each base class definition expects an initialize() method. For example: 

	var MyClass = Class.extend({

		initialize: function() {
			console.log('Hello World');
		},

		getAge: function() {
			return 25;
		}

	});

	var MySubClass = MyClass.extend({

		getName: function() {
			return 'Hello';
		}

	});

creates a new class `MyClass` with a constructor which prints out 'Hello World' and another class 'MySubClass', which retains all the properties of 'MyClass' but also includes the function `getName()'.

The methods of a class' parent superclass can be accessed by calling the `this._super()' method within that function.

	var MySubClass = MyClass.extend({
	
		getAge: function() {
			return this._super() + 5; // returns 30
		}

	});

The *Class* object also includes the method `include()`, which will merge a mixin into an existing class. For example:

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

by including the above mixin, the class `MyClass` now includes all the methods available in the given mixin.

The *Class* object also provides the `proxy()` function, similar to jQuery's `$.proxy()` that allows you to bind a context to a given function.

proxy(function, context)

*Binds a function to a given context object*

**function**	the function to bind the context to
**context**		the object to use as the context

returns function

------------------------

## Events

OrangeUI provides the *Event* mixin that can be used to bind events to objects. Objects including this mixin have access to the `once()`, `on()`, `fire()`, and `detach()` methods to handle all event listening on an object. An optional parent can be passed to the mixin to allow for event bubbling up a heirarchy you define.

The 'on()' function will return an event handle that can be used to detach the event at a later time. Callbacks receive an `e` argument and a `data` argument when executed, the `e` argument including the target, currentTarget, and access to call `e.stopPropagation` to prevent event bubbling. The `data` argument is set to the optional second argument passed to the `fire()` method to trigger an event.

### Event

#### once(event, callback, context)

subscribes a callback to an event just once

**event**				a string of the event to listen for
**callback**		a function to execute when the event is fired
**context**			an optional context to proxy the callback with

------------------------

#### on(event, callback, context)

subscribes a callback to an event and returns a handle

**event**				a string of the event to listen for
**callback**		a function to execute when the event is fired
**context**			an optional context to proxy the callback with

returns EventHandle

------------------------

#### fire(event, data)

fires an event and passes a payload to the callback

**event**				a string of the event to fire
**data**				a payload to pass to all registered callbacks

------------------------

#### detach(event, callback)

detaches listeners from a given object. will detach all listeners for an event when a callback is not set, and all listeners when no arguments are passed.

**event**			(optional) the event to unbind listeners for
**callback**	(optional)	 the callback to unbind for an event

------------------------

### EventHandle

#### detach()

detaches the listener bound to the given EventHandle

------------------------

### EventTarget

The EventTarget is passed as the `e` argument to all callback functions when an event is fired. If a class as defined its `_parent` reference, the EventTarget will attempt to bubble events up the hierachy until it either reaches a parent of `null` or `stopPropagation()` is called.

#### currentTarget

the current object the event is firing on

------------------------

#### target

the object the event was originally triggered on

------------------------

#### stopPropagation()

stops the bubbling of an event up the parent hierarchy when called inside a callback

------------------------

## Modules

Modules give an easy way to manage dependencies and organize logically separate code components. Since client-side code is executed as it is included in your HTML files, modules are registered via the `add()` function on the global object. This method specifics the code to add as well as the modules it is dependent on, and the version of the module. To add a module

	Orange.add('my-module', function() {
		
		// my code here

	}, ['my-other-module'], '0.1');

specify the modules name, the function containing the module code, an array of dependencies by name, and the version number of the module.

To load required components, OrangeUI uses a convention similar to that seen in NodeJS. The actual code components available in a module must be required or exported. For example, to require individual components, the `include()` function may be used. 

Orange.add('my-module', function(exports) {
		
		var myClass = include('myClass');

		var newClass = myClass.extend({
			getName: function() {
				return 'newClass';
			}
		});
		
		exports.newClass = newClass; // the class is an attribute

		// or

		exports = newClass; // the class is the entire object

	}, ['my-other-module'], '0.1');

To export private code components, the exports object is passed to the function. It can either be set in its entirety, or have attributes added to it.

On occasion, it might be necessary to run adhoc code without necessarily creating a module. This can be done using the `use()` method, which loads required dependencies for the code.

	Orange.use('my-module-one', 'my-module-two', function() {
		
		// code goes here

	});

The code within the function will be run immediately when `use()` is executed.

#### add(module, fn, dep, version)

stops the bubbling of an event up the parent hierarchy when called inside a callback

**module**		the module string name
**fn**				the function containing the modules code
**dep**				an array of module dependency name strings
**version**		the string version number of the module

#### use(dependencies…, fn)

immediately calls the given code after loading the required
dependencies

**dependencies**			(multiple) the string names of the modules
**fn**							a function containing the adhoc code

------------------------

## Logging

## HTML5 - Offline Mode

## HTML5 - Local Storage

## HTML5 - Geolocation
