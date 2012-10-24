/**
 * Copyright (c) 2010-12 ClementineJS

 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

Clementine.add('ui', function(exports) {
  
  // @region Declarations
  
  var ModalViewController;
  var MultiViewController;
  var NavigationController;
  
  // @region Dependencies
  
  var ViewController = Clementine.ViewController;
  
  
  // @region Controller Definitions
	
	/**
	 @class ModalViewController
	 @extends ViewController
	 */
  ModalViewController = ViewController.extend({
    
    // @region Configuration
    
    getType: function() {
      return 'modal-view';
    },
    
    
    // @region Public Methods
    
    presentModalView: function() {
      return this.add(this._presentModalView, arguments);
    },
    
    _presentModalView: function(callback, context) {
      
      if (this.modalVisible) {
        this.next();
        return;
      }
            
      $('body').append(this._target);
      
      // show children
      for (var i in this._views) {
        this._views[i].load().show();
      }
      
      setTimeout(proxy(function() {
        this._target.addClass('visible');
        setTimeout(proxy(function() {
          this.modalVisible = true;
          if (callback) {
            callback.call(context || this);
          }
          this.next();
        }, this), 300);
      }, this), 50);
      
    },
    
    dismissModalView: function() {
      return this.add(this._dismissModalView, arguments);
    },
    
    _dismissModalView: function(callback, context) {
      if (!this.modalVisible) {
        this.next();
        return;
      }
      this._target.removeClass('visible');
      setTimeout(proxy(function() {
        this._target.remove();
        
        // hide children
        // show children
        for (var i in this._views) {
          this._views[i].hide().unload();
        }
        this.modalVisible = false;
        if (callback) {
          callback.call(context || this);
        }
        this.next();
      }, this), 300);
    },
      
    // @region State Handlers
    
    onLoad: function() {
      this.fire('_loaded');
    },
    
    onAppear: function() {
      this.fire('_appeared');
    },
    
    onDisappear: function() {
      this.fire('_disappeared');
    },
    
    onUnload: function() {
      this.fire('_unloaded');
    }
      
  });
  

	/**
	 @class MultiViewController
	 @extends ViewController
	 */
  MultiViewController = ViewController.extend({
    
    // @region Configuration
    
    getType: function() {
      return 'multi-view';
    },
    
    setup: function() {
      
      var view = this.target.attr('data-default');
      if (this.hasView(view)) {
        this.activeView = this.getView(view);
        this.activeName = view;
        this.target.removeAttr('data-default');
      }
      
      this._super();
      
    },
    
    
    // @region Public Methods
    
    activateView: function(name, ttl) {
  
      if (!this.hasView(name)) {
        throw 'View does not exist';
      }
              
      if (this.activeView === this.getView(name) && this.activeView) {
        return;
      }
      
      this.activeName = name;
  
      function swapViews() {
  
        // hide old view
        this.activeView.hide();
        this.activeView.unload();
  
        this.activeView = this.getView(name);
  
        // show new view
        this.activeView.load();
        this.activeView.show();
  
      }
  
      if (ttl) {
        setTimeout(proxy(function() {
          swapViews.call(this);
        }, this), ttl);
      } else {
        swapViews.call(this);
      }
  
    },
  
  
    // @region State Handlers
  
    onLoad: function() {
      this.activeView.load();
      this.fire("_loaded");
    },
  
    onAppear: function() {
      this.activeView.show();
      this.target.removeClass("hidden");
      this.fire("_appeared");
    },
  
    onDisappear: function() {
      this.activeView.hide();
      this.fire("_disappeared");
    },
  
    onUnload: function() {
      this.activeView.unload();
      this.fire("_unloaded");
    }
  
  });
  
  
  /**
   @class NavigationController
   @extends ViewController
   */
  NavigationController = ViewController.extend({
        
    // @region Configuration
    
    getType: function() {
      return 'navigation-view';
    },
  
    
    // @region Public Methods
    
    popView: function() {
      return this.add(this._popView, arguments);
    },
    
    _popView: function(duration, callback, context) {
      
      // return if animating
      if (this.animating || this.viewStack.length < 2) {
        this.next();
        return false;
      }
      
      // mark animating
      this.animating = true;
      
      // pop from view stack
      var current = this.activeView;
      
      // unload active view
      current._target.addClass('preload').removeClass('active');
      
      // pop from view stack
      this.viewStack.pop();
      
      // get prior view
      var prior = this.viewStack.last();
      
      // load prior view
      prior._target.addClass('active').removeClass('unload');
      prior.show();
      
      // set new active view
      this.activeView = this.viewStack.last();

      // mark not animating
      setTimeout(proxy(function() {
        current.hide().unload();
        this.animating = false;
        if (callback) {
          callback.call(context || this);
        }
        this.next();
      }, this), (duration !== undefined ? (duration + 200) : (300 + 200)));
      
      return true;
          
    },
    
    pushView: function() {
      return this.add(this._pushView, arguments);
    },
    
    _pushView: function(view, duration, callback, context) {
      
      // return if animating
      if (this.animating) {
        this.next();
        return false;
      }
      
      console.log('Pushing: ' + view);
      
      // mark animating
      this.animating = true;
      
      // get active view
      var active = this.activeView;
      
      // animate in
      this.getView(view).load().show().run(function() {
        this.getView(view)._target.addClass('active').removeClass('preload');
        active._target.addClass('unload').removeClass('active');
      }, this, 100);

      // set new active view
      this.activeView = this.getView(view);
      
      // push on view stack
      this.viewStack.push(this.getView(view));
      
      // stop animating
      setTimeout(proxy(function() {
        
        // hide children
        active.hide();
        
        // mark not animating
        this.animating = false;
        
        // execute callback
        if (callback) {
          callback.call(context || this);
        }
        
        this.next();
        
      }, this), (duration !== undefined ? (duration === 0 ? duration : (duration + 200)) : (300 + 200)));
      
      return true;
      
    },
    
    popToRootView: function() {
      return this.add(this._popToRootView, arguments);
    },
    
    _popToRootView: function(duration, callback, context) {
            
      // return if animating
      if (this.animating || this.viewStack.length < 2) {
        this.next();
        return false;
      }
            
      // mark animating
      this.animating = true;

      // clear the view stack
      for (var i = 1; i < this.viewStack.length-1; i++) {
        this.viewStack[i].unload();
        this.viewStack[i]._target.removeClass('unload').addClass('preload');
      }
      
      // pop from view stack
      var current = this.activeView;
      
      // unload active view
      current._target.addClass('preload').removeClass('active');
      
      // get prior view
      var prior = this.viewStack[0];
      
      // load prior view
      prior._target.addClass('active').removeClass('unload');
      prior.show();
      
      // set new active view
      this.activeView = prior;
      
      // update view stack
      this.viewStack = [this.activeView];

      // mark not animating
      setTimeout(proxy(function() {
        current.hide().unload();
        this.animating = false;
        if (callback) {
          callback.call(context || this);
        }
        this.next();
      }, this), (duration !== undefined ? (duration+200) : (300+200)));
      
      return true;
    
    },
    
    
    // @region State Handlers
    
    onLoad: function() {
      
      // setup vars
      this.activeView = null;
      this.viewStack = [];
            
      // load specific views
      var view = this.attr('default');
      
      if (!this.hasView(view)) {
        throw 'Default View Not Found for "' + this.attr('name') + '"';
      }
      
      // load view
      for (var i in this._views) {
        if (this._views[i].attr('overlay')) {
          this._views[i].load();
          continue;
        }
        if (this._views[i].attr('name') === view) {
          this.getView(view)._target.addClass('active');
          this.getView(view).load();
          this.activeView = this.getView(view);
          this.viewStack = [this.activeView];
        } else {
          this._views[i]._target.removeClass('hidden').addClass('preload');
        }
      }
      
      // call super
      this.fire('_loaded');
      
    },

    onAppear: function() {
        
      // get default view
      var view = this.attr('default');

      // show view
      this.activeView.show();
      
      for (var i in this._views) {
        if (this._views[i].attr('overlay')) {
          this._views[i].show();
        }
      }
      
      // remove animating class
      setTimeout(proxy(function() {
        this._target.addClass('animated');
      }, this), 1000);
            
      // call super
      this.fire('_appeared');
    
    },
    
    onDisappear: function() {
      
      // hide views
      for (var i = 0; i < this.viewStack.length; i++) {
        this.viewStack[i].hide();
      }
      
      for (var i in this._views) {
        if (this._views[i].attr('overlay')) {
          this._views[i].hide();
        }
      }
      
      this._target.addClass("hidden");
      
      // fire appeared event
      this.fire('_disappeared');
    
    },
    
    onUnload: function() {
      
      // load specific views
      var view = this.attr('default');
      
      // unload stack
      for (var i = 0; i < this.viewStack.length; i++) {
        this.viewStack[i].unload();
      }
      
      // unload view
      for (var j in this._views) {
        if (this._views[j].attr('overlay')) {
          this._views[j].unload();
          continue;
        }
        this._views[j]._target.removeClass('unload').removeClass('active').addClass('preload');
      }
            
      // set active view
      this.activeView = this.getView(view);
      
      // clear the stack
      this.viewStack = [this.activeView];
      
      // fire unload
      this.fire('_unloaded');
    
    }
    
  });
  
  
  // @region Exports
  
  exports.MultiViewController   = MultiViewController;
  exports.NavigationController  = NavigationController;
  exports.ModalViewController   = ModalViewController;  

}, []);