// ------------------------------------------------------------------------------------------------
// TickerType Configuration
// ------------------------------------------------------------------------------------------------

Orange.config(function(app) {
  
  // set constants
  app.setConstant('baseUrl', '/orangeui/demos/stocks');
  
  // register service urls
  app.registerServicePaths({
    'DEV': '/orangeui/demos/stocks',
    'QA': '/orangeui/demos/stocks',
    'PROD': '/orangeui/demos/stocks'
  });
  
  // register account service
  app.registerService('account');
  
  // register portfolio service
  app.registerService('portfolio', 'account');
  
  // register quote service
  app.registerService('quote', 'account');
  
  // set auth service
  app.setAuthentication('account');
  
  // set environment
  app.setEnvironment('PROD');
  
  // set logging
  app.setLogging({
    'DEV': 'INFO',
    'QA': 'DEBUG',
    'PROD': 'NONE'
  });
  
  // register views
  app.registerViews([
    'templates/view.html'
  ]);
  
});