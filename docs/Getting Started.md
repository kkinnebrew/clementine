# Getting Started

## View Controller Architecture

OrangeUI attempts to emulate the hierarchical structure of the DOM via View Controllers while decoupling code components so they can be reused. It provides custom event bindings to manage communication between view controllers, where individual view controllers in the hierarchy manage only their children.

## Rules

1. For every view is a view controller instance
2. A controller instance should manage only one view
3. Controllers only call methods on their children
4. Controllers fire events to communicate with their parents
5. Manually unbind all manually bound events

## Example

Suppose we're building a simple address book web application. We want to have a searchable list of contacts on the left, and a detail view displaying the currently selected contact on the right. In the next few minutes, we'll build this app with OrangeUI.

### Step 1: Building Hierarchy with Views

In OrangeUI, views are simply HTML. Our views should follow the conventions of good HTML; they exist strictly to describe the structure, not the style our application.

We first want to outline what views we need and how the will be organized. Even though we haven't ironed out the details, we know the basic structure and arrangement of our application's views. In a traditional, page like application, we might start with something like this,

```html
<body>
	<section class="contacts-app">
		<div class="left-content contact-search-list">
			<input type="search" name="keyword" />
			<ul class="contacts-list">
				<!-- individual contacts go here -->
			</ul>
		</div>
		<div class="right-content contact-detail">
			<!-- details go here -->
		</div>
	</section>
</body>
```

This works fine for our simple application, but imagine we implementing several other features in the future (managing a list of todo's, sending messages, etc). It would be helpful to abstract out our standardized components (lists, buttons, toolbars), to use again in other application features that follow a similar pattern.

To take the forward thinking approach, we would first break the above HTML into its logical components, ie views. In principle, each component should have only one function (a list, a search field, a table) or should simply combine simple components to make more complex ones (a searchable list, a slideshow). Each of these are views. OrangeUI denotes each of these logical sections with a `data-control` attribute. This attribute will ultimately correspond to the Javascript controller that manages the associated view. Writing our HTML in this new pattern, 

```html
<body>
	<section data-control="contacts-app">
		<div data-control="contacts-search-list">
			<input data-control="search-field" type="search" name="keyword" />
			<ul data-control="contacts-list">
				<!-- individual contacts go here -->
			</ul>
		</div>
		<div data-control="contact-detail">
			<!-- details go here -->
		</div>
	</section>
</body>
```

we've now broken everything into a logical components. Given the DOM's tree structure, we see that our views are also nested in a similar way. Our view *contacts-app* wraps the entire application as a logical group. It's two child views, *contacts-list-search* and *contact-detail* wrap together the search and list functionality, and the contact detail pane respectively. The children of *contacts-list-search* contain their logic sections as well, *search-field* handling the HTML input field, and the *contacts-list* wrapping a list of individual contact list items.

We begin to see how the tree structure allows us flexibility, to swap components and their decendents in and out. This may seem like overkill, and it probably is for this simple example, but as we'll see soon, it will illustrate that as applications become more complex, having reusable components such as lists and fields become more valuable.

To recap, we have an *contacts-app* view, a *contacts-search-list* view, a *search-field* view, a *contacts-list* view, and a *contact-detail* view. They are organized in the following hierarchy:

- contacts-app
   - contacts-search-list
      - search-field
      - contacts-list
- contact-detail

Now that we have our views organized, we need to discuss interactivity. How do we make our views interactive with Javascript without creating spaghetti code.

It is clear that the *search-field* will need to filter the *contacts-list* when the enter key is pressed. The *contacts-list* will need to tell the *contact-detail* pane to display a specific contact when it's selected from the list. 

These are fairly simple interactions, however it is quite easy to write messy, coupled code as the complexity of single page apps such as this expand. Particularly when nested callbacks get out of control or when there is no longer a transparent way to see how events are being bound and unbound, its easy to leak memory, create bugs, and altogether write unmaintainable code. This is where we begin to involve **View Controllers**.

### Step 2: Taming Code with Controllers

OrangeUI's *View Controller* class acts as both a helper in the lifecycle of each of your applications views, and as a scaffold to enforce coding best practices. Those `data-control` attributes we added earlier, each of those corresponds to a view controller. We've managed to logically separate our views, now we're logically separating our interaction logic as well. 

Let's take a look at the five different views we created in the previous step, and now make their associated controllers. Just as we traced out the hierarchy of our views within the DOM, we do the same for our controllers. In fact, when our application is initialized, a tree of view controllers instances is built to exactly match that of our DOM view hierarchy. The five associated view controllers would be initialized as follows,

- ContactsAppController
   - ContactsSearchListController
      - SearchFieldController
      - ContactsListController
- ContactDetailController

matching that of each view. Each view controller instance and each view controller have a one-to-one relationship. The section of the DOM represented by the view will be managed and manipulated only my this one view controller. Now let's define these view controller classes. When the page is first loaded, an instance of each class is instantiated as OrangeUI traverses down the DOM tree, reading off each `data-control` attribute. We therefore can use each of these `data-control` attributes multiple times, (ie. two `data-control="search-field`'s on one page if we wanted). 

