import {GameObject, GameData, worldData, Dirt} from "./deps.ts";

export class Loader
{
	static objectTypes: Record<string, typeof GameObject> = {}; // each object class gets added here
	static globalSounds = []; // all filenames of sounds that do not specifically belong to an object
	static gridSize = {x: 32, y: 32};

	/**
	 * load the objects and sounds
	 */
	static load ()
	{
		console.log("Loading Objects");
		Object.keys(Loader.objectTypes).forEach((objectName: string) =>
		{
			Loader.objectTypes[objectName].onLoad();
		});

		console.log("Loading global Sounds");
		Loader.globalSounds.forEach(sound =>
		{
			GameData.addSound(sound);
		});
	}

	/**
	 * create instances of the objects as they should be present at the start of the game
	 */
	static createObjects ()
	{
		console.log("Creating Objects");
		Object.keys(Loader.objectTypes).forEach(objectName =>
		{
			Loader.objectTypes[objectName].create();
		});

		this.loop(this.exec);
	}

	static loadWorld (worldData: worldData)
	{
		GameData.worldData = worldData;
		this.loop(this.exec);
	}

	/**
	 * executes a function for each object in the worldData
	 * @param func function to be executed for each object
	 */
	static loop (func: (type: string, x: number, y: number) => void)
	{
		if (!GameData.worldData) return;

		GameData.worldData.data.forEach((row, y) =>
		{
			row.forEach((mapIndex, x) =>
			{
				func(GameData.worldData.map[mapIndex], x, y);
			});
		});
	}

	static exec (type: string, x: number, y: number)
	{
		if (type == "Air") return;
		if (!Loader.objectTypes[type]) return;
		const obj = GameData.storeObject(new Loader.objectTypes[type](), `world${type}`) as Dirt;
		obj.hexiObject.x = x * Loader.gridSize.x;
		obj.hexiObject.y = y * Loader.gridSize.y;
		obj.x = x;
		obj.y = y;
	}
}
