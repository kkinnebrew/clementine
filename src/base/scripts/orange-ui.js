/**
 * orange-ui.js | OrangeUI 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-commons-0.1, jquery-1.7.2
 * @description adds base controller elements
 */

(function(O) {

	/* jQuery Dependencies */
	var TemplateManager = (function() {
	
		var _templates = {},
		
		_fetch = function(name) {
			return $.ajax({
				asych: false,
		    contentType: "text/html; charset=utf-8",
		    dataType: "text",
		    timeout: 10000,
		    url: "/" + name + ".html",
		    success: function() {},
		    error: function() {
					throw "Error: template not found";
		    }
			}).responseText;
		};
		
		return {
		
			load: function(name) {
				if (typeof _templates[name] !== 'undefined') {
					return _templates[name];
				} else {
					return _fetchTemplate(name);
				}				
			}
		
		}
	
	})();


	/* jQuery Dependencies */
	var Form = function(target) {
		this._fields = {};
		this._target = target;
		
		$(target).find('input select textarea').each(function() {
			var name = $(this).attr('name');
			this._fields[name] = $(this);
		});
		
	};
	
	Form.prototype.initialize = Form;

	Form.prototype.get = function(name) {
		if (typeof this._fields[name] !== 'undefined') {
			return this._fields[name];
		}
	};
	

	var ViewManager = (function() {
	
		var _views = {};
		
		return {
		
			define: function(def) {
				var c = Class.create(def), name = def.name;
				if(typeof name === 'undefined') throw "Error: Class not named";
				return _views[name] = c;
			},
			
			extend: function(base, def) {
				var c = Class.extend(base, def), name = def.name;
				if(typeof name === 'undefined') throw "Error: Class not named";
				return _views[name] = c;
			},
			
			load: function(name) {
				var view;
				if (typeof (view = _views[name]) !== 'undefined') {
					return view;
				} else throw "Error: View not found";
			}
		
		};
	
	});
	

	/* jQuery Dependencies */
	var View = function(parent, target) {
		
		this.type = 'view';
		this.target = $(target);
		this.name = this.target.attr('data-name');
		
		this._views = [];
		this._forms = [];
		this._eventTarget = new EventTarget(parent, target);
		
		this.target.find('[data-view]').each(function() {
			var view = $(this);
			
			if (!view.parents('[data-view]').not(this.target).size()) {
				
				var name = view.attr('data-name'),
				 		type = view.attr('data-view'),
				 		isRemote = view.attr('data-remote') == 'true';
				
				if (isRemote) {
					var source = TemplateManager.load(name);
					view.replaceWith(source);
				}
				 		
				var c = ViewManager.load(type);
				var child = new c(target, view);
				
				this._views[name] = child;
			}
			
		});
		
		this.target.find('form').each(function() {
			var form = $(this);
			
			if (!form.parents('[data-view]').not(this.target).size()) {
				var name = form.attr('name'),
						child = new Form(form);
				this._forms[name] = child;
			}
			
		});
		
	};
	
	View.prototype.initialize = View;
	
	View.prototype.getView = function(name) {
		if(this._views[name] instanceof View) return this._views[name];
		throw 'Error: View "' + name + '" not found';
	};
	
	View.prototype.getForm = function(name) {
		if(this._forms[name] instanceof Form) return this._forms[name];
		throw 'Error: Form "' + name + '" not found';
	};
	
	View.prototype.bind = function() {
		return this._eventTarget.bind.apply(this, arguments);
	};
	
	View.prototype.unbind = function() {
		return this._eventTarget.unbind.apply(this, arguments);
	};
	
	View.prototype.fire = function() {
		return this._eventTarget.fire.apply(this, arguments);
	};
	
	View.prototype.onLoad = function() {
		for(var name in this._views) {
			this._views[name].onLoad();
		}
	};
	
	View.prototype.onUnload = function() {
		for(var name in this._views) {
			this._views[name].onUnload();
		}
	};
	
	View.prototype.destroy = function() {
		for(var name in this._views) {
			this._views[name].destroy();
		}
		for(var name in this._forms) {
			this._forms[name].destroy();
		}
	};
	
	O.View = View;
	O.ViewManager = ViewManager;
	O.TemplateManager = TemplateManager;
	O.Form = Form;

})(Orange);