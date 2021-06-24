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
	if (ISHOST)
	{
		Loader.createObjects();

		GameData.getObjectFromName("player").defineMovementKeys();
	} else
	{
		WebSocketHandler.sendWorldRequest();

		createObject("Player", "player").defineMovementKeys();
	}

	// Set the game state to `play` to start the game loop
	hexiGame.state = play;
}

/**
 * create an object in a way hexi understands and sends an update of it to the other players
 * @param {string} type - name of the class where an instance will be created from
 * @param {string} name - the name to store it in the gameData with
 * @returns the object created
 */
function createObject (type, name)
{
	const object = new Loader.objectTypes[type]();
	GameData.storeObject(object, name);
	WebSocketHandler.sendObjectsUpdate(object.id);
	return object;
}

// the play gameloop; this function runs every tick while the game is in play state
function play ()
{
	// update the frame number in the gamedata
	GameData.frame++;
	GameData.frame % hexiGame.fps;

	// hexi wants us to do all the gamelogic in here, but I keep most logic separated in the objects
	(GameData.getObjectArrayFromName("player")).forEach((player) =>
	{
		player.playTick();
	});
}
