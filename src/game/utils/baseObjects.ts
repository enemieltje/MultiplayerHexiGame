// @ts-ignore
import {GameData, uuid, hexiObject} from "../utils/deps.ts";

export class GameObject
{
	name: string;
	hexiObject: hexiObject = <hexiObject> {}; // the object hexi uses for physics
	id: uuid = ""; // the id the gamedata uses to identify instances
	texture?: string | string[];
	useTileset = false;

	constructor (name = "")
	{
		this.id = this.genId();
		this.name = name;
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

