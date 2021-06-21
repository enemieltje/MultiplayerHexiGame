let gameScene;

// prepares the objects if they need that and collects the sprites and sounds hexi needs to load
Loader.load();

//Initialize and start Hexi
const resources = GameData.gameSprites.concat(GameData.gameSounds);
hexiGame = hexi(window.innerWidth, window.innerHeight, setup, resources, load);
hexiGame.scaleToWindow();
hexiGame.start();

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
	// create a scene for all the objects to exist in
	gameScene = hexiGame.group();

	// create the instances of the objects
	Loader.createObjects();

	// add the player to the scene
	GameData.getObjectFromName("playerOne").addToParent();

	// Set the game state to `play` to start the game loop
	hexiGame.state = play;
}

// the play gameloop; this function runs every tick while the game is in play state
function play ()
{
	// update the frame number in the gamedata
	GameData.frame++;
	GameData.frame % hexiGame.fps;

	// hexi wants us to do all the gamelogic in here, but I keep most logic separated in the objects
	GameData.getObjectFromName("player").playTick();
}
