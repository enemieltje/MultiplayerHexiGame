// prepares the objects if they need that and collects the sprites and sounds hexi needs to load
Loader.load();

//Initialize and start Hexi
const resources = GameData.gameSprites.concat(GameData.gameSounds);
const hexiGame = hexi(window.innerWidth, window.innerHeight, setup, resources, load);
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
	// create the instances of the objects
	Loader.createObjects();
	WebSocketHandler.sendDownloadRequest();

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
	GameData.getObjectArrayFromName("player").forEach((player) =>
	{
		player.playTick();
	});
}
