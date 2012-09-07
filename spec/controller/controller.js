// ------------------------------------------------------------------------------------------------
// ViewController Class Tests
// ------------------------------------------------------------------------------------------------

describe('ViewController', function() {

  var ViewController = Orange.ViewController;
    
  it('should be available on the global object', function() {
    
    expect(Orange).to.have.property('ViewController');
    
  });
 
  describe('initialize()', function() {
  
    it('should store a reference to a target reference', function() {
            

      var NewController = ViewController.extend({
        
        getType: function() {
          return 'new';
        }
        
      });
      
      var OldController = NewController.extend({
        
        getType: function() {
          return 'old';
        }
        
      });
            
      var t = ViewController.get('new');
            
      var c= new t(null, $('[data-root]'));
      c.load().show();
      console.log(c);
      
    });
  
  });
 
});