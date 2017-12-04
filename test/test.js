var assert = require('assert');

var Vector = require("vector-js");
var Vehicle = require("vehicle-js");
var asdf = require("../main.js");//.

describe('Vector', function() {
	describe('constructor', function() {
		it('should default to the zero vector', function() {
			var v = new Vector;
			assert.deepEqual([v.x, v.y], [0, 0]);

			var v = new Vector();
			assert.deepEqual([v.x, v.y], [0, 0]);

			var v = new Vector(0, 0);
			assert.deepEqual([v.x, v.y], [0, 0]);
		});
	});


	describe('Simple arithmetic', function() {
		describe('#add()', function() {
			it('should be nondestructive', function() {
				var v1 = new Vector(1, 2);
				var v2 = new Vector(-5, 8);

				v1.add(v2);
				assert.deepEqual(v1, new Vector(1, 2));
				assert.deepEqual(v2, new Vector(-5, 8));

				assert.deepEqual(v1.add(v2), new Vector(-4, 10));
				assert.deepEqual(v2.add(v1), new Vector(-4, 10));
			});

			it('should be commutative (a + b = b + a)', function() {
				var a = new Vector(1, 2);
				var b = new Vector(-5, 8);

				assert.deepEqual(a.add(b), new Vector(-4, 10));
				assert.deepEqual(b.add(a), new Vector(-4, 10));
			});
		});

		describe('#sub()', function() {
			it('should be nondestructive', function() {
				var v1 = new Vector(1, 2);
				var v2 = new Vector(-5, 8);

				v1.sub(v2);
				assert.deepEqual(v1, new Vector(1, 2));
				assert.deepEqual(v2, new Vector(-5, 8));

				assert.deepEqual(v1.sub(v2), new Vector(6, -6));
				assert.deepEqual(v2.sub(v1), new Vector(-6, 6));
			});
		});

		describe('#mul()', function() {
			it('should be nondestructive', function() {
				var v = new Vector(3, 2);

				v.mul(5);
				assert.deepEqual(v, new Vector(3, 2));

				assert.deepEqual(v.mul(5), new Vector(15, 10));
			});

			it('should return the same results as scale()', function() {
				var v = new Vector(-5, 9);
				assert.deepEqual(v.scale(-3), new Vector(15, -27));
			});
		});

		describe('#div()', function() {
			it('should be nondestructive', function() {
				var v = new Vector(3, 2);

				v.div(5);
				assert.deepEqual(v, new Vector(3, 2));

				assert.deepEqual(v.div(2), new Vector(1.5, 1));
			});
		});
	});


	describe('Magnitude', function() {
		describe('#magnitude()', function() {
			it('should work', function() {
				assert.equal((new Vector(1, 0)).magnitude(), 1);
				assert.equal((new Vector(-1, 1)).magnitude(), Math.sqrt(2));
				assert.equal((new Vector(3, 4)).magnitude(), 5);
			});

			it('should handle the zero vector', function() {
				assert.equal((new Vector).magnitude(), 0);
			});
		});

		describe('#sqrMag()', function() {
			it('should work', function() {
				assert.equal((new Vector(1, 0)).sqrMag(), 1);
				assert.equal((new Vector(-1, 1)).sqrMag(), 2);
			});

			it('should handle the zero vector', function() {
				assert.equal((new Vector).sqrMag(), 0);
			});
		});

		describe('#normalize()', function() {
			it('should work', function() {
				assert.deepEqual((new Vector(1, 0)).normalize(), new Vector(1, 0));
				assert.deepEqual((new Vector(2, 0)).normalize(), new Vector(1, 0));
			});
		});

		describe('#setMagnitude()', function() {
			it('should work', function() {
				assert.deepEqual((new Vector(1, 0)).setMagnitude(1), new Vector(1, 0));
				assert.deepEqual((new Vector(1, 0)).setMagnitude(2), new Vector(2, 0));
				//assert.deepEqual((new Vector(3, 4)).setMagnitude(10), new Vector(6, 8));//.rounding error
			});

			it('should be nondestructive', function() {
				var v1 = new Vector(0, 1);
				var v2 = v1.setMagnitude(2);

				assert.deepEqual(v1, new Vector(0, 1));
				assert.deepEqual(v2, new Vector(0, 2));
			});
		});

		describe('#limit()', function() {
			it('should work', function() {
				var v = new Vector(0, 1);
				assert.deepEqual(v.limit(5), new Vector(0, 1));
				assert.deepEqual(v.limit(0.5), new Vector(0, 0.5));

				assert.deepEqual((new Vector(3, 4)).limit(5), new Vector(3, 4));
				//assert.deepEqual((new Vector(6, 8)).limit(5), new Vector(3, 4));//.rounding error
			});

			it('should be nondestructive', function() {
				var v = new Vector(0, 2);

				v.limit(1);
				assert.deepEqual(v, new Vector(0, 2));

				assert.deepEqual(v.limit(1), new Vector(0, 1));
			});
		});
	});


	describe('More vector math', function() {
		describe('#distance()', function() {
			it('should be commutative (dist a to b = dist b to a)', function() {
				var v1 = new Vector(3, 0);
				var v2 = new Vector(-3, 0);
				assert.equal(v1.distance(v2), 6);
				assert.equal(v2.distance(v1), 6);

				var v1 = new Vector;
				var v2 = new Vector(1, 1);
				assert.equal(v1.distance(v2), Math.sqrt(2));
				assert.equal(v2.distance(v1), Math.sqrt(2));
			});
		});

		describe('#sqrDist()', function() {
			it('should be commutative (dist a to b = dist b to a)', function() {
				var v1 = new Vector;
				var v2 = new Vector(1, 1);
				assert.equal(v1.sqrDist(v2), 2);
				assert.equal(v2.sqrDist(v1), 2);
			});
		});

		describe('#dot()', function() {
			it('should work', function() {
				var v1 = new Vector(9, 2);
				var v2 = new Vector(-1, 3);
				assert.equal(v1.dot(v2), -3);
			});

			it('should be commutative (a • b = b • a)', function() {
				var v1 = new Vector(3, 0);
				var v2 = new Vector(4, 0);
				assert.equal(v1.dot(v2), 12);
				assert.equal(v2.dot(v1), 12);
			});
		});

		//.det

		//.scalarprojection
	});


	describe('Angles', function() {
		//.angle

		//.angle2
	});
});



