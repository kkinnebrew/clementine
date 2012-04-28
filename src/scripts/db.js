/**
 * db.js | OrangeUI DB 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies commons
 * @description handles data requests and persistence
 */
 
Orange.add('db', function(O) {

	/* abstract data access */
	
	O.ModelDefinition = Class.create({
	
		initialize: function(name, def, path, filters) {
		
			this.name = name;
			this.def = def;
			this.path = path;
			this.filters = filters;
		
		},
		
		get: function() {
		
		},
		
		set: function() {
		
		},
		
		delete: function() {
		
		}
	
	});
	
	O.Model = (function() {
	
		var _models = {},
				
		return {
		
			define: function(name, def, path, filters) {
				if(typeof name === 'undefined' || typeof def === 'undefined') throw "Error: Model definition invalid";
				var c = new Model(name, def, path, filters);
				return _models[name] = c;
			},
			
			get: function(name) {
				var model;
				if (typeof (model = _models[name]) !== 'undefined') {
					return model;
				} else throw "Error: Model '" + name + "' not found";
			}
		
		};
	
	})();


	/* data containers */

	O.Collection = O.define({
		
		model: null,
		
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
			
	});
		
	O.Item = O.define({
	
		model: null,
	
		initialize: function() {
		
		},
		
		destroy: function() {
		
		}
	
	});
	
}, [], '0.1');