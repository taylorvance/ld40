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
	size: 20
});

var Coin = Sandbox.extendVehicle("Coin", {
	maxSpeed: 150,
	maxForce: 5,
	mass: 1,
	perception: 1000,
	leeway: 500,
	color: '#ff0',
	size: 10
});


// set up vehicle instances

var player = Sandbox.createVehicle(Player, new Vector(canvas.width / 2, canvas.height / 2));

var coins = [];
for (var i = 0, n = 50; i < n; i++) {
	coins.push(Sandbox.createVehicle(Coin, new Vector(Math.random() * canvas.width, Math.random() * canvas.height)));
}


//.draw twinkles n stuff
//Coin.draw = function() {
	//ctx.save();
	//ctx.fillStyle = '#00c';
	//ctx.fillRect(this.position.x, this.position.y, 3, 3);
	//ctx.restore();
//};


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
});


// coin logic
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;

	coins.forEach(function(coin){
		var force = new Vector;

		force = force.add(coin.flock(coin.neighbors(coins), 10, 5, 4).scale(3));
		force = force.add(coin.pursue(player).scale(2));

		coin.applyForce(force, dt);

		// wrap around canvas
		if(coin.position.x < 0) coin.position.x = canvas.width;
		else if(coin.position.x > canvas.width) coin.position.x = 0;
		else if(coin.position.y < 0) coin.position.y = canvas.height;
		else if(coin.position.y > canvas.height) coin.position.y = 0;
	});
});


// coin spawner
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;
});


// render code
Sandbox.addUpdateFunction(function(){
	ctx.fillStyle = '#0ff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	Sandbox.vehicles.forEach(function(v){
		v.draw();
	});
});


// start the update loop
Sandbox.play();
