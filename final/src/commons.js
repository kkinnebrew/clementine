/**
 * commons.js | Orange Commons 1.0.2
 * @date 7.21.2011
 * @author Kevin Kinnebrew
 * @dependencies none (socket.io if using websockets)
 * @description base library classes
 */

(function() {

	var Orange, Ajax, Browser, Cache, Class, Element, Events, EventTarget, Loader, Location, Log, Socket, Storage;

	Orange 					= this.Orange = {};
  Orange.version 	= '1.0.2';
	Orange.__import = this.__import = __import;
	Orange.modules 	= {};

	Orange.add = add;
	Orange.use = use;
	Orange.namespace = namespace;

  Orange.Ajax 				= Ajax;
	Orange.Browser 			= Browser;
	Orange.Cache 				= Cache;
	Orange.Class 				= this.Class = Class;
	Orange.Element 			= Element;
	Orange.Events 			= Events;
  Orange.EventTarget 	= EventTarget;	
	Orange.Loader 			= Loader;
	Orange.Location 		= Location;
  Orange.Log 					= this.Log = Log;  
  Orange.Socket 			= Socket;
  Orange.Storage 			= Storage;	

}).call(this);