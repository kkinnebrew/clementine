// ------------------------------------------------------------------------------------------------
// Location Object Tests
// ------------------------------------------------------------------------------------------------

describe('Location', function() {

	var Location = Orange.Location;

	describe('get()', function() {
		
		var actual = false;
		
		function callback() {
			actual = true;
		}
		
		it('should exist on the Location object', function() {
			
			expect(Location).to.have.property('get');
			expect(Location.get).to.be.a('function');
			
		});

	});

});