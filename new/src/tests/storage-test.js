/**
 * storage-test.js | OrangeUI Framework 0.1
 * @date 2.19.2012
 * @author Kevin Kinnebrew
 * @dependencies jsunity-0.6
 */


jsUnity.run({

	suiteName: "StorageTestSuite",
	
	setUp: function() {
		
		this.storage = clone(OrangeUI.Storage);
		console.log(OrangeUI);
		this.storage.init();
		
	},
	
	tearDown: function() {
	
		delete this.storage;
	
	},

	testSet: function() {
	
		
	
	},
	
	testGet: function() {
	
		jsUnity.assertions.assertEquals(Math.PI, 22 / 7);
	
	}
	
});