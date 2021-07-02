import {GameObject, uuid, worldData, TileObject, objectType, objectCategory} from "./deps.ts";

export class GameData
{
	static gameObjects: Record<uuid, GameObject> = {}; // a map of all instances <objectId: uuid, instance: Object>
	static nameIdMap: Record<string, uuid[]> = {}; // a map of objects that have a name so they're easier to find <instanceName: string, objectId: uuid>
	static typeIdMap: Record<objectType, uuid[]> = <Record<objectType, uuid[]>> {};
	static categoryIdMap: Record<objectCategory, uuid[]> = <Record<objectCategory, uuid[]>> {};
	static tileObjectMap: uuid[][] = []; // a 2d array of all the uuids of the tileObjects

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
		this.gameObjects[object.id] = object;

		this.nameIdMap[name] ?
			this.nameIdMap[name].push(object.id) :
			this.nameIdMap[name] = [object.id];

		this.typeIdMap[object.type] ?
			this.typeIdMap[object.type].push(object.id) :
			this.typeIdMap[object.type] = [object.id];

		this.categoryIdMap[object.category] ?
			this.categoryIdMap[object.category].push(object.id) :
			this.categoryIdMap[object.category] = [object.id];

		if (object.category == "tileObject")
		{
			const tileObject = object as TileObject;
			if (!this.tileObjectMap[tileObject.y]) this.tileObjectMap[tileObject.y] = [];
			this.tileObjectMap[tileObject.y][tileObject.x] = tileObject.id;
		}

		return object;
	}

	static getObject (id: uuid | objectType | objectCategory | string, index?: number)
	{
		if (
			id[8] == "-" &&
			id[13] == "-" &&
			id[18] == "-" &&
			id[23] == "-")
		{
			const i = id as uuid;
			return this.gameObjects[i];
		}
		else if (
			id == "Dirt" ||
			id == "Player")
		{
			return this.gameObjects[this.typeIdMap[id][index || 0]];
		}
		else if (
			id == "tileObject")
		{
			return this.gameObjects[this.categoryIdMap[id][index || 0]];
		}
		else if (this.nameIdMap[id])
		{
			return this.gameObjects[this.nameIdMap[id][index || 0]];
		} else
		{
			console.log(`could not resolve id: ${id}`);
			return <GameObject> {};
		}
	}


	static getObjectArray (id: objectType | objectCategory | string)
	{
		if (
			id == "Dirt" ||
			id == "Player")
		{
			const objectArray: GameObject[] = [];
			this.typeIdMap[id].forEach((uuid) =>
			{
				objectArray.push(this.gameObjects[uuid]);
			});
			return objectArray;
		}
		else if (
			id == "tileObject")
		{
			const objectArray: GameObject[] = [];
			this.categoryIdMap[id].forEach((uuid) =>
			{
				objectArray.push(this.gameObjects[uuid]);
			});
			return objectArray;
		}
		else if (this.nameIdMap[id])
		{
			const objectArray: GameObject[] = [];
			this.nameIdMap[id].forEach((uuid) =>
			{
				objectArray.push(this.gameObjects[uuid]);
			});
			return objectArray;
		} else
		{
			console.log(`could not resolve id: ${id}`);
			return [];
		}
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
	static getObjectFromName (name: string, index?: number)
	{
		if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);

		return this.getObjectFromId(this.nameIdMap[name][index || 0]);
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

	static async deleteObjectFromId (objectId: uuid)
	{
		const hexiObject = await this.gameObjects[objectId].hexiObject;
		hexiObject.remove();
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

	static getTile (x: number, y: number)
	{
		const uuid = (this.tileObjectMap[y] || [])[x];
		return uuid ? this.gameObjects[uuid] : undefined;
	}
}
