/*globals Map: false, List: false*/

// ------------------------------------------------------------------------------------------------
// TickerType Controllers
// ------------------------------------------------------------------------------------------------

Orange.add('tt-controllers', function(exports) {
  
  var BetweenController;
  var ContactsAppController;
  var ContactsListController;
  var NavigationViewController;
  var ModalViewController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies Controllers
  // ------------------------------------------------------------------------------------------------
  
  var ViewController = Orange.ViewController;

  
  // ------------------------------------------------------------------------------------------------
  // Controller Definitions
  // ------------------------------------------------------------------------------------------------
  
  /**
   * @name modal
   */
  ModalViewController = ViewController.extend({
    
    // configuration
    
    getType: function() {
      return 'modal';
    },
    
    setup: function() {
      this.setState('invisible');
    },
    
    // public methods
    
    presentModalView: function() {
      this.add(this._presentModalView);
      return this;
    },
    
    dismissModalView: function() {
      this.add(this._dismissModalView);
      return this;
    },
    
    // private methods
    
    _presentModalView: function() {
      this.append().show().setState('showing', 300).setState('visible');
    },
    
    _dismissModalView: function() {
      this.setState('hiding', 300).setState('invisible').hide().remove();
    }
  
  });
  
  
  /**
   * @name navigation
   */
  NavigationViewController = ViewController.extend({
  
    // configuration
  
    getType: function() {
      return 'navigation';
    },
    
    validate: function() {
    
      if (!this.attr('default')) {
        throw 'ViewController "' + this.attr('name') + '" missing attribute default';
      } else if (!this.getView(this.attr('default'))) {
        throw 'ViewController "' + this.attr('name') + '" missing view "' + this.attr('default') + '"';
      }

    },
    
    setup: function() {
    
      // store active view
      this.active = this.getView(this.attr('default'));
      
      // remove all others
      _.each(this._views, function(view, name) {
        return this.attr('default') !== name ? view.remove() : false;
      });
      
      // build view stack
      this.stack = new List(this.active);
      
      // set animating
      this.animating = false;
      
    },
    
    // state handlers
    
    onLoad: function() {
    
      // load active view
      this.active.load().then(this.fire, '_loaded');
      
    },
    
    onAppear: function() {
      
      // show active view
      this.activeView.show().then(this.fire, '_appeared');
      
    },
    
    onDisappear: function() {
      
      // hide children
      this.stack.deferEach(function(view) {
        return view.hide().promise();
      }).then(function() {
        this.fire('_disappeared');
      });
      
    },
    
    onUnload: function() {
      
      // unload children
      this.stack.deferEach(function(view) {
        return view.unload().promise();
      }).then(function() {
        this.target.remove();
        this.fire('_unloaded');
      });
      
    },
    
    // public methods
    
    pushView: function(name) {
      this.add(this._pushView, [name]);
      return this;
    },
    
    popView: function() {
      this.add(this._popView);
      return this;
    },
    
    popToRootView: function() {
      this.add(this._popToRootView);
      return this;
    },
    
    // private methods
    
    _pushView: function(name) {
      
      if (!this.hasView(name)) {
        throw 'Cannot push view, not found';
      } else if (this.is('animating')) {
        return;
      }

      // set as animating
      this.animating = true;
      
      // check for view
      var invalid = _.reduce(this.stack, function(memo, view) {
        return memo || view.attr('name') === name;
      }, false);
      
      // return if invalid
      if (invalid) {
        console.log("Can't repush view controller");
        return;
      }
      
      function finish() {
      
        // stop animation
        this.animating = false;
        
        // deactivate current view
        this.active = this.getView(name);
        
        // push view stack
        this.stack.push(this.active);
      
      }
      
      function push() {
        
        // activate the new view
        var pushed = this.getView(name).show().setState('loading', 300).setState('active').promise();
        
        // inactivate the old view
        var hidden = this.activeView.setState('inactivating', 300).setState('inactive').hide().promise();
        
        // return deferred
        this.when(pushed, hidden).then(finish);
        
      }
      
      // load the view
      var loaded = this.getView(name).load().setState('preloaded').append().promise();
      
      // bind promise
      this.when(loaded).then(push);
      
    },
    
    _popView: function() {
    
      if (this.is('animating') || this.stack.length < 2) {
        return;
      }
      
      // set as animating
      this.animating = true;
      
      // unload the view
      var hidden = this.stack.pop().setState('unloading', 300).setState('preloaded').remove().unload().promise();
      
      // show the underlying view
      var visible = this.stack.last().show().setState('loading', 300).setState('active').promise();
      
      // bind promise
      this.when(hidden, visible).then(function() {
        this.animating = false;
      });
    
    },
    
    _popToRootView: function() {
      
      if (this.is('animating') || this.stack.length < 2) {
        return;
      }
      
      // set as animating
      this.animating = true;
      
      // clear the stack
      for (var i = 1, stack = this.stack.toArray(), l = stack.size(); i < l; i++) {
        stack[i].hide().remove().unload();
      }
      
      // unload the view
      var hidden = this.stack.pop().setState('unloading', 300).setState('preloaded').remove().unload().promise();
      
      // show the underlying view
      var visible = this.stack.first().show().setState('loading', 300).setState('active').promise();
      
      function finish() {
        
        // stop animation
        this.animating = false;
        
        // deactivate current view
        this.active = this.stack.first();
        
        // push view stack
        this.stack = new List(this.active);
        
      }
      
      // bind promise
      this.when(hidden, visible).then(finish);
      
    }
  
  });
  
  
  /**
   * @name contacts-app
   * @expects ViewController <between>
   * @expects <add-btn>
   * @expects <id>
   * @states /:id /second
   */
  ContactsAppController = ViewController.extend({
  
    getType: function() {
      return 'contacts-app';
    },
    
    getBindings: function() {
      return {
        'add-btn': { 'touchclick': this.$onAdd }
      };
    },
    
    getOutlets: function() {
      return {
        elements: ['add-btn', 'id'],
        views: ['between']
      };
    },
    
    getRoutes: function() {
      
      function onFirst(current, params) {
        if (!current || current === 'second') {
          this.getElement('first').removeClass('hidden');
          this.getElement('second').addClass('hidden');
        }
        this.getElement('id').text(params.id);
      }
      
      function onSecond(current, params) {
        if (!current || current === 'first') {
          this.getElement('first').addClass('hidden');
          this.getElement('second').removeClass('hidden');
        }
      }
    
      return {
        '/:id': onFirst,
        '/second': onSecond
      };
    },
    
    $onAdd: function() {
      if (this.getRoute() === 'second') {
        this.setRoute('first');
      } else {
        this.setRoute('second');
      }
    }
  
  });
  
  
  /**
   * @name between
   * @expects ViewController <contacts-list>
   * @bubbles test
   */
  BetweenController = ViewController.extend({
  
    getType: function() {
      return 'between';
    },
    
    getOutlets: function() {
      return {
        views: ['contacts-list']
      };
    }
  
  });
  
  
  /**
   * @name contacts-list
   * @expects <one>
   * @expects <two>
   * @expects <plus-btn>
   * @expects <minus-btn>
   * @expects <bind-spot>
   * @routes /one /two
   * @fires test
   */
  ContactsListController = ViewController.extend({
  
    getType: function() {
      return 'contacts-list';
    },
    
    getBindings: function() {
      return {
        'plus-btn': { 'touchclick': this.$onPlus },
        'minus-btn': { 'touchclick': this.$onMinus },
        'symbol': { 'keypress': this.$onKeyPress }
      };
    },
    
    getOutlets: function() {
      return {
        elements: ['one', 'two', 'plus-btn', 'minus-btn', 'bind-spot', 'account', 'positions', 'symbol']
      };
    },
    
    getRoutes: function() {
            
      function onOne(current, params) {
        if (!current || current === 'two') {
          this.getElement('one').removeClass('hidden');
          this.getElement('two').addClass('hidden');
        }
      }
      
      function onTwo(current, params) {
        if (!current || current === 'one') {
          this.getElement('one').addClass('hidden');
          this.getElement('two').removeClass('hidden');
        }
      }
    
      return {
        '/one': onOne,
        '/two': onTwo
      };
    
    },
    
    onDidAppear: function(e) {
    
      this.getElement('positions').on('click', '[data-column]', proxy(this.$columnPress, this));
      
      function success(user) {
      
        var user2 = user.clone();
        
        this.bind('bind-spot', user);
        this.bind('account', user2);
        
        setTimeout(function() {
          user2.set('firstName', 'Rachel');
          user2.set('lastName', 'Samaniego');
        }, 1000);
        
        setTimeout(function() {
          user.update({
            id: "1234",
            firstName: 'Steph',
            lastName: 'Yang',
            username: "triviatrish@gmail.com",
            createDate: '2012-01-08',
            loginDate: '2012-02-16'
          });
        }, 2000);
        
      }
      
      function failure() {
        console.log('failure');
      }
    
      this.app.getService('account').getActiveUser(success, failure, this);
      
      function positionsSuccess(positions) {
                        
        this.bind('positions', positions);
        
        this.attr('positions', positions);
                
        setTimeout(function() {
                
          positions.get('342').set('price', 100);
        
        }, 10000);
      
      }
      
      this.app.getService('portfolio').getPositionsForPortfolio(1, positionsSuccess, failure, this);
      
      this._super();
      
    },
    
    $onPlus: function(e) {
      this.stop().clearState().setRoute('one');
      this.fire('test', 'kevin');
    },
    
    $onMinus: function(e) {
      this.setRoute('two').setState('state-one', 500).setState('state-two', 500).setState('state-three', 500);
    },
    
    $onKeyPress: function(e) {
      
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code === 13) { // enter keycode
        e.preventDefault();
        this.attr('positions').clearFilters(true).filter('symbol', this.getElement('symbol').val());
      }
    },
    
    $columnPress: function(e) {
      if (!this.attr('positions')) {
        return;
      }
      if (!this.direction) {
        this.direction = 1;
      } else {
        this.direction = this.direction * -1;
      }
      var column = $(e.currentTarget).attr('data-column');
      this.attr('positions').sort(column, this.direction);
    }
  
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  exports.BetweenController = BetweenController;
  exports.ContactsAppController = ContactsAppController;
  exports.ContactsListController = ContactsListController;
  
  
}, ['tt-services']);