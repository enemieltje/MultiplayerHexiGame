class GameData
{
	static gameObjects = {}; // a map of all instances <objectId: uuid, instance: Object>
	static nameIdMap = {}; // a map of objects that have a name so they're easier to find <instanceName: string, objectId: uuid>

	static gameSprites = []; // all spritenames that hexi needs to load
	static gameSounds = []; // all soundnames that hexi needs to load

	static idGeneratorId = 0;

	static frame = 0;

	/**
	 * generates an id to be used as an id for object instances.
	 * Not explicitly unique, but random enough to say it is
	 */
	static genId ()
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
	static storeObject (object, name)
	{
		const texture = object.texture || "empty.png";
		object.hexiObject = hexiGame.sprite(`sprites/${texture}`);
		this.gameObjects[object.id] = object;

		this.nameIdMap[name] ? this.nameIdMap[name].push(object.id) : this.nameIdMap[name] = [object.id];
	}

	/**
	 * get an instance of a game object by id
	 */
	static getObjectFromId (id)
	{
		return this.gameObjects[id];
	}

	/**
	 * get an instance of a game object by name
	 * @param {string} name - the name of the instance
	 * @param {number} index - optional, if more objects have the same name, use this index to identify which one you want
	 */
	static getObjectFromName (name, index = 0)
	{
		if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);

		return this.getObjectFromId(this.nameIdMap[name][index]);
	}

	/**
	 * get all instances with the same name
	 */
	static getObjectArrayFromName (name)
	{
		if (!this.nameIdMap[name])
		{
			console.log(`tried to get object ${name} that does not exist`);
			return [];
		}

		const objectArray = [];
		this.nameIdMap[name].forEach((id) =>
		{
			objectArray.push(this.getObjectFromId(id));
		});
		return objectArray;
	}

	static deleteObjectFromId (objectId)
	{
		this.gameObjects[objectId].hexiObject.remove();
		delete this.gameObjects[objectId];
	}

	/**
	 * add a sprite to be loaded by hexi
	 */
	static addSprite (name)
	{
		this.gameSprites.push(`sprites/${name}`);
	}

	/**
	 * add a sound to be loaded by hexi
	 */
	static addSound (name)
	{
		this.gameSprites.push(`sounds/${name}`);
	}
}
