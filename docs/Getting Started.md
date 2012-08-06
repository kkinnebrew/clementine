# Getting Started

## View Controller Architecture

The architecture of OrangeUI attempts to emulate the hierarchical structure of the DOM via View Controllers while decoupling code components so they can be reused. It uses the subscriber pattern to manage communication between view controllers, where individual view controllers in the hierarchy manage only their children.

**Principles**

1. Controller and view hierarchies match one-to-one
2. One controller instance can manage one view
3. Controllers only call methods on their children
4. Controllers fire events up to their parents
5. Never bind an event, without unbinding it later

## Example

Suppose we're building a simple address book web app. We want to have a searchable list of contacts on the left, and a detail view for the contact that's currently selected on the right. How would we structure the application?

### Step One: Start with your views

We first want to outline our view structure in HTML. We know the basic components of what our views will look like already, even though we haven't ironed out the details. Traditionally we might start with something like this.

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

This works fine, but imagine we have several other future features of this app (managing a list of todo's perhaps) that follow a similar pattern (searchable list on the left, details on the right.) We would want to reuse those components.

Following the conventions of OrangeUI we would break the above HTML into its logical components. In principle, each component should have only one function, they should not be coupled together. OrangeUI denotes each logical section with the `data-control` attribute. This attribute will ultimately correspond to the Javascript controller that manages it.

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

We've now broken everything into a logical hierarchy of components. The control `contacts` wraps the entire application. The `contacts-search-list` wraps the searchable list. The `contacts-list` wraps the list of contact items. The `contact-detail` wraps the detail pane holding information about the contact.

Now this may seem like overkill at the moment, and it probably is for this simple example, but as we'll see soon, it illustrates that as applications become more complex, having reusable components such as lists will become very valuable.

To recap, we have an **contacts-app** control, a **contacts-search-list** control, a **contacts-list** control, and a **contact-detail** control. They are organized in the following hierarchy:

- contacts-app
   - contacts-search-list
      - search-field
      - contacts-list
- contact-detail

Now let's talk about interaction. We can see fairly quickly that the search field will some how need to tell the list to update when a keyword is typed. The contacts-list will need to tell contact-detail to update its values when an item in the list is clicked. The complexity of single page apps appear when we begin to handle interaction. This is where we begin to involve **View Controllers**.

### Step Two: View Controllers

For every view (a data-control element) there needs to be an associated view controller. We created five different views in our HTML for the prior example, let's now make their associated controllers.

The idea of a hierarchy of view controllers is that they match one-to-one with the structure of the DOM. Just as we saw the hierarchy of the views we built:

- contacts-app
   - contacts-search-list
      - search-field
      - contacts-list
- contact-detail

their associated controllers should follow the same pattern. How do we do this? We build five associated controllers to match these views:

- ContactsAppController
   - ContactsSearchListController
      - SearchFieldController
      - ContactsListController
- ContactDetailController

You can see that this follows the same hierarchy as the views above. How do we define these controllers in Javascript? Let's define the **ContactSearchListController** as an example.

```js
var ContactsSearchListController = ViewController.extend({
	getType: function() {
		return 'contacts-search-list';
	}
});
```

That's it. We've defined our first view controller. The only required method on the view controller is the `getType()` method, which returns a string matching the name of the view we defined earlier. When OrangeUI parses the DOM, it reads off each `data-control` attribute and looks to see if there is an associated View Controller with a `getType()` string that matches. If there is, it instantiates an instance of the that view controller, and then moves on to its immediate children repeating the process.

For the moment our view controller doesn't do anything. Let's add some functionality to one of them. Take the **SearchFieldController**. Remember we want it to search our list when the user types something and hits enter. To do that, we need to write the following.

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

Let's step through this code method by method. The **ViewController** class gives you access to the `this.target`, which stores a reference to the DOM element of the view. In this case, the `this.target` is equal to the DOM element

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

These methods allow you to precisely interact with the DOM to bind and unbind events. In our case, we've retrieved the view controller's target (which corresponds to the search field) and bound a `keypress` event to it in the `didAppear()` method. We've added a `onKeyPress()` event handler method to the controller, and passed it into the event binding to handle the `keypress` event. Finally, we've unbound the event in the `willDisappear()` method, enforcing our Rule #5: "Never bind an event, without unbinding it later."

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

### Step Three: Communicating between views
