# OrangeUI

OrangeUI is a javascript framework for building dynamic, interactive web applications in the browser.

Many of the features of OrangeUI are stable, however the framework is still in active development and things are bound to change. Try it out on a project and make suggestions or report bugs [here].

## Getting Started

## Why does OrangeUI exist?

OrangeUI is a rapid development javascript framework for soundly built web applications. It is meant as a tool to rapidly develop web based applications, giving the developer a pattern for organizing individual views and decoupling their interaction logic. It provides a base set of modules handling HTML5 features in its Commons package, classes for interacting with webservices, and an Model-ViewController-View like structure to create more complex UI controls. OrangeUI provides the following:

- Object-oriented javascript objects
- Event mixin for objects
- HTML5 wrapper functions
- Module dependency management
- A real-time or RESTful data persistence layer w/offline mode
- Customizeable models
- Controllers with DOM helper functions
- View fragment loader w/ templating
- Live data bindings
- History and route management
- Standardized UI controls

The goal of this framework is to give you a customizable base for building your web application that completely decouples your data sources from your controller logic and presentation. In addition, it allows the creation of reusable components to speed up development time. OrangeUI sets up standards for how to organize your application code, decouple your styles and UI elements, and interact with web services.

## Installing OrangeUI

To use OrangeUI on your project, all you need to do is include the [orangeui] library at the top of your root html file.

```html
<script type="text/javascript" href="orangeui.js"></script>
```

Depending on the features you choose to use, OrangeUI is dependent on the following libraries:

* Log4js - for logging
* Modernizr - for feature detection
* jQuery - for AJAX and DOM Selectors
* Socket.io - for real time data

## Release History

* 8/1/2012 - v0.4.0 - Adding web service persistence, view controller hide/show states.
* 7/8/2012 - v0.3.0 - Including view controller event helper functions, auto context proxying.
* 5/7/2012 - v0.2.0 - Updated view inheritance, bug fixes from prior version.
* 2/25/2012 - v0.1.0 - Initial release, unstable.

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




[here]: https://github.com/brew20k/orangeui/issues?labels=&sort=created&state=open
[orangeui]: https://github.com/brew20k/orangeui/tree/master/build