Let's define the **ContactSearchListController** as an example.

```js
var ContactsSearchListController = ViewController.extend({
	getType: function() {
		return 'contacts-search-list';
	}
});
```

That's it. We've defined our first view controller. The only required method on the view controller to implement is the `getType()` method, which returns a string matching the name of the view we defined earlier. When OrangeUI traverses down the DOM tree looking for `data-control` attributes, it reads off each attribute and looks to see if there is an associated View Controller defined whose `getType()` method it matches. If there is, it instantiates an instance of the that view controller, and then moves on to its immediate children repeating the process until it can't find any more views.

*Additionally, it converts the `data-control` attribute to a class name, so that adding a redundant class is unnecessary.*

For the moment our view controller doesn't do anything; we haven't added any methods to it yet. To add functionality to a controller, the **SearchFieldController** for example, we simply begin to implement existing methods or add new methods to the controller class. Remember we want the `<input data-control="search-field" />` view to search our list when the user types something and hits enter. To do that, we'll add an event listener to that DOM element to listen for key presses.

```js
var SearchFieldController = ViewController.extend({
	getType: function() {
		return 'search-field';
	}
	onDidAppear: function(e) {
		this.target.on('keypress', this.onKeyPress, this);
	},
	onWillDisappear: function(e) {
		this.target.off();
	},
	onKeyPress: function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code === 13) {
			var keyword = this.target.val();
			this.fire('search', keyword);
		}
	}
});
```

Let's step through this code method by method. First, the **ViewController** class gives you access to the `this.target` instance variable, which stores a reference to the view controller's associated view element. As OrangeUI traversed down the DOM tree, it passed references to each of the `data-control` DOM elements into each view controller instance it created. For the **SearchFieldController**, the `this.target` variable references the DOM element:

```html
<input data-control="search-field" type="search" name="keyword" />
```

The `this.target` enforces rule #2, "One controller instance can manage one view." In this case, the target is the search field itself. The view controller only has access to that part of the DOM, nothing more.

The **ViewController** class also allows us to implement the following methods that manage the view lifecycle.

* willLoad()
* didLoad()
* willAppear()
* didAppear()
* willDisappear()
* didDisappear()
* willUnload()
* didUnload()

These methods allow you to precisely interact with the DOM to bind and unbind events. In our case, we've retrieved the view controller's target (which corresponds to the search field) and bound a `keypress` event to it in the `onDidAppear()` method. We've added a `onKeyPress()` event handler method to the controller, and passed it into the event binding to handle the `keypress` event. Finally, we've unbound the event in the `onWillDisappear()` method, enforcing our Rule #5: "Never bind an event, without unbinding it later."

We now have a controller that binds a `keypress` event to an input field. How now are we handling the actual keypress. The handler checks the keycode of the keyPress for the enter key. When the enter key is pressed, it fetches the value of the search field (the target) with  

```js
var keyword = this.target.val();
```

And then fires a new custom event, **search** with the keyword variable as its payload.

```js
this.fire('search', keyword);
```

We'll talk about this in a moment. For now, we have a view controller that simply fires a 'search' event with the keyword that it wants to search.

Let's move up the hierarchy now to the parent of the **SearchFieldController**, the **ContactsSearchListController**. This view controller corresponds to the view containing both `search-field` and `contact-list`, its children. We can write this controller in the same way we've written the prior.

