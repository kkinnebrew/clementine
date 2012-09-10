// ------------------------------------------------------------------------------------------------
// TickerType Controllers
// ------------------------------------------------------------------------------------------------

Orange.add('tt-controllers', function(exports) {
  
  var BetweenController;
  var ContactsAppController;
  var ContactsListController;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies Controllers
  // ------------------------------------------------------------------------------------------------
  
  var ViewController = Orange.ViewController;

  
  // ------------------------------------------------------------------------------------------------
  // Controller Definitions
  // ------------------------------------------------------------------------------------------------
  
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
        
        this.setParam('positions', positions);
                
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
          this.getParam('positions').sort('quantity', this.direction);
          this.getParam('positions').clearFilters(true);
          this.getParam('positions').filter('symbol', this.getElement('symbol').val());
      }
    },
    
    $columnPress: function(e) {
      if (!this.hasParam('positions')) {
        return;
      }
      if (!this.direction) {
        this.direction = 1;
      } else {
        this.direction = this.direction * -1;
      }
      var column = $(e.currentTarget).attr('data-column');
      this.getParam('positions').sort(column, this.direction);
    }
  
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------
  
  exports.BetweenController = BetweenController;
  exports.ContactsAppController = ContactsAppController;
  exports.ContactsListController = ContactsListController;
  
  
}, ['tt-services']);