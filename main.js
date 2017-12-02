var Vector = require("vector-js");
var Vehicle = require("vehicle-js");


//.is there a better way to access this from front end and unit tests?
global.Sandbox = {
	Vector: Vector,
	Vehicle: Vehicle
};


Sandbox.vehicleSubclasses = {};
Sandbox.extendVehicle = function(name, config) {
	config = config || {};

	Sandbox.vehicleSubclasses[name] = function(pos, vel) {
		Vehicle.call(this, pos, vel);
	};
	Sandbox.vehicleSubclasses[name].prototype = new Vehicle;

	Sandbox.vehicleSubclasses[name].prototype.maxSpeed = config.maxSpeed || 200;
	Sandbox.vehicleSubclasses[name].prototype.maxForce = config.maxForce || 20;
	Sandbox.vehicleSubclasses[name].prototype.mass = config.mass || 1;
	Sandbox.vehicleSubclasses[name].prototype.perception = config.perception || 50;
	Sandbox.vehicleSubclasses[name].prototype.leeway = config.leeway || 10;
	Sandbox.vehicleSubclasses[name].prototype.color = config.color || '#c00';
	Sandbox.vehicleSubclasses[name].prototype.size = config.size || 2;

	return Sandbox.vehicleSubclasses[name];
};



Sandbox.vehicles = [];
/**
 * @param {(string|Vehicle)} vehicleSubclass The name of the subclass, or the actual class object.
 * @param {Vector} pos Vehicle's position.
 * @param {Vector} vel Vehicle's velocity.
 */
Sandbox.createVehicle = function(vehicleSubclass, pos, vel) {
	// If we're given a string, see if we've defined a subclass with that name.
	if(typeof vehicleSubclass === "string") {
		vehicleSubclass = Sandbox.vehicleSubclasses[vehicleSubclass];
	}
	//.this won't work if the subclass does not directly extend Vehicle (2nd gen subclass)
	if(typeof vehicleSubclass !== "function" || vehicleSubclass.prototype.constructor.name !== "Vehicle") {
		console.error("Failed to create vehicle. First argument is not a subclass of Vehicle.", vehicleSubclass);
		return false;
	}

	var vehicle = new vehicleSubclass(pos, vel);
	Sandbox.vehicles.push(vehicle);

	return vehicle;
};


var updateFns = [];
Sandbox.addUpdateFunction = function(fn) {
	updateFns.push(fn);
};


//.make a Sandbox setter. when it's changed, restart the interval (pause/play)
var FPS = 30;

var lastUpdate;
Sandbox.deltaTime = 1;
var update = function() {
	var now = Date.now();
	Sandbox.deltaTime = (now - lastUpdate) / 1000;
	lastUpdate = now;

	if(document.hasFocus()) {
		updateFns.forEach(function(fn){
			fn();
		});
	}
};


var intervalID;
Sandbox.play = function() {
	Sandbox.pause();
	lastUpdate = Date.now();
	intervalID = setInterval(update, 1000/FPS);
};
Sandbox.pause = function() {
	clearInterval(intervalID);
};
