# MVC

The MVC module provides a Model-ViewController-View structure that sits on top of the Commons module. Included are tools allowing for structuring of UI view fragments, reusable extendable controllers, live data bindings with HTML5 Micro Data, as well as model persistence using localStorage.

## Documentation

### Application

* [initialize()](#app-initialize)
* [setEnvironment()](#app-set-environment)
* [setLogging()](#app-set-logging)
* [getService()](#app-get-service)
* [registerService()](#app-register-service)
* [registerViews()](#app-register-views)
* [setAuthentication()](#app-set-authentication)
* [launch()](#app-launch)

### AuthService

* [authenticate()](#auth-service-authenticate)

### Binding

* [initialize()](#binding-initialize)
* [bind()](#binding-bind)
* [unbind()](#binding-unbind)
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
* [disable()](#form-disable)
* [enable()](#form-enable)
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

### Service

* [initialize()](#source-initialize)
* [goOnline()](#source-go-online)
* [goOffline()](#source-go-offline)
* [destroy()](#source-destroy)

### View

* [load()](#view-load)
* [get()](#view-get)

### ViewController

**Class Methods**

* [extend()](#view-controller-class-extend)
* [get()](#view-controller-class-get)

**Instance Methods**

* [initialize()](#view-controller-initialize)
* [getType()](#view-controller-get-type)
* [getBindings()](#view-controller-get-bindings)
* [getRoutes()](#view-controller-get-routes)
* [setRoute()](#view-controller-set-route)
* [setState()](#view-controller-set-state)
* [getState()](#view-controller-get-state)
* [hasState()](#view-controller-has-state)
* [load()](#view-controller-load)
* [show()](#view-controller-show)
* [hide()](#view-controller-hide)
* [unload()](#view-controller-unload)
* [getViews()](#view-controller-get-views)
* [getView()](#view-controller-get-view)
* [getForm()](#view-controller-get-form)
* [getElement()](#view-controller-get-element)
* [addView()](#view-controller-add-view)
* [removeView()](#view-controller-remove-view)
* [hasView()](#view-controller-has-view)
* [hasForm()](#view-controller-has-form)
* [hasElement()](#view-controller-has-element)
* [bind()](#view-controller-bind)
* [unbind()](#view-controller-unbind)
* [goOnline()](#view-controller-go-online)
* [goOffline()](#view-controller-go-offline)
* [destroy()](#view-controller-destroy)

**includes the Events mixin*