```js
var ContactsSearchListController = ViewController.extend({
	getType: function() {
		return 'contacts-search-list';
	}
	onDidAppear: function(e) {
		this.getView('contact-keyword').on('search', this.onSearch, this);
	},
	onWillDisappear: function(e) {
		this.getView('contact-keyword').off();
	},
	onSearch: function(e, data) {
		console.log(data);
	}
});
```

We've used a few new methods in the above code. This controller looks very similar to the prior, however we've used the `getView` method and passed in the value *contact-keyword*. We'll step back for a moment to the view to explain this.

-------------------------

The goal of OrangeUI is decoupling and reusable components. Up until now our app is too simple to reuse anything. Taking a look at the prior code, we see that we now have added another attribute along with the `data-control` attributes, `data-name`.

```html
<body>
	<section data-control="contacts-app" data-name="contacts-app">
		<div data-control="contacts-search-list" data-name="contacts-search-list">
			<input data-control="search-field" data-name="contact-keyword" type="search" name="keyword" />
			<ul data-control="contacts-list" data-name="contacts-list">
				<!-- individual contacts go here -->
			</ul>
		</div>
		<div data-control="contact-detail" data-name="contact-detail">
			<!-- details go here -->
		</div>
	</section>
</body>
```

The attribute `data-name` is to the instance, what `data-control` was to the class. In other words, `data-name` allows us to uniquely identify views by name, when we use a `data-control` multiple times. In our case these appear to be redundant, can for simplicity, when they are omitted they fall back to the same value as `data-control`. With them omitted, the views become the following:

```html
<body>
	<section data-control="contacts-app">
		<div data-control="contacts-search-list">
			<input data-control="search-field" data-name="contact-keyword" type="search" name="keyword" />
			<ul data-control="contacts-list">
				<!-- individual contacts go here -->
			</ul>
		</div>
		<div data-control="contact-detail">
			<!-- details go here -->
		</div>
	</section>
</body>
```

Getting back to our use of *contact-keyword*, we can now see that the `data-name` attribute on the search field is set to *contact-keyword*, our unique identifier should two search fields be used in the same view. The **ViewController** class gives us a `getView()` method, which returns the child view controller corresponding to the view with a given `data-name` attribute. In our case, calling

```js
this.getView('contact-keyword').on('search', this.onSearch, this);
```

in the ContactSearchListController first, gets the child view controller with the name *contact-keyword*, and then proceeds to bind a listener for the custom event 'search'. It passes a custom event handler, the `this.onSearch` method in to handle the event.

Let's take a moment to talk about events. Every view controller gives you the ability to bind, fire, and detach events. Just as you would bind an event to an input field or a button, you can bind custom handlers to events on a view controller. The view controller includes the following methods for event binding:

* on(event, handler, [context])
* fire(event, [payload])
* detach([event], [handler]);

