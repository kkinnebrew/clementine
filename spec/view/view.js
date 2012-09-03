// ------------------------------------------------------------------------------------------------
// View Object Tests
// ------------------------------------------------------------------------------------------------

describe('View', function() {

	var View = Orange.View;

	describe('register()', function() {
		
		var actual = false;
		
		function callback() {
			actual = true;
		}
		
		it('should exist on the View object', function() {
			
			expect(View).to.have.property('register');
			expect(View.register).to.be.a('function');
			
		});
		
		it('should fire callback when done loading', function() {
		
			View.register([], callback);
			
			expect(actual).to.eql(true);
		
		});
	
	});
	
	describe('get()', function() {
			
		before(function() {
		
			View.register(['test1.html', 'test2.html'], function() {});
		
		});
		
		it('should exist on the View object', function() {
			
			expect(View).to.have.property('get');
			expect(View.get).to.be.a('function');
			
		});
		
		it('should return the proper view source control and name', function() {
			
			var actual = View.get('test1.html', 'test1', 'test1');
			expect(actual.html()).to.eql('<p>Hello</p>');
			
		});
		
		it('should return the proper view source with control', function() {
			
			var actual = View.get('test1.html', 'test1');
			expect(actual.html()).to.eql('<p>Hello</p>');
			
		});
		
		it('should return the proper view source without arguments', function() {
			
			var actual = View.get('test1.html');
			expect(actual.html()).to.eql('<p>Hello</p>');
			
		});
		
		it('should load multiple view sources', function() {
			
			var actual = View.get('test2.html');
			expect(actual.html()).to.eql('<p>Goodbye</p>');
			
		});

	});

});