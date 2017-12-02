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
	if(typeof this.num_coins !== "number") this.num_coins = 0;
	this.num_coins++;

	for (var i=0, len=coins.length; i<len; i++) {
		if (coins[i] === coin) {
			coins.splice(i, 1);
			break;
		}
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
Dragon.prototype.maxCoins = 5;
Dragon.prototype.draw = function(){
	ctx.save();

	if(this.isMad) {
		var madSize = 1.2 * this.size;
		ctx.fillStyle = '#f00';
	ctx.fillRect(this.position.x-madSize/2, this.position.y-madSize/2, madSize, madSize);
	}

	ctx.fillStyle = this.color;
	ctx.fillRect(this.position.x-this.size/2, this.position.y-this.size/2, this.size, this.size);

	var yellowSize = 0.8 * (this.size * this.num_coins / this.maxCoins);
	ctx.fillStyle = '#ff0';
	ctx.fillRect(this.position.x-yellowSize/2, this.position.y-yellowSize/2, yellowSize, yellowSize);

	ctx.restore();
};
Dragon.prototype.die = function(){
	// drop coins
	var xmin = this.position.x-this.size*2;
	var xmax = this.position.x+this.size*2;
	var ymin = this.position.y-this.size*2;
	var ymax = this.position.y+this.size*2;
	for (var i=0, len=parseInt(this.num_coins); i<len; i++) {
		var x = Math.random() * (xmax - xmin) + xmin;
		var y = Math.random() * (ymax - ymin) + ymin;
		spawnCoin(x, y);
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
	console.log('killed dragon' + i);
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
	dragon.num_coins = 0;

	dragons.push(dragon);
};


// set up player
var player = Sandbox.createVehicle(Player, new Vector(canvas.width / 2, canvas.height / 2));
player.num_coins = 0;


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
var playerPadding = player.size * 0.8;
var playerxmin = playerPadding;
var playerxmax = canvas.width - playerPadding;
var playerymin = playerPadding;
var playerymax = canvas.height - playerPadding;
Sandbox.addUpdateFunction(function(){
	var dt = Sandbox.deltaTime;

	//player.applyForce(player.arrive(clickPos), dt);
	player.applyForce(player.seek(player.position.add(arrows)), dt);

	// collect coins
	var closeCoin = player.findClosestCoin();
	if(typeof closeCoin === "object" && closeCoin.sqrDist(player.position) < Math.pow(player.size,2)) {
		player.gatherCoin(closeCoin);
		updateGUI(); // update score

		// spawn a new coin every time the player (but not a dragon) picks one up
		spawnCoin();

		// spawn a dragon for every 5 coins gathered
		if(player.num_coins % 5 === 0) {
			Dragon.spawnRandom();
		}
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
			force = force.add(dragon.pursue(player).scale(9));
		} else {
			dragon.isMad = false;
		}

		// seek coins if they don't have max
		if(dragon.num_coins < dragon.maxCoins) {
			if(typeof dragon.targetCoin !== "object") {
				dragon.targetCoin = dragon.findClosestCoin();
			}
			if(typeof dragon.targetCoin === "object") {
				if(dragon.targetCoin.sqrDist(dragon.position) < Math.pow(dragon.size, 2)) {
					dragon.gatherCoin(dragon.targetCoin);
					dragon.targetCoin = undefined;
				}

				force = force.add(dragon.arrive(dragon.targetCoin).scale(5));
			}
		}

		// separate from other dragons
		force = force.add(dragon.separate(dragon.neighbors(dragons)).scale(5));
		// if dragons get too close to each other, they die
		dragons.forEach(function(dragon2){
			if(dragon2 === dragon) return;
			if(dragon.position.sqrDist(dragon2.position) < Math.pow(dragon.size/2, 2)) {
				for (var i=0, len=dragons.length; i<len; i++) {
					if (dragons[i] === dragon) {
						dragon.die();
					} else if (dragons[i] === dragon2) {
						dragon2.die();
					}
				}
			}
		});

		// slightly prefer center screen
		force = force.add(dragon.arrive(new Vector(canvas.width/2, canvas.height/2)).scale(0.2));

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
var updateGUI = function(){
	scoreDiv.innerHTML = "Score: " + player.num_coins;
};

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


// more game code
Sandbox.addUpdateFunction(function(){
	// each second and for each dragon, there's a 5% chance a coin with spawn
	if(Math.random() < 0.05 * dragons.length * Sandbox.deltaTime) {
		spawnCoin();
	}

	if(coins.length <= 0) {
		gameOver("Coins gone!");
	}
});


function gameOver(msg) {
	msg = msg || "";
	Sandbox.pause();
	if(confirm("GAME OVER!\n" + msg + "\nScore: " + player.num_coins)) {
		location.reload();
	}
}


// start the update loop when the page loads
Sandbox.play();
updateGUI();
