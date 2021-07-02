import
{
	GameObject,
	Loader,
	GameData,
	WebSocketHandler,
	JS,
	Player
} from "./utils/deps.ts";

export let hexiGame: any;

export class Game
{
	static mouseObject: GameObject;

	public static startGame (setupFunction: () => void)
	{
		// prepares the objects if they need that and collects the sprites and sounds hexi needs to load
		Loader.load();

		//Initialize and start Hexi
		const resources = GameData.gameSprites.concat(GameData.gameSounds);
		hexiGame = JS.hexi(JS.window.innerWidth, JS.window.innerHeight, setupFunction, resources, this.load);
		hexiGame.scaleToWindow();
		hexiGame.start();
	}

	// hexi uses this function while it loads all the sprites
	public static load ()
	{
		//Display the file currently being loaded
		console.log(`loading: ${hexiGame.loadingFile}`);

		//Display the percentage of files currently loaded
		console.log(`progress: ${hexiGame.loadingProgress}`);

		//Display an optional loading bar
		hexiGame.loadingBar();
	}

	// here all the object instances get created and organised
	public static setupHost ()
	{
		// create the instances of the objects
		Loader.createObjects();

		(GameData.getObjectFromName("player") as Player).defineMovementKeys();

		// Set the game state to `play` to start the game loop
		hexiGame.state = Game.play;
	}

	// here all the object instances get created and organised
	public static setupJoin ()
	{
		// create the instances of the objects
		WebSocketHandler.sendWorldRequest();

		(Game.createObject("Player", "player") as Player).defineMovementKeys();

		// Set the game state to `play` to start the game loop
		hexiGame.state = Game.play;
	}

	// here all the object instances get created and organised
	public static setupMapEditor ()
	{
		Game.mouseObject = Game.createObject("Dirt", "mouseObject");

		// Set the game state to `play` to start the game loop
		hexiGame.state = Game.mapEditor;
	}

	/**
	 * create an object in a way hexi understands and sends an update of it to the other players
	 * @param {string} type - name of the class where an instance will be created from
	 * @param {string} name - the name to store it in the gameData with
	 * @returns the object created
	 */
	static createObject (type: string, name: string)
	{
		const object = new Loader.objectTypes[type]();
		GameData.storeObject(object, name);
		WebSocketHandler.sendObjectsUpdate(object.id);
		return object;
	}

	// the play gameloop; this function runs every tick while the game is in play state
	static play ()
	{
		// update the frame number in the gamedata
		GameData.frame++;
		GameData.frame % hexiGame.fps;

		// hexi wants us to do all the gamelogic in here, but I keep most logic separated in the objects
		(GameData.getObjectArrayFromName("player")).forEach((player: GameObject) =>
		{
			player.playTick();
		});
	}

	static mapEditor ()
	{

		// update the frame number in the gamedata
		GameData.frame++;
		GameData.frame % hexiGame.fps;

		Game.mouseObject.hexiObject.x = hexiGame.pointer.x;
		Game.mouseObject.hexiObject.y = hexiGame.pointer.y;
	}
}
