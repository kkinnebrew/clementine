// ------------------------------------------------------------------------------------------------
// Cache Object Tests
// ------------------------------------------------------------------------------------------------

describe('Cache', function() {

  var Cache = Orange.Cache;
  
  describe('init()', function() {
    
    it('should have function available', function() {
    
      expect(Cache).to.have.property('init');
      expect(Cache.init).to.be.a('function');
      
    });
  
  });
  
  describe('updateNetworkStatus()', function() {
  
    it('should have function available', function() {
    
      expect(Cache).to.have.property('updateNetworkStatus');
      expect(Cache.updateNetworkStatus).to.be.a('function');
    
    });
  
  });
  
  describe('isActive()', function() {
  
    it('should have function available', function() {
    
      expect(Cache).to.have.property('isActive');
      expect(Cache.isActive).to.be.a('function');
    
    });
  
  });
  
  describe('isOnline()', function() {
  
    it('should have function available', function() {
    
      expect(Cache).to.have.property('isOnline');
      expect(Cache.isOnline).to.be.a('function');
    
    });
  
  });

});