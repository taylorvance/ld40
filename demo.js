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
	drawTriangle(this.position, this.size, this.velocity.angle2(new Vector(1, 0)), this.color);
	//ctx.save();
	//ctx.fillStyle = this.color;
	//ctx.fillRect(this.position.x-this.size/2, this.position.y-this.size/2, this.size, this.size);
	//ctx.restore();
};

// draw helpers
var drawTriangle = function(center, radius, angle, color) {
	ctx.save();
	ctx.translate(center.x, center.y);
	ctx.rotate(angle);
	ctx.beginPath();
	ctx.moveTo(0, -radius);
	ctx.lineTo(radius/2, radius/2);
	ctx.lineTo(-radius/2, radius/2);
	ctx.lineTo(0, -radius);
	//ctx.stroke();
	ctx.fillStyle = color || '#000';
	ctx.fill();
	ctx.restore();
};
var drawHexagon = function(center, radius, angle, color) {
	ctx.save();
	ctx.translate(center.x, center.y);
	ctx.rotate(parseInt(angle));
	ctx.beginPath();
	ctx.moveTo(radius, 0);
	ctx.lineTo(radius/2, -0.866*radius);
	ctx.lineTo(-radius/2, -0.866*radius);
	ctx.lineTo(-radius, 0);
	ctx.lineTo(-radius/2, 0.866*radius);
	ctx.lineTo(radius/2, 0.866*radius);
	ctx.lineTo(radius, 0);
	//ctx.stroke();
	ctx.fillStyle = color || '#000';
	ctx.fill();
	ctx.restore();
};


// additional code for locating and gathering coins (player and dragon)
Vehicle.prototype.findClosestCoin = function() {
	var minSqrD = Infinity;
	var closeCoin;

	coins.forEach(function(coin){
		var sqrD = this.position.sqrDist(coin);
		if(sqrD < minSqrD) {
			minSqrD = sqrD;
			closeCoin = coin;
		}
	}, this);

	return closeCoin;
};
Vehicle.prototype.gatherCoin = function(coin) {
	if(typeof this.numCoins !== "number") this.numCoins = 0;
	this.numCoins++;

	for (var i=0, len=coins.length; i<len; i++) {
		if (coins[i] === coin) {
			coins.splice(i, 1);
			updateGUI();
			break;
		}
	}

	if(coins.length <= 0) {
		gameOver("Coins gone!");
	}
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
	maxForce: 5,
	mass: 1,
	perception: 300,
	leeway: 200,
	color: '#0f0',
	size: 32
});
Dragon.prototype.maxCoins = 10;
Dragon.prototype.draw = function(){
	var rotation = this.velocity.angle2(new Vector(1, 0));

	// draw mad red outline
	if(this.isMad) {
		var madSize = 1.5 * this.size;
		drawTriangle(this.position, madSize, rotation, '#f00');
	}

	// draw regular green dragon
	drawTriangle(this.position, this.size, rotation, this.color);

	// draw hoard
	var yellowSize = 0.8 * (this.size/2 * this.numCoins / this.maxCoins);
	drawHexagon(this.position, yellowSize, rotation, '#ff0');
	//for (var i=0; i<this.numCoins; i++) {
		//var x = Math.random() * (this.position.x+10 - this.position.x-10) + this.position.x-10;
		//var y = Math.random() * (this.position.y+10 - this.position.y-10) + this.position.y-10;
		//drawHexagon(new Vector(x, y), coinSize, rotation, '#ff0');
	//}
};

var dragons = [];
var dragonMargin = 100;
Dragon.spawnRandom = function(){
	var x, y;
	if(Math.random() < 0.25) {
		// top
		x = Math.random() * canvas.width;
		y = -dragonMargin;
	} else if(Math.random() < 0.5) {
		// bottom
		x = Math.random() * canvas.width;
		y = canvas.height + dragonMargin;
	} else if(Math.random() < 0.75) {
		// left
		x = -dragonMargin;
		y = Math.random() * canvas.height;
	} else {
		// right
		x = canvas.width + dragonMargin;
		y = Math.random() * canvas.height;
	}

	var dragon = Sandbox.createVehicle(Dragon, new Vector(x, y));
	dragon.numCoins = 0;

	dragons.push(dragon);
};
var dragonsSlain = 0;
Dragon.prototype.die = function(){
	// drop coins
	var radius = 3;
	var xmin = this.position.x - this.size * radius;
	var xmax = this.position.x + this.size * radius;
	var ymin = this.position.y - this.size * radius;
	var ymax = this.position.y + this.size * radius;
	for (var i=0, len=parseInt(this.numCoins); i<len; i++) {
		// on avg, drop 90% of the coins
		if(Math.random() < 0.9) {
			var x = Math.random() * (xmax - xmin) + xmin;
			var y = Math.random() * (ymax - ymin) + ymin;
			spawnCoin(x, y);
		}
	}

	// remove from dragons array
	for (var i=0, len=dragons.length; i<len; i++) {
		if (dragons[i] === this) {
			dragons.splice(i, 1);
			break;
		}
	}

	// remove from Sandbox.vehicles array
	Sandbox.destroyVehicle(this);

	// celebrate
	dragonsSlain++;
	updateGUI();
};


// set up player
var player = Sandbox.createVehicle(Player, new Vector(canvas.width / 2, canvas.height / 2));
player.numCoins = 0;


// input handling

var clickPos = new Vector;
canvas.addEventListener("click", function(event){
	clickPos.x = event.clientX;
	clickPos.y = event.clientY;
});

