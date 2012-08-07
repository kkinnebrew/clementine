# MVC

The MVC module provides a Model-ViewController-View structure that sits on top of the Commons module. Included are tools allowing for structuring of UI view fragments, reusable extendable controllers, live data bindings with HTML5 Micro Data, as well as model persistence using localStorage.

## Documentation

### Application

* [initialize()](#app-initialize)
* [launch()](#app-launch)
* [isOnline()](#app-is-online)
* [setState()](#app-set-state)
* [getState()](#app-get-state)

**includes the Events mixin*

### Binding

* [initialize()](#binding-initialize)
* [bindModel()](#binding-bind-model)
* [bindCollection()](#binding-bind-collection)
* [clear()](#binding-clear)
* [destroy()](#binding-destroy)

### Collection

* [initialize()](#collection-initialize)
* [get()](#collection-get)
* [filter()](#collection-filter)
* [unfilter()](#collection-unfilter)
* [sort()](#collection-sort)
* [clear()](#collection-clear)
* [count()](#collection-count)
* [getModel()](#collection-get-model)
* [toArray()](#collection-to-array)
* [toObject()](#collection-to-object)
* [destroy()](#collection-destroy)

### Form

* [initialize()](#form-initialize)
* [get()](#form-get)
* [set()](#form-set)
* [clear()](#form-clear)
* [setData()](#form-set-data)
* [getData()](#form-get-data)
* [destroy()](#form-destroy)

### Model

**Class Methods**

* [extend()](#model-class-extend)
* [getAll()](#model-class-get-all)
* [get()](#model-class-get)
* [set()](#model-class-set)
* [remove()](#model-class-remove)

**Instance Methods**

* [initialize()](#model-initialize)
* [getId()](#model-get-id)
* [getModel()](#model-get-model)
* [get()](#model-get)
* [set()](#model-set)
* [clear()](#model-clear)
* [refresh()](#model-refresh)
* [save()](#model-save)
* [remove()](#model-remove)
* [isSaved()](#model-is-saved)
* [toObject()](#model-to-object)
* [destroy()](#model-destroy)

**includes the Events mixin*

### Source

* [initialize()](#source-initialize)
* [getName()](#source-get-name)
* [supportsModels()](#source-supports-models)
* [isPersistent()](#source-is-persistent)
* [destroy()](#source-destroy)

### View

* [load()](#view-load)

### ViewController

**Class Methods**

* [extend()](#view-controller-class-extend)

**Instance Methods**

* [initialize()](#view-controller-initialize)
* [load()](#view-controller-load)
* [unload()](#view-controller-unload)
* [show()](#view-controller-show)
* [hide()](#view-controller-hide)
* [setState()](#view-controller-set-state)
* [getState()](#view-controller-get-state)
* [getParent()](#view-controller-get-parent)
* [getViews()](#view-controller-get-views)
* [getView()](#view-controller-get-view)
* [getForms()](#view-controller-get-forms)
* [getForm()](#view-controller-get-form)
* [getElement()](#view-controller-get-element)
* [hasView()](#view-controller-has-view)
* [hasForm()](#view-controller-has-form)
* [hasElement()](#view-controller-has-element)
* [addViewController()](#view-controller-add-view-controller)
* [removeViewController()](#view-controller-remove-view-controller)
* [find()](#view-controller-lookup)
* [destroy()](#view-controller-destroy)

**includes the Events mixin*