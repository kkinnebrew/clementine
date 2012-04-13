/**
 * orange-event.js | OrangeUI Event 0.1
 * @date 12.21.2011
 * @author Kevin Kinnebrew
 * @dependencies orange-commons-0.1, jquery-1.7.2
 * @description adds base controller elements
 */

(function(O) {

	var EventTarget = {};
	
	EventTarget = function(parent, self) {
		this._listeners = [];
		this._parent = parent;
		this._self = self;
		this._bubble = true;
	};
	
	EventTarget.prototype.constructor = Event;
	
	EventTarget.prototype.bind = function(ev, call) {
		if (typeof this._listeners[ev] === "undefined"){
			this._listeners[ev] = [];
		}
		this._listeners[ev].push(call);
	};
	
	EventTarget.prototype.fire = function(ev, data) {
		if (typeof ev === 'string') ev = { type: ev, currentTarget: this._self, target: this._self };
		if (!ev.type) throw "Error: Event object missing 'type'";
		if (typeof data !== 'undefined') ev.data = data;
		else ev.data = {};
		
			
		if (this._listeners[ev.type] instanceof Array) {
			var listeners = this._listeners[ev.type], parentTarget = this._parent._eventTarget;
			for (var i = 0, len = listeners.length; i < len; i++) {
				listeners[i].call(this, ev);
			}
			ev.bubble = this._bubble;
			if (parentTarget instanceof Event && ev.bubble) {
				ev.currentTarget = this._parent;
				parentTarget.fire.call(parentTarget, ev, data);
			}
		}
	};
	
	EventTarget.prototype.unbind = function(ev, call) {
		if (this._listeners[ev] instanceof Array) {
			var listeners = this._listeners[ev];
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (typeof call !== 'undefined' && listeners[i] === call) {
					listeners.splice(i, 1);
					break;
				} else {
					listeners.splice(i, 1);
				}
			}
		}
	};
	
	EventTarget.prototype.stopPropagation = function() {
		this._bubble = false;
	};
	
	O.EventTarget = EventTarget;

})(Orange);