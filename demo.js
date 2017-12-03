var Vector = Sandbox.Vector;
var Vehicle = Sandbox.Vehicle;


// some variables
var CHANCE_OF_GOLD_RESPAWN_AFTER_PLAYER_COLLECTS_ONE = 0.5;
var PERCENT_OF_DRAGON_HOARD_RECOVERABLE = 1;
var CHANCE_OF_GOLD_RANDOMLY_SPAWNING_PER_DRAGON_PER_SECOND = 0.05;


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
Vehicle.prototype.drawSprite = function(img, size, rotation) {
	ctx.save();
	ctx.translate(this.position.x, this.position.y);
	ctx.rotate(rotation);
	ctx.drawImage(img, -size/2, -size/2, size, size);
	ctx.restore();
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
	ctx.stroke();
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
	ctx.stroke();
	ctx.fillStyle = color || '#000';
	ctx.fill();
	ctx.restore();
};
var drawCircle = function(center, radius, color) {
	ctx.save();
	//ctx.translate(center.x, center.y);
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
	ctx.stroke();
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
	//color: '#f0f',
	color: '#00daff',
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
var dragonImg = new Image();
dragonImg.src = 'art/dragon.png';
var madDragonImg = new Image();
madDragonImg.src = 'art/dragon-mad.png';
Dragon.prototype.draw = function(){
	var rotation = this.velocity.angle2(new Vector(1, 0));

	// draw mad red outline
	if(this.isMad) {
		//var madSize = 1.5 * this.size;
		//drawTriangle(this.position, madSize, rotation, '#f00');
		this.drawSprite(madDragonImg, 2*this.size, rotation);
	} else {
		this.drawSprite(dragonImg, 2*this.size, rotation);
	}

	// draw regular green dragon
	//drawTriangle(this.position, this.size, rotation, this.color);

	// draw hoard
	var yellowSize = coinSize * Math.sqrt(this.numCoins / Math.PI)
	//drawCircle(this.position.sub(this.velocity.setMagnitude(this.size+yellowSize)), yellowSize, '#ff0');
	drawCircle(this.position, yellowSize, '#ff0');
	//drawHexagon(this.position, yellowSize, rotation, '#ff0');
	//for (var i=0; i<this.numCoins; i++) {
		//var x = Math.random() * 20 - 10;
		//var y = Math.random() * 20 - 10;
		//drawHexagon(new Vector(this.position.x+x, this.position.y+y), coinSize, rotation, '#ff0');
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

	var sfx = new Audio('sounds/dragon-growl.m4a');
	sfx.volume = 0.2;
	sfx.play();

	updateGUI(); // update count of dragons on board

	return dragon;
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
		// on avg, drop this percentage of coins
		if(Math.random() < PERCENT_OF_DRAGON_HOARD_RECOVERABLE) {
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

	// roar
	var sfx = new Audio('sounds/dragon-roar.m4a');
	sfx.volume = 0.3;
	sfx.play();

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

		var sfx = new Audio('sounds/coin.m4a');
		sfx.volume = 0.1;
		sfx.play();

		// chance of spawning a new coin every time the player picks one up
		if(Math.random() < CHANCE_OF_GOLD_RESPAWN_AFTER_PLAYER_COLLECTS_ONE) spawnCoin();

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
				var sfx = new Audio('sounds/dragon-cry.m4a');
				sfx.volume = 0.5;
				sfx.play();

				gameOver("Dragon destroyed you!");
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

				//var sfx = new Audio('sounds/coin2.m4a');
				//sfx.volume = 0.1;
				//sfx.play();

				updateGUI(); // update gold on field count
			} else {
				force = force.add(dragon.arrive(dragon.targetCoin).scale(3));
				force = force.add(dragon.seek(dragon.targetCoin).scale(1));
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
	scoreText += "<br>Gold remaining: " + coins.length;
	scoreText += "<br>Dragons slain: " + dragonsSlain;
	scoreText += "<br>Dragons alive: " + dragons.length;
	scoreDiv.innerHTML = scoreText;
};

var coinSize = 4;
var asdf = 0;
Sandbox.addUpdateFunction(function(){
	ctx.save();
	//ctx.fillStyle = '#0ff';
	//ctx.fillStyle = '#99c778';
	ctx.fillStyle = '#38b026';
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

	// perhaps spawn a random coin
	// there's a chance of gold randomly spawning for each dragon per second
	if(Math.random() < CHANCE_OF_GOLD_RANDOMLY_SPAWNING_PER_DRAGON_PER_SECOND * dragons.length * Sandbox.deltaTime) {
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
