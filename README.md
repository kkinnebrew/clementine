# OrangeUI

OrangeUI is a javascript framework for building dynamic, interactive web applications in the browser.

Many of the features of OrangeUI are stable, however the framework is still in active development and things are bound to change. Try it out on a project and contribute or report bugs [here].

## Why choose OrangeUI?

OrangeUI is a rapid development javascript framework for soundly built web applications. It is meant as a tool to develop highly interactive, maintainable applications in the browser, giving the developer a pattern for organizing their interaction logic, views, and styles into a library of modular, decoupled components. OrangeUI provides the following:

- Object-oriented javascript objects
- Event mixin for objects
- HTML5 wrapper functions
- Module dependency management
- A real-time or RESTful data persistence layer w/offline mode
- Customizeable models
- Hierarchical ViewControllers with DOM helper functions
- View fragment loading w/ templating
- Live DOM model bindings
- History and route management
- Standardized UI controls

The goal of OrangeUI is to give you a customizable scaffold for building your web application that completely decouples your data sources from your controller logic and presentation and styling. OrangeUI sets up standards for how to organize your application code, standardize your styles and UI elements, and interact with web services. For a walkthrough of the basics, start by reading the [Getting Started] guide.

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