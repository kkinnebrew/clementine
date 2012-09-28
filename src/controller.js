// ------------------------------------------------------------------------------------------------
// ViewController Class
// ------------------------------------------------------------------------------------------------

(function(Clementine) {

  var ViewController;
  

  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Binding  = Clementine.Binding;
  var Browser  = Clementine.Browser;
  var View     = Clementine.View;


  // ------------------------------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------------------------------
  
  ViewController = Class.extend({
    initialize: function (q, l) {
        var j = this,
            r = [],
            d = [];
        this.loading = false;
        this.unloading = false;
        this.loaded = false;
        this.visible = false;
        this.appearing = false;
        this.disappearing = false;
        this.changing = false;
        this.loadEvts = [];
        this.unloadEvts = [];
        this.showEvts = [];
        this.hideEvts = [];
        this.views = {};
        this.elements = {};
        this.events = [];
        this.data = {};
        this.params = {};
        this.source = l.clone();
        if (typeof l !== "undefined") {
            this.target = $(l);
            var f = $(l).get(0)
        } else {
            this.target = View.get(this.getDefaultView());
            if(this.target === null) {
              throw "Invalid target"
            }
        }
        this.parent = (typeof q !== "undefined") ? q : null;
        if (this.parent === null) {
            this.target.removeAttr("data-root")
        }
        for (var h = 0, k = f.attributes.length; h < k; h++) {
            if (f.attributes[h].name.match(/data-/)) {
                this.data[f.attributes[h].name.replace(/data-/, "")] = f.attributes[h].value
            }
        }
        var b = function (c) {
            var t = [];
            this.target.find(c).each(function () {
                var u = false,
                    v = $(this).parent();
                while (v.length !== 0 && !u) {
                    if ($(v).not($(j.target)).length === 0) {
                        u = true;
                        break
                    } else {
                        if ($(v).not("[data-control]").length === 0) {
                            u = false;
                            break
                        }
                    }
                    v = $(v).parent()
                }
                if (u) {
                    t.push(this)
                }
            });
            return t
        };
        r = b.call(this, "[data-control]");
        d = b.call(this, "[data-name]:not([data-control])");
        if (!this.data.name) this.data.name = this.data.control;
        console.log(this.data.name + " Initialized");
        for (var h = 0, k = r.length; h < k; h++) {
            var p = $(r[h]),
                e = p.attr("data-name"),
                n = p.attr("data-control"),
                s = p.attr("data-template"),
                o = (typeof s !== "undefined" && s.length > 0);
            if (o) {
                var a = View.get(s);
                p.html($(a).html());
                cloneAttributes(a, p);
                p.removeAttr("data-template")
            }
            var m = ViewController.get(n);
            if (!e) { e = n; }
            this.views[e] = new m(this, p)
        }
        for (var h = 0, k = d.length; h < k; h++) {
            var g = $(d[h]),
                e = g.attr("data-name");
            if (typeof e !== "undefined" && e.length > 0) {
                this.elements[e] = g.removeAttr("data-name").addClass(e)
            }
        }
        this.addClasses();
        this.target.removeAttr("data-control").removeAttr("data-name");
        this.target.addClass("hidden");
        this.type = this.getType();
        this.name = this.data.name;
        this.setup();
    },
    setup: function() {},
    getType: function () {
        return "ui-view"
    },
    getStates: function() {
      return {};
    },
    getDefaultState: function() {
      return null;
    },
    getDefaultView: function() {
      return null;
    },
    setState: function(states) {
      if (!states || states.length === 0) {
        if (this.getDefaultState()) {
          states = [this.getDefaultState()];
        } else {
          states = [];
        }
      }
      var original = states.slice(0);
      var state = states.shift();
      var statesArray = states.slice(0);
      var current = this.state || this.getDefaultState();
      var callbacks = this.getStates();
      if (Object.keys(callbacks).length === 0) {
        for (var i in this.views) {
          this.getView(i).setState(original.slice(0));
        }
        return;
      }
      if (callbacks.hasOwnProperty(state)) {
        callbacks[state].call(this, current, statesArray);
      }
      this.state = state;
    },
    addClasses: function () {
      this.target.addClass(this.target.get(0).className + ' ' + this.types + ' ' + this.data.name);
    },
    getTriggers: function () {
        return []
    },
    getBindings: function () {
        return {}
    },
    load: function () {
        if (this.loading || this.loaded) {
            return
        }
        this.loading = true;
        this.loadEvts.push(this.on("_load", this.onLoad, this));
        this.loadEvts.push(this.on("_loaded", this.onDidLoad, this));
        this.onWillLoad();
        return this
    },
    onWillLoad: function () {
        this.fire("_load")
    },
    onLoad: function () {
        for (var a in this.views) {
            this.views[a].load()
        }
        this.fire("_loaded")
    },
    onDidLoad: function () {
        for (var b = 0, a = this.loadEvts.length; b < a; b++) {
            this.loadEvts[b].detach()
        }
        this.loadEvts = [];
        this.loading = false;
        this.loaded = true;
        this.fire("load")
    },
    unload: function () {
        if (this.unloading || !this.loaded) {
            return
        }
        if (this.visible && !this.disappearing) {
            this.vEvt = this.on("disappear", function (a) {
                this.unload();
                this.vEvt.detach()
            }, this);
            this.hide();
            return
        }
        this.unloadEvts.push(this.on("_unload", this.onUnload, this));
        this.unloadEvts.push(this.on("_unloaded", this.onDidUnload, this));
        this.unloading = true;
        this.onWillUnload();
        return this
    },
    onWillUnload: function () {
        this.fire("_unload")
    },
    onUnload: function () {
        for (var a in this.views) {
            this.views[a].unload()
        }
        //this.target.remove();
        this.fire("_unloaded")
    },
    onDidUnload: function () {
        for (var b = 0, a = this.unloadEvts.length; b < a; b++) {
            this.unloadEvts[b].detach()
        }
        this.unloadEvts = [];
        this.unloading = false;
        this.loaded = false;
        this.fire("unload")
    },
    show: function () {
        if (this.visible || this.appearing) {
            return
        }
        this.appearing = true;
        this.showEvts.push(this.on("_appear", this.onAppear, this));
        this.showEvts.push(this.on("_appeared", this.onDidAppear, this));
        this.onWillAppear();
        return this
    },
    onWillAppear: function () {
        var b = this.getBindings();
        var replaced;
        var matches;
        for (var a in b) {
            var d = b[a];
            for (var f in d) {
                var e = null;
                if (typeof d[f] === "function") { e = d[f]; }
                else if (this.hasOwnProperty(d[f])) { e = this[d[f]]; }
                if (f == "touchclick") {
                    f = (Browser && Browser.touch) ? "touchend" : "click"
                }
                if (e === null) {
                    var c = f.charAt(0).toUpperCase() + f.slice(1);
                    e = (d[f] === true && typeof this["on" + c] === "function") ? this["on" + c] : null
                }
                matches = a.match(/\(.+\)/gi);
                if (a.match(/\$target/)) {
                  if (matches && matches.length > 0) {
                    this.target.on(f, matches.pop().replace(/[()]/g, ''), $.proxy(e, this));
                  } else {
                    this.target.on(f, $.proxy(e, this));
                  }
                } else if (e !== null && this.views.hasOwnProperty(a)) {
                    this.getView(a).on(f, $.proxy(e, this))
                } else if (e !== null) {
                  if (matches && matches.length > 0) {
                    replaced = a.replace(/\(.+\)/gi, '');
                    this.getElement(replaced).on(f, matches.pop().replace(/[()]/g, ''), $.proxy(e, this));
                  } else if (this.elements.hasOwnProperty(a)) {
                    this.getElement(a).on(f, $.proxy(e, this))
                  }
                }
            }
        }
        this.fire("_appear")
    },
    onAppear: function () {
        for (var a in this.views) {
            this.views[a].show()
        }
        this.target.removeClass("hidden");
        this.fire("_appeared")
    },
    onDidAppear: function () {
        for (var b = 0, a = this.showEvts.length; b < a; b++) {
            this.showEvts[b].detach()
        }
        this.showEvts = [];
        this.appearing = false;
        this.visible = true;
        this.fire("appear")
    },
    hide: function () {
        if (!this.visible || this.disappearing) {
            return
        }
        this.disappearing = true;
        this.hideEvts.push(this.on("_disappear", this.onDisappear, this));
        this.hideEvts.push(this.on("_disappeared", this.onDidDisappear, this));
        this.onWillDisappear();
        return this
    },
    onWillDisappear: function () {
        for (var a in this.views) {
            this.getView(a).detach()
        }
        for (var b in this.elements) {
            this.getElement(b).unbind()
        }
        this.fire("_disappear")
    },
    onDisappear: function () {
        this.target.addClass("hidden");
        for (var a in this.views) {
            this.views[a].hide()
        }
        this.fire("_disappeared")
    },
    onDidDisappear: function () {
        for (var b = 0, a = this.hideEvts.length; b < a; b++) {
            this.hideEvts[b].detach()
        }
        this.hideEvts = [];
        this.disappearing = false;
        this.visible = false;
        this.fire("disappear")
    },
    getView: function (a) {
        if (a instanceof ViewController) {
            return a
        } else {
            if (typeof this.views[a] !== "undefined") {
                return this.views[a]
            }
        }
        throw 'Error: View "' + a + '" not found'
    },
    getElement: function (a) {
        if (typeof this.elements[a] !== "undefined") {
            return this.elements[a]
        }
        throw 'Error: Element "' + a + '" not found'
    },
    hasView: function (a) {
        return typeof this.views[a] !== "undefined"
    },
    hasElement: function (a) {
        return typeof this.elements[a] !== "undefined"
    },
    setView: function (b, a) {
        console.log(this);
        if (this.views.hasOwnProperty(b)) {
            throw "View already exists"
        }
        this.views[b] = a
    },
    clearView: function (a) {
        if (this.views.hasOwnProperty(a)) {
            this.views[a].destroy();
            delete this.views[a]
        }
    },
    bindData: function(name, data, multi) {
      var target = (name === '$target') ? this.target : this.getElement(name);
      var children = firstChildren(target, '[itemprop]');
      var prop;
      for (var i=0; i<children.length; i++) {
        prop = children[i].attr('itemprop');
        if (prop) {
          if (children[i].get(0).tagName === 'IMG') {
            if (data.hasOwnProperty(prop)) {
              children[i].attr('src', data[prop]);
            }
          } else if (children[i].get(0).tagName === 'SELECT' || children[i].get(0).tagName === 'INPUT') {
            if (data.hasOwnProperty(prop)) {
              children[i].val(data[prop]);
            }
          } else {
            if (data.hasOwnProperty(prop)) { children[i].text(data[prop]);
            } else if (!multi) { children[i].text(''); }
          }
        }
      }
    },
    setParam: function(name, value) {
      this.params[name] = value;
    },
    getParam: function(name) {
      return this.params[name];
    },
    clearParam: function(name) {
      delete this.params[name];
    },
    toString: function () {
        return "[" + this.getType() + " " + this.data.name + "]"
    },
    find: function (a) {
        return $(this.target).find(a)
    },
    destroy: function () {
        for (var a in this._views) {
            this.views[a].destroy()
        }
        for (var a in this._elements) {
            delete this.elements[a]
        }
        delete this.target;
        delete this.parent;
    }
  }).include(Events);


  // ------------------------------------------------------------------------------------------------
  // Object Methods
  // ------------------------------------------------------------------------------------------------
  
  ViewController.views = {
    view: ViewController
  };
  
  ViewController.prototype.types = "ui-view ";
  
  ViewController.extend = function(e) {
    var b = Class.extend.call(this, e),
      d = e.getType();
    var f = ["getType"];
    for (var c = 0, a = f.length; c < a; c++) {
      if (!e.hasOwnProperty(f[c])) {
        throw "Class missing '" + f[c] + "()' implementation"
      }
      b[f[c]] = e[f[c]]
    }
    b.prototype.types += d + " ";
    b.extend = arguments.callee;
    return ViewController.views[d] = b
  };
  
  ViewController.get = function(a) {
    if (a == "ui-view") {
      return this
    }
    if (!this.views.hasOwnProperty(a)) {
      throw "View '" + a + '" not found'
    }
    return this.views[a]
  };


  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  Clementine.ViewController = ViewController;


}(Clementine));