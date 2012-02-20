/**
 * storage-test.js | OrangeUI Framework 0.1
 * @date 2.19.2012
 * @author Kevin Kinnebrew
 * @dependencies jsunity-0.6
 */


jsUnity.run({

	suiteName: "StorageTestSuite",
	
	setUp: function() {
	
		// W3C local storage spec item
		var dummyStorage = {
		
			_items: {},
		
			setItem: function(key, value) {
				this._items[key] = value;
			},
			
			getItem: function(key) {
				return this._items[key];
			},
			
			removeItem: function(key) {
				delete this._items[key];
			},
			
			clear: function() {
				this._items = {};
			}
		
		}
	
		// load the storage module
		this.Storage = clone(OrangeUI.Storage).init(dummyStorage);
	
	},
	
	tearDown: function() {
	
		// remove storage instance
		delete this.Storage;
	
	},

	SetTest: function() {
	
		// test data
		var data = {
			name: "Kevin",
			date: new Date()
		}
		
		this.Storage.set("test-123", data);
	
		jsUnity.assertions.assertTrue(true);
	
	},
	
	GetTest: function() {
	
		jsUnity.assertions.assertEquals(Math.PI, 22 / 7);
	
	},
	
	RemoveTest: function() {
	
		jsUnity.assertions.assertEquals(Math.PI, 22 / 7);
	
	},
	
	FlushExpiredTest: function() {
	
		jsUnity.assertions.assertEquals(Math.PI, 22 / 7);
	
	},
	
	FlushTest: function() {
	
		jsUnity.assertions.assertEquals(Math.PI, 22 / 7);
	
	}
	

});