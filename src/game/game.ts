import
{
	GameObject,
	Loader,
	GameData,
	WebSocketHandler,
	JS,
	Player,
	objectType,
	TileObject
} from "./utils/deps.ts";

export let hexiGame: any;

export class Game
{
	static mouseObject: TileObject;

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
		WebSocketHandler.sendServerRequest("world");
		Loader.createObjects();

		(GameData.getObjectFromName("player") as Player).defineMovementKeys();

		// Set the game state to `play` to start the game loop
		hexiGame.state = Game.play;
	}

	// here all the object instances get created and organised
	public static setupJoin ()
	{
		// create the instances of the objects
		WebSocketHandler.sendServerRequest("world");
		WebSocketHandler.sendWorldRequest();

		(Game.createObject("Player", "player") as Player).defineMovementKeys();

		// Set the game state to `play` to start the game loop
		hexiGame.state = Game.play;
	}

	// here all the object instances get created and organised
	public static setupMapEditor ()
	{
		Game.mouseObject = Game.createObject("Dirt", "mouseObject") as TileObject;

		hexiGame.pointer.tap = Game.placeMouseObject;

		// Set the game state to `play` to start the game loop
		hexiGame.state = Game.mapEditor;
	}

	public static placeMouseObject ()
	{
		const newObj = Game.createObject(Game.mouseObject.type, `mouse${Game.mouseObject.type}`) as TileObject;

		newObj.move(Game.mouseObject.x, Game.mouseObject.y);
	}

	/**
	 * create an object in a way hexi understands and sends an update of it to the other players
	 * @param {string} type - name of the class where an instance will be created from
	 * @param {string} name - the name to store it in the gameData with
	 * @returns the object created
	 */
	static createObject (type: objectType, name: string)
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

		GameData.getObjectArray("tileObject").forEach((tileObject: GameObject) =>
		{
			(tileObject as TileObject).updateSprite();
		});
	}

	static mapEditor ()
	{

		// update the frame number in the gamedata
		GameData.frame++;
		GameData.frame % hexiGame.fps;

		Game.mouseObject.hexiObject.x = Math.floor(hexiGame.pointer.x / Loader.gridSize.x) * Loader.gridSize.x;
		Game.mouseObject.hexiObject.y = Math.floor(hexiGame.pointer.y / Loader.gridSize.y) * Loader.gridSize.y;

		GameData.getObjectArray("tileObject").forEach((tileObject: GameObject) =>
		{
			(tileObject as TileObject).updateSprite();
		});
	}
}