var movement = new Vector;
window.addEventListener("keydown", function(e){
	e = e || window.event;
	if (e.keyCode==37 || e.keyCode==65) movement.x = -1; // left or a
	else if(e.keyCode==39 || e.keyCode==68) movement.x = 1; // right or d
	else if(e.keyCode==38 || e.keyCode==87) movement.y = -1; // up or w
	else if(e.keyCode==40 || e.keyCode==83) movement.y = 1; // down or s
}, true);
window.addEventListener("keyup", function(e){
	e = e || window.event;
	if (e.keyCode==37 || e.keyCode==39 || e.keyCode==65 || e.keyCode==68) movement.x = 0;
	else if(e.keyCode==38 || e.keyCode==40 || e.keyCode==87 || e.keyCode==83) movement.y = 0;
}, true);


// player logic
var playerPadding = player.size * 0.8;
var playerxmin = playerPadding;
var playerxmax = canvas.width - playerPadding;
var playerymin = playerPadding;
var playerymax = canvas.height - playerPadding;
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;

	//player.applyForce(player.arrive(clickPos), dt);
	player.applyForce(player.seek(player.position.add(movement)), dt);

	// collect coins
	var closeCoin = player.findClosestCoin();
	if(typeof closeCoin === "object" && closeCoin.sqrDist(player.position) < Math.pow(player.size,2)) {
		player.gatherCoin(closeCoin);

		// 90% chance of spawning a new coin every time the player picks one up
		if(Math.random() < 0.9) spawnCoin();

		// spawn a dragon for every 5 coins gathered
		if(player.numCoins % 5 === 0) {
			Dragon.spawnRandom();
		}

		updateGUI(); // update score
	}

	// set bounds
	if(player.position.x < playerxmin) player.position.x = playerxmin;
	else if(player.position.x > playerxmax) player.position.x = playerxmax;
	else if(player.position.y < playerymin) player.position.y = playerymin;
	else if(player.position.y > playerymax) player.position.y = playerymax;
});


// dragon logic
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;

	dragons.forEach(function(dragon){
		var force = new Vector;

		// pursue player
		var sqrD = dragon.position.sqrDist(player.position);
		if(sqrD < Math.pow(dragon.perception, 2)) {
			if(sqrD < Math.pow(dragon.size/2, 2)) {
				gameOver("Dragon touched you!");
			}
			dragon.isMad = true;
			force = force.add(dragon.pursue(player).scale(8));
		} else {
			dragon.isMad = false;
		}

		// gather coins
		if(typeof dragon.targetCoin !== "object") {
			dragon.targetCoin = dragon.findClosestCoin();
		}
		if(typeof dragon.targetCoin === "object") {
			if(dragon.targetCoin.sqrDist(dragon.position) < Math.pow(dragon.size, 2)) {
				dragon.gatherCoin(dragon.targetCoin);
				dragon.targetCoin = undefined;
				updateGUI(); // update gold on field count
			} else {
				force = force.add(dragon.arrive(dragon.targetCoin).scale(3));
			}
		}

		// separate from other dragons
		force = force.add(dragon.separate(dragon.neighbors(dragons)).scale(4));
		// if dragons get too close to each other, they die
		dragons.forEach(function(dragon2){
			if(dragon2 === dragon) return;
			if(dragon.position.sqrDist(dragon2.position) < Math.pow(dragon.size*0.75, 2)) {
				dragon.die();
				dragon2.die();
			}
		});

		// slightly prefer center screen
		force = force.add(dragon.arrive(new Vector(canvas.width/2, canvas.height/2)).scale(0.5));

		dragon.applyForce(force, dt);
	});
});


// coin spawner
var coins = [];

var coinPadding = 20;
var coinxmin = coinPadding;
var coinxmax = canvas.width - coinPadding;
var coinymin = coinPadding;
var coinymax = canvas.height - coinPadding;
var spawnCoin = function(x, y) {
	x = x || Math.random() * (coinxmax - coinxmin) + coinxmin;
	y = y || Math.random() * (coinymax - coinymin) + coinymin;
	var coin = new Vector(x, y);
	coins.push(coin);
	return coin;
};
for (var i=0; i<50; i++) {
	spawnCoin();
}


// render code

var scoreDiv = document.getElementById('score');
var scoreText = "";
var updateGUI = function(){
	scoreText = "Gold collected: " + player.numCoins;
	scoreText += "<br>Gold on the field: " + coins.length;
	scoreText += "<br>Dragons slain: " + dragonsSlain;
	scoreDiv.innerHTML = scoreText;
};

var coinSize = 4;
Sandbox.addUpdateFunction(function(){
	ctx.save();
	ctx.fillStyle = '#0ff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();

	Sandbox.vehicles.forEach(function(v){
		v.draw();
	});

	//ctx.save();
	//ctx.fillStyle = '#ff0';
	coins.forEach(function(coin){
		//ctx.fillRect(coin.x-coinSize/2, coin.y-coinSize/2, coinSize, coinSize);
		drawHexagon(coin, coinSize, 0, '#ff0');
	});
	//ctx.restore();
});


// more game code
Sandbox.addUpdateFunction(function(){
	// on avg, for each second, for each dragon, there's a 1% chance a coin will spawn
	if(Math.random() < 0.01 * dragons.length * Sandbox.deltaTime) {
		spawnCoin();
	}
});


function gameOver(msg) {
	msg = msg || "";
	Sandbox.pause();
	if(confirm("GAME OVER!\n" + msg + "\n" + scoreText.replace(/<br[^>]*>/gi, "\n"))) {
		location.reload();
	}
}


// start the update loop when the page loads
Sandbox.play();
updateGUI();
