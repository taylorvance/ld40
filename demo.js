var Vector = Sandbox.Vector;
var Vehicle = Sandbox.Vehicle;


// set up html canvas
var canvas = document.getElementById('canvas');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
var ctx = canvas.getContext('2d');


// default vehicle render code

Vehicle.prototype.color = '#ccc';
Vehicle.prototype.size = 2;
Vehicle.prototype.draw = function() {
	ctx.save();
	ctx.fillStyle = this.color;
	ctx.fillRect(this.position.x-this.size/2, this.position.y-this.size/2, this.size, this.size);
	ctx.restore();
};


// configure classes

var Player = Sandbox.extendVehicle("Player", {
	maxSpeed: 200,
	maxForce: 20,
	mass: 1,
	perception: 500,
	leeway: 50,
	color: '#f0f',
	size: 16
});

var Dragon = Sandbox.extendVehicle("Dragon", {
	maxSpeed: 500,
	maxForce: 3,
	mass: 1,
	perception: 1000,
	leeway: 100,
	color: '#0f0',
	size: 32
});


// set up vehicle instances

var player = Sandbox.createVehicle(Player, new Vector(canvas.width / 2, canvas.height / 2));

var dragons = [];
for (var i=0; i<5; i++) {
	dragons.push(Sandbox.createVehicle(Dragon, new Vector(Math.random() * canvas.width, Math.random() * canvas.height)));
}


// input handling

var clickPos = new Vector;
canvas.addEventListener("click", function(event){
	clickPos.x = event.clientX;
	clickPos.y = event.clientY;
});

var arrows = new Vector;
window.addEventListener("keydown", function(e){
	e = e || window.event;
	if (e.keyCode == 37) arrows.x = -1;
	else if(e.keyCode == 39) arrows.x = 1;
	else if(e.keyCode == 38) arrows.y = -1;
	else if(e.keyCode == 40) arrows.y = 1;
}, true);
window.addEventListener("keyup", function(e){
	e = e || window.event;
	if (e.keyCode==37 || e.keyCode==39) arrows.x = 0;
	else if(e.keyCode==38 || e.keyCode==40) arrows.y = 0;
}, true);


// player logic
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;

	//player.applyForce(player.arrive(clickPos), dt);
	player.applyForce(player.seek(player.position.add(arrows)), dt);

	//TODO: collect coins
});


// dragon logic
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;

	dragons.forEach(function(dragon){
		var force = new Vector;

		force = force.add(dragon.flock(dragon.neighbors(dragons), 6, 5, 4).scale(4));
		force = force.add(dragon.pursue(player).scale(5));

		dragon.applyForce(force, dt);

		// wrap around canvas
		//if(coin.position.x < 0) coin.position.x = canvas.width;
		//else if(coin.position.x > canvas.width) coin.position.x = 0;
		//else if(coin.position.y < 0) coin.position.y = canvas.height;
		//else if(coin.position.y > canvas.height) coin.position.y = 0;
	});
});


// coin spawner
var coins = [];
for (var i=0; i<20; i++) {
	coins.push(new Vector(Math.random() * canvas.width, Math.random() * canvas.height));
}
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;
});


// render code
var coinSize = 8;
Sandbox.addUpdateFunction(function(){
	ctx.fillStyle = '#0ff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	Sandbox.vehicles.forEach(function(v){
		v.draw();
	});

	ctx.save();
	ctx.fillStyle = '#ff0';
	coins.forEach(function(coin){
		ctx.fillRect(coin.x-coinSize/2, coin.y-coinSize/2, coinSize, coinSize);
	});
	ctx.restore();
});


// start the update loop when the page loads
Sandbox.play();
