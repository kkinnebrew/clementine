// ------------------------------------------------------------------------------------------------
// TickerType Services
// ------------------------------------------------------------------------------------------------

Orange.add('tickertype-services', function(exports) {

  var AccountService;
  var PortfolioService;
  var QuoteService;
  
  
  // ------------------------------------------------------------------------------------------------
  // Dependencies
  // ------------------------------------------------------------------------------------------------
  
  var Model        = Orange.Model;
  var Service      = Orange.Service;
  
  
  // ------------------------------------------------------------------------------------------------
  // Model Mappings
  // ------------------------------------------------------------------------------------------------
  
  var AccountMap = {
  
    model: 'account',
    params: {
      id: 'accountId',
      username: 'email',
      firstName: 'first',
      lastName: 'last',
      createDate: 'createdDate',
      loginDate: 'loginDate'
    }
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Service Definitions
  // ------------------------------------------------------------------------------------------------

  AccountService = Service.extend({
    
    getType: function() {
      return 'account';
    },
    
    getPath: function() {
      return 'account';
    },
    
    authenticate: function(email, password, success, error, context) {
      
      var map = {
        map: AccountMap,
        from: 'object',
        to: 'model',
        offline: true,
        cache: true,
        callback: function(source) {
          return source.account;
        }
      };
      
      var params = {
        email: email,
        password: password
      };
      
      this.request('/account.json', 'GET', params, map, success, error, context);
      
    },
    
    register: function(params, success, error, context) {
      
      var map = {
        map: AccountMap,
        from: 'object',
        to: 'model',
        offline: true,
        cache: true,
        callback: function(source) {
          return source;
        }
      };
      
      var data = {
        email: params.email,
        password: params.password,
        first: params.firstName,
        last: params.lastName
      };
      
      //this.request('/account.json', 'GET', data, map, success, error, context);
      
    }
    
  });
  
  PortfolioService = Service.extend({
    
    getType: function() {
      return 'portfolio';
    }
    
  });
  
  QuoteService = Service.extend({
    
    getType: function() {
      return 'quote';
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Functions
  // ------------------------------------------------------------------------------------------------
  
  function modelOrId(object) {
    return object instanceof Model ? object.getId() : object;
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------

  exports.AccountService   = AccountService;
  exports.PorfolioService  = PortfolioService;
  exports.QuoteService     = QuoteService;
  

}, [], '0.1.0');