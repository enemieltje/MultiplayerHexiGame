import {GameObject, uuid, hexiGame, worldData} from "./deps.ts";

export class GameData
{
	static gameObjects: Record<uuid, GameObject> = {}; // a map of all instances <objectId: uuid, instance: Object>
	static nameIdMap: Record<string, uuid[]> = {}; // a map of objects that have a name so they're easier to find <instanceName: string, objectId: uuid>

	static gameSprites: string[] = []; // all spritenames that hexi needs to load
	static gameSounds: string[] = []; // all soundnames that hexi needs to load
	static worldData: worldData;

	static idGeneratorId = 0;

	static frame = 0;

	/**
	 * generates an id to be used as an id for object instances.
	 * Not explicitly unique, but random enough to say it is
	 */
	static genId (): uuid
	{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
		{
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	/**
	 * stores an object in the gameObjects, so it can be found later
	 * @param {Object} object instance of a gameObject
	 * @param {String} name the name to find this object with, does not need to be unique
	 */
	static storeObject (object: GameObject, name: string)
	{
		const texture = object.texture || "empty.png";
		if (Array.isArray(texture))
		{
			object.hexiObject = hexiGame.sprite(texture);
		} else
		{
			const path = object.useTileset ? texture : `sprites/${texture}`;
			object.hexiObject = hexiGame.sprite(path);
		}
		this.gameObjects[object.id] = object;

		this.nameIdMap[name] ? this.nameIdMap[name].push(object.id) : this.nameIdMap[name] = [object.id];
		return object;
	}

	/**
	 * get an instance of a game object by id
	 */
	static getObjectFromId (id: uuid)
	{
		return this.gameObjects[id];
	}

	/**
	 * get an instance of a game object by name
	 * @param {string} name - the name of the instance
	 * @param {number} index - optional, if more objects have the same name, use this index to identify which one you want
	 */
	static getObjectFromName (name: string, index = 0)
	{
		if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);

		return this.getObjectFromId(this.nameIdMap[name][index]);
	}

	/**
	 * get all instances with the same name
	 */
	static getObjectArrayFromName (name: string)
	{
		if (!this.nameIdMap[name])
		{
			console.log(`tried to get object ${name} that does not exist`);
			return [];
		}

		const objectArray: GameObject[] = [];
		this.nameIdMap[name].forEach((id) =>
		{
			objectArray.push(this.getObjectFromId(id));
		});
		return objectArray;
	}

	static deleteObjectFromId (objectId: uuid)
	{
		const hexiObject = this.gameObjects[objectId].hexiObject;
		if (hexiObject) hexiObject.remove();
		delete this.gameObjects[objectId];
	}

	/**
	 * add a sprite to be loaded by hexi
	 */
	static addSprite (name: string)
	{
		this.gameSprites.push(`sprites/${name}`);
	}

	/**
	 * add a sound to be loaded by hexi
	 */
	static addSound (name: string)
	{
		this.gameSprites.push(`sounds/${name}`);
	}

	static getBlock (x: number, y: number)
	{
		if (x < 0 || x > 15 || y < 0 || y > 15) return "Air";
		const index = this.worldData.data[y][x];
		return this.worldData.map[index];
	}
}
