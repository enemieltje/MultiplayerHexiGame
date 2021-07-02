import {GameData, uuid, hexiObject, hexiGame, Loader} from "../utils/deps.ts";

export type objectCategory = "" | "tileObject";
export type objectType = "" | "Dirt" | "Player";

export class GameObject
{
	type: objectType = "";
	category: objectCategory = "";
	name: string;
	hexiObject: hexiObject; // the object hexi uses for physics
	id: uuid = ""; // the id the gamedata uses to identify instances
	useTileset = false;

	constructor (name = "", texture: string | string[] = "empty.png")
	{
		this.id = this.genId();
		this.name = name;

		if (Array.isArray(texture))
		{
			this.hexiObject = hexiGame.sprite(texture);
		} else
		{
			const path = this.useTileset ? texture : `sprites/${texture}`;
			this.hexiObject = hexiGame.sprite(path);
		}
	}

	genId (): uuid
	{
		return GameData.genId();
	}

	// gameTick
	playTick () {}

	/**
	 * collect all the sprites an sounds that hexi needs to load for this object
	 * @param {Array<String>} sprites the filenames of the sprites
	 * @param {Array<String>} sounds the filenames of the sounds
	 */
	static onLoad (sprites: string[] = [], sounds: string[] = [])
	{
		sprites.forEach((spritePath) =>
		{
			GameData.addSprite(spritePath);
		});

		sounds.forEach((soundPath) =>
		{
			GameData.addSound(soundPath);
		});
	}

	// create the instances of this object for the start of the game, new ones can be made later also
	static create () {}
}

export class TileObject extends GameObject
{
	category: objectCategory = "tileObject";
	map = [15, 14, 3, 2, 12, 13, 0, 1, 11, 10, 7, 6, 8, 9, 4, 5];

	constructor (name: string, texture?: string | string[])
	{
		super(name, texture);

		this.useTileset = true;
		this.updateSprite();
	}

	get x ()
	{
		return Math.floor(this.hexiObject.x / Loader.gridSize.x);
	}

	set x (x)
	{
		this.hexiObject.x = Math.floor(x) * Loader.gridSize.x;
	}

	get y ()
	{
		return Math.floor(this.hexiObject.y / Loader.gridSize.y);
	}

	set y (y)
	{
		this.hexiObject.y = Math.floor(y) * Loader.gridSize.y;
	}

	public updateSprite ()
	{
		let binary = "";
		console.log(GameData.getTile(this.x, this.y - 1));
		binary += GameData.getTile(this.x, this.y - 1) !== undefined ? "1" : "0";
		binary += GameData.getTile(this.x + 1, this.y) !== undefined ? "1" : "0";
		binary += GameData.getTile(this.x, this.y + 1) !== undefined ? "1" : "0";
		binary += GameData.getTile(this.x - 1, this.y) !== undefined ? "1" : "0";

		const dec = parseInt(binary, 2);
		console.log(dec);
		let index = this.map[dec];
		if (index === undefined) index = dec;
		this.hexiObject.show(index);
		this.hexiObject.scale = {x: 2, y: 2};
	}
}
