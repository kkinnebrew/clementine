var PersistenceManager = (function() {

	var isSyncing = false, isLive = false;
	
	PersistenceManager.init = function() {
		
		isLive = !(Cache.isActive() && !Cache.isOnline());
		
		this.cache = new LocalStorageSource({ name: 'cache' });
		
		this.createActions = new PersistenceStorageSource({ name: 'create' });
		this.updateActions = new PersistenceStorageSource({ name: 'update' });
		this.deleteActions = new PersistenceStorageSource({ name: 'delete' });
		this.pendingActions = new PersistenceStorageSource({ name: 'pending' });
		
		Cache.on('statusChange', Class.proxy(this.onStatusChange, this));
		
	};
	
	PersistenceManager.getAll = function(model, success, error) {
		
		var offlineFunc = function(data) {
		
			var creates = this.createActions.getAll(model.getName()),
					updates = this.updateActions.getAll(model.getName()),
					deletes = this.deleteActions.getAll(model.getName()),
					pending = this.pendingActions.getAll(model.getName());
			
			for (var key in creates) data[key] = creates[key];
			for (var key in updates) data[key] = updates[key];
			for (var key in deletes) delete data[key];
			
			if (isSyncing) for (var key in pending) data[pending[model.getId()]] = pending[key];
			
			success.call(this, data);
		
		};
		
		var onlineFunc = function(data) {
			var output = {};
			for (var i = 0, len = data.length; i < len; i++) {
				output[data[i][model.getId()]] = data[i];
			}
			this.cacheDS.setAll(model.getName(), output); // TO DO: check if this is array or list
			success(output);
		};
		
		if (!isLive) this.cacheDS.getAll(model.getName(), Class.proxy(offlineFunc, this), error);
		else model.getSource().getAll(model.getName(), Class.proxy(onlineFunc, this), error);
	
	};
	
	PersistenceManager.onStatusChange = function(e) {
	
	};

})();