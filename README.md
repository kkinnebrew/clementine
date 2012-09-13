# OrangeUI

OrangeUI is a javascript framework for building dynamic, interactive web applications in the browser.

Many of the features of OrangeUI are stable, however the framework is still in active development and things are bound to change. Try it out on a project and make suggestions or report bugs [here].

## Why choose OrangeUI?

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

The goal of this framework is to give you a customizable base for building your web application that completely decouples your data sources from your controller logic and presentation. In addition, it allows the creation of reusable components to speed up development time. OrangeUI sets up standards for how to organize your application code, decouple your styles and UI elements, and interact with web services. For a walkthrough of the basics, start with the [Getting Started] guide.

## Including OrangeUI

To use OrangeUI on your project, all you need to do is include the [orangeui] library at the top of your root html file.

```html
<script type="text/javascript" href="orangeui.js"></script>
```

Depending on the features you choose to use, OrangeUI is dependent on the following libraries:

* jQuery - for AJAX and DOM Selectors

## Documentation

* [Commons]
* [MVC]

## Release History

* 9/9/2012 - v0.5.0 - Dynamic chainable view states, custom routes, live microdata DOM bindings.
* 8/1/2012 - v0.4.0 - Adding web service persistence, view controller hide/show states.
* 5/16/2012 - v0.3.0 - Including view controller event helper functions, auto context proxying.
* 3/30/2012 - v0.2.0 - Updated view inheritance, bug fixes from prior version.
* 7/21/2011 - v0.1.0 - Initial release, unstable.

## License

Copyright (c) 2009-12 Kevin Kinnebrew
Licensed under the MIT license.
<https://github.com/brew20k/orangeui/blob/master/LICENSE>

[Getting Started]: https://github.com/brew20k/orangeui/blob/master/docs/Getting%20Started.md
[here]: https://github.com/brew20k/orangeui/issues?labels=&sort=created&state=open
[orangeui]: https://github.com/brew20k/orangeui/tree/master/build
[Commons]: https://github.com/brew20k/orangeui/blob/master/docs/Commons.md
[MVC]: https://github.com/brew20k/orangeui/blob/master/docs/MVC.md