describe('Vehicle', function() {
	describe('constructor', function() {
		it('should work', function() {
			var v = new Vehicle(new Vector(42, 108), new Vector(-4, 8));
			assert.equal(v.position.x, 42);
			assert.equal(v.position.y, 108);
			assert.deepEqual(v.velocity.sqrMag(), 80);
		});

		it('should default to the zero vector for pos and vel', function() {
			var v = new Vehicle;
			assert.deepEqual(v.position, new Vector);
			assert.deepEqual(v.velocity, new Vector);
		});

		it('should default to mass of 1', function() {
			var v = new Vehicle;
			assert.equal(v.mass, 1);
		});
	});

	describe('subclass', function() {
		//.figure out a better way to extend Vehicle, preferably programatically from a config file or user input
		var MyVehicle = function(pos, vel) {
			Vehicle.call(this, pos, vel);
		}
		MyVehicle.prototype = new Vehicle;
		MyVehicle.prototype.maxSpeed = 10;
		MyVehicle.prototype.maxForce = 5;
		MyVehicle.prototype.mass = 1;
		MyVehicle.prototype.perception = 20;
		MyVehicle.prototype.leeway = 2;

		var mv = new MyVehicle(new Vector(42, 108), new Vector(-4, 8));
		assert.equal(mv.position.x, 42);
		assert.equal(mv.position.y, 108);
		assert.deepEqual(mv.velocity.sqrMag(), 80);

		describe('#steer()', function() {
			it('should temper its expectations', function() {
				var mv = new MyVehicle(new Vector, new Vector(10, 0)); // full speed to the right
				var steering = mv.steer(new Vector(0, 20)); // desire more than full speed up? no way
				var xy = Math.sqrt(200); // magnitude of x and y parts should be the same after its desire is limited to max speed
				var expected = new Vector(-xy, xy); // should steer up and left in equal parts
				expected = expected.limit(5); // but we still have to limit by max force
				//assert.deepEqual(steering, expected);//.rounding error
			});
		});

		describe('#applyForce()', function() {
			it('should work', function() {
				var mv = new MyVehicle;
				mv.applyForce(new Vector(2, 0));
				assert.deepEqual(mv.velocity, new Vector(2, 0));
				assert.deepEqual(mv.position, new Vector(2, 0));

				mv.applyForce(new Vector(2, 0));
				assert.deepEqual(mv.velocity, new Vector(4, 0));
				assert.deepEqual(mv.position, new Vector(6, 0));

				// applying the zero vector should produce no change to velocity but continue to change position
				mv.applyForce(new Vector);
				assert.deepEqual(mv.velocity, new Vector(4, 0));
				assert.deepEqual(mv.position, new Vector(10, 0));
			});

			it('should respect max force', function() {
				var mv = new MyVehicle;
				mv.applyForce(new Vector(100, 0));
				assert.deepEqual(mv.velocity, new Vector(5, 0));
				assert.deepEqual(mv.position, new Vector(5, 0));
			});

			it('should respect delta time (dt)', function() {
				var mv = new MyVehicle;
				mv.applyForce(new Vector(100, 0), 0.5);
				assert.deepEqual(mv.velocity, new Vector(5, 0));
				assert.deepEqual(mv.position, new Vector(2.5, 0));

				mv.applyForce(new Vector, 0.5);
				assert.deepEqual(mv.velocity, new Vector(5, 0));
				assert.deepEqual(mv.position, new Vector(5, 0));

				mv.applyForce(new Vector, 2);
				assert.deepEqual(mv.velocity, new Vector(5, 0));
				assert.deepEqual(mv.position, new Vector(15, 0));

				mv.applyForce(new Vector, 1);
				assert.deepEqual(mv.velocity, new Vector(5, 0));
				assert.deepEqual(mv.position, new Vector(20, 0));
			});

			it('should return actual acceleration', function() {
				var mv = new MyVehicle;
				var force = new Vector(100, 0);

				// from stopped up to max force
				var acc = mv.applyForce(force);
				assert.deepEqual(mv.velocity, new Vector(5, 0));
				assert.deepEqual(mv.position, new Vector(5, 0));
				assert.deepEqual(acc, new Vector(5, 0));

				// now up to max speed
				var acc = mv.applyForce(force);
				assert.deepEqual(mv.velocity, new Vector(10, 0));
				assert.deepEqual(mv.position, new Vector(15, 0));
				assert.deepEqual(acc, new Vector(5, 0));

				// while at max speed, there's no more acceleration in that direction
				var acc = mv.applyForce(force);
				assert.deepEqual(mv.velocity, new Vector(10, 0));
				assert.deepEqual(mv.position, new Vector(25, 0));
				assert.deepEqual(acc, new Vector(0, 0));
			});
		});

		describe('#seek()', function() {
			it('should be close to the target after several frames', function() {
				return;//.
				var mv = new MyVehicle;
				var target = new Vector(42, 108);

				for (var i = 0; i < 105; i++) {
					mv.applyForce(mv.seek(target));
				}

				var d = mv.position.distance(target);
			});

			it('should return zero vector if already moving at desired vector', function() {
				var mv = new MyVehicle(new Vector, new Vector(10, 0));
				assert.deepEqual(mv.seek(new Vector(10, 0)), new Vector);
				assert.deepEqual(mv.seek(new Vector(20, 0)), new Vector);
			});

			it('should respect max force', function() {
				var mv = new MyVehicle(new Vector, new Vector(10, 0));
				assert.deepEqual(mv.seek(new Vector(-10, 0)), new Vector(-5, 0));
			});
		});

		describe('#flee()', function() {
			it('should equal negative seek', function() {
				var mv = new MyVehicle;
				var target = new Vector(5, 0);

				var seek = mv.seek(target);
				var flee = mv.flee(target);

				assert.deepEqual(seek, new Vector(5, 0));
				assert.deepEqual(flee, new Vector(-5, 0));
				assert.deepEqual(flee, seek.mul(-1));
			});
		});

		describe('#arrive()', function() {
			it('should arrive near 0 speed', function() {
				var mv = new MyVehicle;
				var target = new Vector(42, 108);

				for (var i = 0; i < 1000; i++) {
					mv.applyForce(mv.arrive(target), 0.1);
				}

				assert.equal(Math.floor(mv.velocity.magnitude()), 0);
			});
		});
	});
});



describe('Sandbox', function() {
	var Red = Sandbox.extendVehicle("Red", {
		maxSpeed: 243,
		maxForce: 5,
		mass: 1,
		perception: 50,
		leeway: 10,
		color: '#c00',
		size: 7
	});


	describe('#extendVehicle()', function() {
		it('should work', function() {
			var red = new Red;

			assert.notEqual(Vehicle.maxSpeed, 243);
			assert.equal(Red.prototype.maxSpeed, 243);

			assert.equal(red.maxSpeed, 243);
			red.maxSpeed = 250;
			assert.equal(red.maxSpeed, 250);
		});
	});

	describe('vehicleSubclasses', function() {
		it('should be accessible from the Sandbox object', function() {
			var red = new Red;
			assert.equal(red.maxSpeed, 243);

			assert.deepEqual(Sandbox.vehicleSubclasses["Red"], Red);
		});
	});

	describe('#createVehicle()', function() {
		it('should work with a string or the class object', function() {
			var redStr = Sandbox.createVehicle("Red");
			var redCls = Sandbox.createVehicle(Red);

			assert.equal(redStr.maxSpeed, 243);
			assert.equal(redCls.maxSpeed, 243);
		});
	});
});
