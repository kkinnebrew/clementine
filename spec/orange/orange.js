// ------------------------------------------------------------------------------------------------
// Global Function Tests
// ------------------------------------------------------------------------------------------------
  
describe('Globals', function() {

  describe('noop()', function() {
    
    it('should be globally available', function() {
      
      expect(noop).to.be.a('function');
      
    });
      
  });
  
  
  describe('proxy()', function() {
    
    it('should be globally available', function() {
      
      expect(proxy).to.be.a('function');
      
    });
    
    it('should bind to proper context', function() {
      
      var context = { name: 'Orange' };
      
      function testProxy() {
        return this.name;
      }
      
      var func = proxy(testProxy, context)();
    
      expect(func).to.eql('Orange');
        
    });
      
  });
  
});


// ------------------------------------------------------------------------------------------------
// Class Definition Tests
// ------------------------------------------------------------------------------------------------

describe('Class', function() {
  
  describe('constructor()', function() {
    
    var classInstance;
    
    before(function() {
    
      classInstance = new Class();
      
    });
    
    it('should return instance of "Class" on instantiation', function() {
    
      expect(classInstance).to.be.a(Class);
      
    });
    
    it('should contain function "extend()"', function() {
    
      expect(Class).to.have.property('extend');
      expect(Class.extend).to.be.a('function');
      
    });
    
    after(function() {
    
      classInstance = null;
      
    });
    
  });

  describe('extend()', function() {
  
    var classInstance, SubClass, subClassInstance;
    
    before(function() {
    
      classInstance = new Class();
      SubClass = Class.extend({ getValue: function() { return 5; }});
      subClassInstance = new SubClass();
      
    });
    
    it('should return Class with function "extend()"', function() {
      
      expect(SubClass).to.have.property('extend');
      expect(SubClass.extend).to.be.a('function');
      
    });
    
    it('should return instance of "Class"', function() {
      
      expect(subClassInstance).to.be.a(Class);
      
    });
    
    it('should include passed in methods {}', function() {
    
      expect(subClassInstance.getValue()).to.eql(5);
      
    });
    
    it('should override parent class function', function() {
    
      var SuperClass = SubClass.extend({
        getValue: function() { return 10; }
      });
      
      expect((new SuperClass()).getValue()).to.eql(10);
      
    });
    
    it('should allow the call of super class method', function() {
    
      var SuperClass = SubClass.extend({
        getValue: function() { return this._super() + 10; }
      });
      
      expect((new SuperClass()).getValue()).to.eql(15);
      
    });
    
    after(function() {
    
      classInstance = null;
      SubClass = null;
      subClassInstance = null;
      
    });
    
  });
  

  describe('include()', function() {
    
    var SubClass, SubSubClass;
    
    before(function() {
    
      SubClass = Class.extend({});
      SubSubClass = Class.extend({});
      SubClass.include({
        getValue: function() { return 20; }
      });
      
    });
        
    it('should be passed down to sub classes', function() {
    
      expect(SubSubClass).to.have.property('include');
      expect(SubSubClass.include).to.be.a('function');
      
    });
    
    it('should return function with custom context', function() {
    
      expect((new SubClass()).getValue()).to.eql(20);
      
    });
    
    after(function() {
    
      SubClass = null;
      SubSubClass = null;
      
    });
    
    
  });

});


// ------------------------------------------------------------------------------------------------
// Events Mixin Tests
// ------------------------------------------------------------------------------------------------

