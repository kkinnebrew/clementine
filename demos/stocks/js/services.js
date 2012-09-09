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
  
  var PortfolioMap = {
  
    model: 'portfolio',
    params: {
      id: 'portfolioId',
      name: 'portfolioName',
      shortRate: 'shortRate',
      longRate: 'longRate',
      carryLoss: 'carryLoss'
    }
    
  };
  
  var PositionMap = {
  
    model: 'position',
    params: {
      id: 'positionId',
      price: 'price',
      symbol: 'symbol',
      quantity: 'quantity',
      cost: 'costBasis'
    }
    
  };
  
  var PositionLineMap = {
  
    model: 'position-line',
    params: {
      id: 'positionLineId',
      symbol: 'symbol',
      tradeDate: 'tradeDate',
      quantity: 'quantity',
      cost: 'cost'
    }
    
  };
  
  var SymbolMap = {
  
    model: 'symbol',
    params: {
      id: 'symbolId',
      symbol: 'symbol',
      name: 'name',
      price: 'price',
      priceChange: 'priceChange',
      percentChange: 'priceChangePercent',
      marketCap: 'marketCap',
      peRatio: 'peRatio',
      lastTradeDate: 'lastTrade',
      volume: 'volume'
    }
    
  };
  
  
  // ------------------------------------------------------------------------------------------------
  // Service Definitions
  // ------------------------------------------------------------------------------------------------

  /**
   * @name account
   * @requires account
   * @endpoint authenticate
   */
  AccountService = Service.extend({
    
    getType: function() {
      return 'account';
    },
    
    getPath: function() {
      return '/mock';
    },
    
    authenticate: function(email, password, success, error, context) {
      
      var map = {
        map: AccountMap,
        from: 'object',
        to: 'model',
        offline: false,
        cache: false,
        callback: function(source) {
          return source.account;
        }
      };
      
      var params = {
        email: email,
        password: password
      };
      
      this.request('/account.json', 'GET', params, map, success, error, context);
      
    }
    
  });
  
  /**
   * @name portfolio
   * @requires portfolio
   * @requires position
   * @endpoint getPortfolio
   */
  PortfolioService = Service.extend({
    
    getType: function() {
      return 'portfolio';
    },
    
    getPath: function() {
      return '/mock';
    },
    
    getPortfolio: function(success, error, context) {
    
      var map = {
        map: PortfolioMap,
        from: 'object',
        to: 'model',
        offline: true,
        cache: true,
        callback: function(source) {
          return source.portfolio;
        }
      };
      
      this.request('/portfolio.json', 'GET', {}, map, success, error, context);
      
    },
    
    getPositionsForPortfolio: function(portfolio, success, error, context) {
      
      var map = {
        map: PositionMap,
        from: 'array',
        to: 'collection',
        offline: true,
        cache: true,
        callback: function(source) {
          return source.positions;
        }
      };
      
      var params = {
        portfolioId: modelOrId(portfolio)
      };
      
      this.request('/positions.json', 'GET', params, map, success, error, context);
    
    },
    
    getLinesForPosition: function(position, success, error, context) {
      
      var map = {
        map: PositionLineMap,
        from: 'array',
        to: 'collection',
        offline: true,
        cache: true,
        callback: function(source) {
          return source.positionLines;
        }
      };
      
      var params = {
        positionId: modelOrId(position)
      };
      
      this.request('/positionLines.json', 'GET', params, map, success, error, context);
    
    }
    
  });
  
  QuoteService = Service.extend({
    
    getType: function() {
      return 'quote';
    },
    
    getPath: function() {
      return '/mock';
    },
    
    getSymbol: function(symbol, success, error, context) {
            
      var map = {
        map: SymbolMap,
        from: 'object',
        to: 'model',
        offline: true,
        cache: true,
        callback: function(source) {
          return source.quote;
        }
      };
      
      if (typeof symbol !== 'string') {
        return error.call(this);
      }
      
      var params = {
        symbol: symbol
      };
      
      this.request('/quote.json', 'GET', params, map, success, error, context);
      
    }
    
  });
  
  
  // ------------------------------------------------------------------------------------------------
  // Functions
  // ------------------------------------------------------------------------------------------------
  
  function modelOrId(object) {
    if (object instanceof Model) {
      return object.getId();
    } else if (typeof object !== 'object') {
      return object;
    } else {
      throw new Error('Invalid Input: Expecting model or id', object);
    }
  }
  
  
  // ------------------------------------------------------------------------------------------------
  // Exports
  // ------------------------------------------------------------------------------------------------

  exports.AccountService   = AccountService;
  exports.PortfolioService = PortfolioService;
  exports.QuoteService     = QuoteService;
  

}, [], '0.1.0');