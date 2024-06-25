//board
let board;
let boardWidth = window.innerWidth;
let boardHeight = 800;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
	x: birdX,
	y: birdY,
	width: birdWidth,
	height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 120; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512 + 100;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -20; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.8;

let gameOver = false;
let score = 0;

function setTimeoutAsync(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

window.onload = async function () {
	await displayCountDown();
	await playGame();
};

async function displayCountDown() {
	board = document.getElementById("board");
	board.height = boardHeight;
	board.width = boardWidth;
	context = board.getContext("2d"); //used for drawing on the board
	for (let count = 3; count >= 0; count--) {
		context.clearRect(0, 0, board.width, board.height);
		context.font = "48px Arial";
		context.fillStyle = "black";
		context.textAling = "center";
		console.log(count);
		context.fillText(count, board.width / 2, board.height / 2);
		await setTimeoutAsync(1000);
	}
}

async function playGame() {
	board = document.getElementById("board");
	board.height = boardHeight;
	board.width = boardWidth;
	context = board.getContext("2d"); //used for drawing on the board

	//draw flappy bird
	// context.fillStyle = "green";
	// context.fillRect(bird.x, bird.y, bird.width, bird.height);

	//load images
	birdImg = new Image();
	birdImg.src = "./flappybird.png";
	birdImg.onload = function () {
		context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
	};

	topPipeImg = new Image();
	topPipeImg.src = "./toppipe.png";

	bottomPipeImg = new Image();
	bottomPipeImg.src = "./bottompipe.png";

	requestAnimationFrame(update);
	setInterval(placePipes, 3000); //every 1.5 seconds
	document.addEventListener("keydown", moveBird);
}

function update() {
	requestAnimationFrame(update);
	if (gameOver) {
		return;
	}
	context.clearRect(0, 0, board.width, board.height);

	//bird
	velocityY += gravity;
	// bird.y += velocityY;
	bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
	context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

	if (bird.y > board.height) {
		gameOver = true;
	}

	//pipes
	for (let i = 0; i < pipeArray.length; i++) {
		let pipe = pipeArray[i];
		pipe.x += velocityX;
		context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

		if (!pipe.passed && bird.x > pipe.x + pipe.width) {
			score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
			pipe.passed = true;
		}

		if (detectCollision(bird, pipe)) {
			gameOver = true;
		}
	}

	while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
		pipeArray.shift(); //removes first element from the array
	}
	//score
	context.fillStyle = "white";
	context.font = "45px sans-serif";
	context.fillText(score, 5, 45);

	if (gameOver) {
		context.fillText("GAME OVER", 5, 90);
	}
}
//document.getElementById('stop-button').addEventListener('click', function() {
//  document.querySelector('.scrolling-background').style.animationPlayState = 'paused';
//});
//
//document.getElementById('start-button').addEventListener('click', function() {
//  document.querySelector('.scrolling-background').style.animationPlayState = 'running';
//});
function placePipes() {
	if (gameOver) {
		return;
	}

	let randomPipeY = pipeY - pipeHeight / 8 - Math.random() * (pipeHeight / 2);
	let openingSpace = board.height / 8;

	let topPipe = {
		img: topPipeImg,
		x: pipeX,
		y: randomPipeY,
		width: pipeWidth,
		height: pipeHeight,
		passed: false,
	};
	pipeArray.push(topPipe);

	let bottomPipe = {
		img: bottomPipeImg,
		x: pipeX,
		y: randomPipeY + pipeHeight + openingSpace,
		width: pipeWidth,
		height: pipeHeight,
		passed: false,
	};
	pipeArray.push(bottomPipe);
}

function moveBird(e) {
	if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
		//jump
		velocityY = -6;

		//reset game
		if (gameOver) {
			bird.y = birdY;
			pipeArray = [];
			score = 0;
			gameOver = false;
		}
	}
}

function detectCollision(a, b) {
	return (
		a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
		a.x + a.width > b.x && //a's top right corner passes b's top left corner
		a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
		a.y + a.height > b.y
	); //a's bottom left corner passes b's top left corner
}

