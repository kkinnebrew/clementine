/**
 * orange-db.js | OrangeUI DB Plugin 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-ui-0.1, jquery-1.7.2
 * @description adds custom datasources and control binding support
 */

(function(O) {

	var Model = function(datasource) {
	
	};

	Model.initialize = Model;
	

	var Collection = function(model) {
		this._model = model;
	};

	Collection.initialize = Collection;
	
	Collection.prototype.filter = function() {
	
	};
	
	Collection.prototype.bind = function(ev, call) {
		
	};
	
	Collection.prototype.unbind = function(ev, call) {
	
	};
	

	var Item = function(model) {
		this._model = model;
	};

	Item.initialize = Item;
	
	Item.prototype.bind = function(ev, call) {
	
	};
	
	Item.prototype.unbind = function(ev, call) {
	
	};
	

	var DB = (function() {
	
		return {
		
		};
	
	})();

})(Orange);