describe('Events', function() {

  describe('include()', function() {
    
    var SubClass, SubSubClass, subClassInstance, subSubClassInstance;
    
    before(function() {
    
      SubClass = Class.extend({});
      SubClass.include(Events);
      SubSubClass = SubClass.extend({});
      subClassInstance = new SubClass();
      subSubClassInstance = new SubSubClass();
      
    });
    
    it('should be included properly in a class', function() {
      
      expect(subClassInstance.on).to.be.a('function');
      expect(subClassInstance.detach).to.be.a('function');
      expect(subClassInstance.fire).to.be.a('function');
      
    });
    
    it('should be included properly in decendent classes', function() {
    
      expect(subSubClassInstance.on).to.be.a('function');
      expect(subSubClassInstance.detach).to.be.a('function');
      expect(subSubClassInstance.fire).to.be.a('function');
      
    });
    
    after(function() {
    
      SubClass = null;
      SubSubClass = null;
      
    });
    
  });

  describe('on()', function() {
  
    var callbackOne = function() { return true; },
        callbackTwo = function() { return false; },
        SubClass, subClassInstance;
  
    before(function() {
    
      SubClass = Class.extend({});
      SubClass.include(Events);
      subClassInstance = new SubClass();
      
    });
  
    it('should add event listener to listeners array', function() {
    
      subClassInstance.on('test', callbackOne);
      subClassInstance.on('test', callbackTwo);
      
      expect(subClassInstance).to.have.property('_listeners');
      expect(subClassInstance._listeners['test'].indexOf(callbackOne)).to.not.eql(-1);
      expect(subClassInstance._listeners['test'].indexOf(callbackTwo)).to.not.eql(-1);
      
    });
    
    after(function() {
    
      SubClass = null;
      subClassInstance = null;
      
    });
    
  });

  describe('detach()', function() {
    
    var callbackOne = function() { return true; },
        callbackTwo = function() { return false; },
        SubClass, subClassInstance;
  
    before(function() {
    
      SubClass = Class.extend({});
      SubClass.include(Events);
      subClassInstance = new SubClass();
      subClassInstance.on('test', callbackOne);
      subClassInstance.on('test', callbackTwo);
      
    });
    
    it('should remove event listener from listeners array', function() {
    
      subClassInstance.detach('test', callbackOne);
      
      expect(subClassInstance).to.have.property('_listeners');
      expect(subClassInstance._listeners['test'].indexOf(callbackOne)).to.eql(-1);
      expect(subClassInstance._listeners['test'].indexOf(callbackTwo)).to.not.eql(-1);
              
    });
    
    it('should remove all listeners from a given event', function() {
    
      subClassInstance.detach('test');
      
      expect(subClassInstance).to.have.property('_listeners');
      expect(subClassInstance._listeners['test'].length).to.eql(0);
      
    });
    
    it('should remove all event listeners when no arguments are specified ', function() {
    
      subClassInstance.detach();
      
      var actual = false;
      
      for (var i in subClassInstance._listeners) {
        if (subClassInstance._listeners.hasOwnProperty(i)) {
          actual = false;
        }
      } actual = true;
      
      expect(actual).to.eql(true);
      
    });
    
    after(function() {
    
      SubClass = null;
      subClassInstance = null;
      
    });
    
  });
  
  describe('fire()', function() {
    
    var testVariableOne, testVariableTwo, dataOne, dataTwo, contextOne, contextTwo,
        callbackOne = function(e, data) { testVariableOne = 1; dataOne = data; contextOne = this; },
        callbackTwo = function(e, data) { testVariableTwo = 2; dataTwo = data; contextTwo = this; },
        SubClass, subClassInstance, subSubClassInstance;
    
    before(function() {
    
      testVariableOne = 0;
      testVariableTwo = 0;
      dataOne = null;
      dataTwo = null;
      SubClass = Class.extend({});
      SubClass.include(Events);
      subClassInstance = new SubClass();
      subSubClassInstance = new SubClass();
      subSubClassInstance._parent = subClassInstance;
      
    });
    
    it('should fire all callbacks bound to class', function() {
    
      subClassInstance.on('test', callbackOne);
      subClassInstance.on('test', callbackTwo);
      subClassInstance.fire('test');
      
      expect(testVariableOne).to.eql(1);
      expect(testVariableTwo).to.eql(2);
      
    });
    
    it('should fire all callbacks with appropriate context', function() {
    
      subClassInstance.on('test', callbackOne, { value: 'the-context' });
      subClassInstance.on('test', callbackTwo, { value: 'the-context' });
      subClassInstance.fire('test');
      
      expect(contextOne.value).to.eql('the-context');
      expect(contextTwo.value).to.eql('the-context');
      
    });
    
    it('should bubble and fire callbacks on parent objects if they exist', function() {
    
      subClassInstance.on('test', callbackOne);
      subSubClassInstance.on('test', callbackTwo);
      subSubClassInstance.fire('test');
      
      expect(testVariableOne).to.eql(1);
      expect(testVariableTwo).to.eql(2);
      
    });
    
    it('should pass payload to callbacks', function() {
    
      subClassInstance.on('test', callbackOne);
      subClassInstance.on('test', callbackTwo);
      subClassInstance.fire('test', 'hello');
      
      expect(dataOne).to.eql('hello');
      expect(dataTwo).to.eql('hello');
      
    });
    
    after(function() {
    
      subClassInstance = null;
      subSubClassInstance = null;
      
    });
    
  });

  describe('stopPropagation()', function() {
    
    var testVariableOne, testVariableTwo, bubblesOne, bubblesTwo,
        callbackOne = function(e, data) { testVariableOne = 1; },
        callbackTwo = function(e, data) { testVariableTwo = 2; },
        SubClass, subClassInstance, subSubClassInstance;
    
    before(function() {
    
      testVariableOne = 0;
      testVariableTwo = 0;
      bubblesOne = -1;
      bubblesTwo = -1;
      SubClass = Class.extend({});
      SubClass.include(Events);
      subClassInstance = new SubClass();
      subSubClassInstance = new SubClass();
      subSubClassInstance._parent = subClassInstance;
      
    });
    
    it('should set bubbles to false when called', function() {
      
      var actual = true;
      
      callbackOne = function(e, data) {
        e.stopPropagation();
        actual = e.bubbles;
      };
      
      subClassInstance.on('test', callbackOne);
      subSubClassInstance.fire('test');
      
      expect(actual).to.eql(false);
      
    });
    
    it('should stop bubbling to parent when called', function() {
    
      callbackOne = function(e, data) { testVariableOne = 1; };
      callbackTwo = function(e, data) { e.stopPropagation(); testVariableTwo = 2; };
      subClassInstance.on('test', callbackOne);
      subSubClassInstance.on('test', callbackTwo);
      subSubClassInstance.fire('test');
      
      expect(testVariableOne).to.eql(0);
      expect(testVariableTwo).to.eql(2);
      
    });
    
    after(function() {
    
      subClassInstance = null;
      subSubClassInstance = null;
      
    });
    
  });
  
});

