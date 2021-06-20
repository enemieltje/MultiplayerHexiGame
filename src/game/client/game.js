let gameScene;

// prepares the objects if they need that and collects the sprites hexi needs to load
Loader.load().then(init());

function init ()
{
	GameData.gameSprites.push("sprites/block.png");
	//Initialize and start Hexi
	console.log(`sprites: ${GameData.gameSprites}`);
	hexiGame = hexi(window.innerWidth, window.innerHeight, setup, GameData.gameSprites, load);
	hexiGame.scaleToWindow();
	hexiGame.start();
}

// hexi uses this function while it loads all the sprites
function load ()
{
	//Display the file currently being loaded
	console.log(`loading: ${hexiGame.loadingFile}`);

	//Display the percentage of files currently loaded
	console.log(`progress: ${hexiGame.loadingProgress}`);

	//Display an optional loading bar
	hexiGame.loadingBar();
}

// here all the object instances get created and organised
function setup ()
{
	// create a scene for all the objects to be
	gameScene = hexiGame.group();

	Loader.createSprites();

	GameData.getObjectFromName("player").hexiObject = hexiGame.sprite("sprites/strawberry.png");
	GameData.getObjectFromName("player").hexiObject.setPosition(256, 256);

	// add the player to the scene
	GameData.getObjectFromName("player").addToParent();

	// Set the game state to `play` to start the game loop
	hexiGame.state = play;
}

// this function runs every tick while the game is in play state
function play ()
{
	// hexi wants us to do all the gamelogic in here, but I keep most logic separated in the objects
	GameData.getObjectFromName("player").playTick();
	gameScene.children.forEach(object =>
	{
		//Move the cat
		hexiGame.move(object);
	});
}