The `on()` method takes in an optional third parameter to proxy the handler with (similar to jQuery's $.proxy()). The fire method takes in a data payload: an object to be passed to all callbacks bound to that event.

Any callback bound to an event receives to parameters, `e` the event object, and `data` the payload passed when the event was fired.

In our case, we remember that the **SearchFieldController** fired an event *search* with a payload of the keyword that was in the search field. What we've done is had **ContactsSearchListController** listen for the *search* event to be fired by the SearchFieldController. When that happens, the `onSearch()` event handler is called, and passed the keyword to search on. For the moment we're printing it to the console.

### Step 3: Communicating between views

We've now bound an event to the search field to listen for the press of the enter key, fired a custom event up the parent view controller, and listened for and handled that custom event. For the moment we're simply printing the keyword passed by the event to the console. The final step is to build the list controller and have it filter when that keyword is pressed. We first define our **ContactsListController** with the following.

```js
var ContactsListController = ViewController.extend({
	getType: function() {
		return 'contacts-list'
	},
	filter: function(keyword) {
		var pattern = new RegExp(keyword, 'i');
		this.target.find('li').each(function() {
			var text = $(this).text();
			if (!pattern.test(text)) { $(this).addClass('hidden'); }
			else { $(this).removeClass('hidden'); }
		});
	}
});
```

All we've added to the contacts list controller is a method called `filter()`, which takes in a keyword and attempts to filter out the `<li>` elements whose body text doesn't match that keyword.

We also then modify our original **ContactsSearchListController**, updating the `onSearch()` event handler to use this new method. We replace our console statement with

```js
	this.getView('contacts-list').filter(data);
```

which retrieves the **ContactsListController** and calls the new filter method we just created on it, hiding and showing the `<li>` rows appropriately. The keyword is passed to the event handler via the payload, which we set when calling `this.fire('search', keyword)`. We have effectively built three controllers to manage three views, handling searching, list filtering, and tying the two views together.

### Step 4: Abstracting components

Up until this point, it may seem as if the overhead of extra time and code is not worth the effort of decoupling components. The benefit comes only when we look at more complex applications.

Let's take the perspective that this is only one section of a multi-section application where managing contacts is only a minor feature. This application may require the use of filterable lists on several pages, each list populated with different kinds of data. We may even see this list / detail-view pattern repeat on multiple pages. We can spend some time abstracting components from what we just created, to make them reusable in other parts of the application. 

Starting again with the views, we can abstract away the contacts specific naming and conventions to end up with the following

```html
<body>
	<section data-control="contacts-app">
		<div data-control="searchable-list">
			<input data-control="search-field" type="search" name="keyword" />
			<ul data-control="item-list">
				<!-- individual items go here -->
			</ul>
		</div>
		<div data-control="contact-detail">
			<!-- details go here -->
		</div>
	</section>
</body>
```

We see we haven't really changed the markup much, only renamed some components to make it more reusable. Now we can implement our reusable view controllers. We can even go a step further and abstract our search field into a simple text field, since our controller doesn't care one way or another if our field is a `<input type="search" />` or a `<input type="text" />`.

The **ViewController** class gives us another helper function to clean our code of repetitive behaviors. Implementing the `getBindings()` method to return a JSON object of event bindings requires us to no longer override the `onDidAppear()` and `onWillDisappear()` methods. This method should return an object keyed by either the *data-name* or selector of the view/element to be bound to, and the event names to be bound. Passing true as a value to an event key will automatically search for a method on the class in the form `onBlank()`. Instead, passing a string of the actual callback name can be done for custom named callbacks. Additionally, the 'target' selector will match the `this.target` object itself.

```js
var InputFieldController = ViewController.extend({
	getType: function() {
		return 'input-field'
	},
	getBindings: function() {
		return { 'target': { keypress: true } }
	},
	onKeyPress: function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code === 13) {
			var keyword = this.target.val();
			this.fire('enter', keyword);
		}
	}
});
```

```js
var SearchableListController = ViewController.extend({
	getType: function() {
		return 'searchable-list'
	},
	getBindings: function() {
		return { 'input-field': { 'enter': 'onSearch' } }
	},
	onSearch: function(e, data) {
		this.getView('list').filter(data);
	}
});
```

```js
var ListController = ViewController.extend({
	getType: function() {
		return 'item-list'
	},
	filter: function(keyword) {
		var pattern = new RegExp(keyword, 'i');
		this.target.find('li').each(function() {
			var text = $(this).text();
			if (!pattern.test(text)) { $(this).addClass('hidden'); }
			else { $(this).removeClass('hidden'); }
		});
	}
});
```

We now have an **InputFieldController**, **ListController**, and **SearchableListController** which all can be reused. Notice however that the **SearchableListController** is still dependent on the other two controllers, and is therefore coupled to their implementation. Specifically, it must have prior knowledge that there will be two child views of type *list* and *input-field*. We assume that this level of coupling is appropriate, because our controller is tied only to the interface of the two components, not the components themselves. For example, someone could write a custom *ListController* themselves that includes `set()` and `get()` methods and include it in the view as follows

```js
var MutableListController = ListController.extend({
	getType: function() {
		return 'mutable-list'
	},
	set: function(data) {
		var li = document.createElement('li');
		li.innerHTML = data;
		this.target.append(li)
	},	
	clear: function() {
		tis.target.find('li').remove();
	}
});
```

```html
<body>
	<section data-control="contacts-app">
		<div data-control="searchable-list">
			<input data-control="search-field" type="search" name="keyword" />
			<ul data-control="mutable-list" data-name="list">
				<!-- individual items go here -->
			</ul>
		</div>
		<div data-control="contact-detail">
			<!-- details go here -->
		</div>
	</section>
</body>
```

As long as the custom **MutableListController** implements the same methods as the **ListController**, there should be no conflicts or changes required to the rest of the code base. We therefore define controllers by the following criteria.

1. What events do they emit?
2. What views to they require?
3. What methods do they implement?

Specifically for the controllers we've already built, here are the critera.

<table>
	<tr>
		<th>Controller</th>
		<th>Events</th>
		<th>Views</th>
		<th>Methods</th>
	</tr>
	<tr>
		<td>InputFieldController</td>
		<td>enter</td>
		<td>-</td>
		<td>-</td>
	</tr>
	<tr>
		<td>SearchableListController</td>
		<td>-</td>
		<td>search-field, list</td>
		<td>-</td>
	</tr>
	<tr>
		<td>ListController</td>
		<td>-</td>
		<td>-</td>
		<td>filter</td>
	</tr>
	<tr>
		<td>MutableListController*</td>
		<td>-</td>
		<td>-</td>
		<td>filter, set, clear</td>
	</tr>
</table>

The UI module of OrangeUI provides base implementations of many of these views, <a href="#">see them here.</a>

### Step 6: Finishing touches

We've managed to put together the left side of a simple contacts application. To finish it off, we'll build two more controllers, our overall application controller, the **ContactsAppController**, and our controller to manage displaying the contact details, **ContactDetailController**. For the moment we'll hold of taking about how to connect this to a webservice and rely on mock data. First we'll write out our final view markup.

```html
<body>
	<section data-control="contacts-app">
		<div data-control="searchable-list">
			<input data-control="search-field" type="search" name="keyword" />
			<ul data-control="list"></ul>
		</div>
		<div data-control="contact-detail">
			<span class="first-name"></span>
			<span class="last-name"></span>
			<span class="phone"></span>
		</div>
	</section>
</body>
```

and then our controllers to match the view.

```js
var ContactsAppController = ViewController.extend({
	getType: function() {
		return 'contacts-app'
	},
	getBindings: function() {
		'searchable-list': { 'select': true; }}
	},
	onDidAppear: function() {
		
		// our mock data
		var contacts = {
			1: { firstName: 'John', lastName: 'D', phone: '333-4411' },
			2: { firstName: 'Jack', lastName: 'S', phone: '543-2344' },
			3: { firstName: 'Steph', lastName: 'Y', phone: '342-1222' },
			4: { firstName: 'Kevin', lastName: 'K', phone: '523-2141' }
		};

		// pass to the list
		this.getView('searchable-list').setData(contacts);

	},
	onSelect: function(e, data) {
		this.getView('contact-detail').setData(data);
	}
});
```

```js
var SearchableListController = ViewController.extend({
	getType: function() {
		return 'searchable-list'
	},
	getBindings: function() {
		return { 'input-field': { 'enter': 'onSearch' } }
	},
	setData: function(data) {
		this.getView('list').setData(data);
	},
	onSearch: function(e, data) {
		this.getView('list').filter(data);
	}
});
```

```js
var ListController = ListController.extend({
	getType: function() {
		return 'mutable-list'
	},
	getBindings: function() {
		return { 'li': { 'click': 'onSelect' }}
	}
	setData: function(data) {
		this.data = data;
		for (var i in data) {
			var li = document.createElement('li');
			li.id = i;
			li.innerHTML = data[i].firstName + ' ' + data[i].lastName;
			this.target.append(li);
		}
	},
	onSelect: function(e) {
		var id = $(this).attr('id');
		this.fire('select', this.data[i]);
	}
});
```

```js
var ContactDetailController = ViewController.extend({
	getType: function() {
		return 'contact-detail'
	},
	setContact: function(data) {
		this.target.find('first-name').text(data.firstName);
		this.target.find('last-name').text(data.lastName);
		this.target.find('phone').text(data.phone);
	}
});
```

We've added a *select* event to the list and passed our mock data to the populate the list items. When the user clicks on an `<li>` item the *select* event is fired with a payload of the contact object. This propagates up the hierarchy until it reaches the **ContactsAppController**. When that controller hears the *select* event it passes the payload data to the **ContactDetailController**, which renders it in the view.