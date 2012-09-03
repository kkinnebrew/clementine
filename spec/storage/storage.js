// ------------------------------------------------------------------------------------------------
// Storage Object Tests
// ------------------------------------------------------------------------------------------------

describe('Storage', function() {

  var Storage = Orange.Storage;
  
  describe('get()', function() {
  
    it('should have function available', function() {
    
      expect(Storage).to.have.property('get');
      expect(Storage.get).to.be.a('function');
    
    });
  
  });
  
  describe('set()', function() {
    
    it('should have function available', function() {
    
      expect(Storage).to.have.property('set');
      expect(Storage.set).to.be.a('function');
    
    });
  
  });
  
  describe('remove()', function() {
  
    it('should have function available', function() {
    
      expect(Storage).to.have.property('remove');
      expect(Storage.remove).to.be.a('function');
    
    });
  
  });
  
  describe('flushExpired()', function() {
  
    it('should have function available', function() {
    
      expect(Storage).to.have.property('flushExpired');
      expect(Storage.flushExpired).to.be.a('function');
    
    });
  
  });
  
  describe('flush()', function() {
  
    it('should have function available', function() {
    
      expect(Storage).to.have.property('flush');
      expect(Storage.flush).to.be.a('function');
    
    });
    
  });
  
  describe('isSupported()', function() {
    
    it('should have function available', function() {
    
      expect(Storage).to.have.property('isSupported');
      expect(Storage.isSupported).to.be.a('function');
      
    });
    
  });
  
  describe('goOnline()', function() {
  
    it('should have function available', function() {
      
      expect(Storage).to.have.property('goOnline');
      expect(Storage.goOnline).to.be.a('function');
    
    });
    
  });
  
  describe('goOffline()', function() {
  
    it('should have function available', function() {
    
      expect(Storage).to.have.property('goOffline');
      expect(Storage.goOffline).to.be.a('function');
    
    });
  
  });

});