// ------------------------------------------------------------------------------------------------
// Events Handle Tests
// ------------------------------------------------------------------------------------------------

describe('EventHandle', function() {

  var EventHandle = Orange.EventHandle;

  var EventedClass = Class.extend({});
  var eventedClassInstance;
  var actual = false;
  
  EventedClass.include(Events);
  
  function eventCallback(e) {
    actual = true;
  }
  
  it('should should return an event target instance', function() {
    
    eventedClassInstance = new EventedClass();
    expect(eventedClassInstance.on('event', eventCallback)).to.be.a(EventHandle);
    
  });
  
  it('should detach event via handle', function() {
  
    eventedClassInstance = new EventedClass();
    var handle = eventedClassInstance.on('event', eventCallback);
    handle.detach();
    eventedClassInstance.fire('event');
    
    expect(actual).to.eql(false);
  
  });
  
});


// ------------------------------------------------------------------------------------------------
// Module Function Tests
// ------------------------------------------------------------------------------------------------

describe('Module', function() {

  describe('add()', function() {
    
    it('should add the module via the exports object', function() {
    
      Orange.add('test-module-1', function(exports) {
        
        exports = { name: 'testModule' };
        
      }, []);
      
      Orange.use('test-module-1', function() {
        
        expect(Orange.modules).to.have.key('test-module-1');
        
      });
    
    });
    
  });
  
  describe('use()', function() {
  
    it('should require a test module in the context', function() {
        
      Orange.use('test-module-1', function() {
        
        expect(Orange.modules).to.have.key('test-module-1');
        
      });
    
    });
    
  });
    
  describe('include()', function() {
    
    it('should be globally available', function() {
      
      expect(include).to.be.a('function');
      
    });
    
    it('should return module for given name', function() {
        
      Orange.modules['test'] = { name: 'Orange' };
      
      var module = include('test');
    
      expect(module.name).to.eql('Orange');
        
    });
      
  });

});


// ------------------------------------------------------------------------------------------------
// Log Object Tests
// ------------------------------------------------------------------------------------------------

describe('Log', function() {
      
  it('should have setLevel() method on object', function() {
  
    expect(Log).to.have.property('setLevel');
    expect(Log.setLevel).to.be.a('function');
  
  });
  
  it('should have debug() method on object', function() {
  
    expect(Log).to.have.property('debug');
    expect(Log.setLevel).to.be.a('function');
  
  });
        
  it('should have info() method on object', function() {
  
    expect(Log).to.have.property('info');
    expect(Log.setLevel).to.be.a('function');
  
  });
        
  it('should have warn() method on object', function() {

    expect(Log).to.have.property('warn');
    expect(Log.setLevel).to.be.a('function');
  
  });
    
  it('should have error() method on object', function() {
  
    expect(Log).to.have.property('error');
    expect(Log.setLevel).to.be.a('function');
  
  });
      
});


// ------------------------------------------------------------------------------------------------
// Browser Object Tests
// ------------------------------------------------------------------------------------------------

describe('Browser', function() {
  
  var Browser = Orange.Browser;
  
  it('should have boolean property touch', function() {
  
    expect(Browser).to.have.property('touch');
    expect(Browser.touch).to.be.a('boolean');
  
  });

  it('should have boolean property location', function() {
    
    expect(Browser).to.have.property('location');
    expect(Browser.location).to.be.a('boolean');
  
  });
  
});


// ------------------------------------------------------------------------------------------------
// Array Extension Tests
// ------------------------------------------------------------------------------------------------

describe('Array', function() {

  describe('clone()', function() {
  
    it('should be available on Array object', function() {
    
      expect(Array.prototype.clone).to.be.a('function');
    
    });
  
    it('should return a different reference', function() {
      
      var testArray = [1, 2, 3];
      var cloneArray = testArray.clone();
      
      cloneArray[1] = 8;
      
      expect(cloneArray[1]).not.to.eql(testArray[1]);
    
    });
  
  });
  
  
  describe('indexOf()', function() {
  
    it('should be available on Array object', function() {
    
      expect(Array.prototype.indexOf).to.be.a('function');
    
    });
  
    it('should return the proper index', function() {
      
      var testArray = ['one', 'two', 'three'];
      
      var actual = testArray.indexOf('two');
      
      expect(actual).to.eql(1);
    
    });
  
  });

});