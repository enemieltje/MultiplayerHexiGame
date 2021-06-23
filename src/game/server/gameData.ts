export type GameObject = {
	id: number;
	name: string;
	hexiObject: hexiObject;
};

export type hexiObject = {
	x: number;
	y: number;
	vx: number;
	vy: number;

};

export class GameData
{
	private static gameObjects: Record<number, GameObject> = {}; // a map of all instances <objectId, instance>
	private static nameIdMap: Record<string, number[]> = {}; // a map of objects that have a name so they're easier to find <instanceName, objectId>

	private static idGeneratorId = 0;

	/**
	 * generates a unique number to be used as an id for object instances
	 */
	static genId ()
	{
		this.idGeneratorId++;
		return this.idGeneratorId;
	}

	/**
	 * stores an object in the gameObjects, so it can be found later
	 * @param {GameObject} object instance of a gameObject
	 * @param {String} name the name to find this object with, does not need to be unique
	 */
	static storeObject (object: GameObject, name: string)
	{
		this.gameObjects[object.id] = object;

		this.nameIdMap[name] ? this.nameIdMap[name].push(object.id) : this.nameIdMap[name] = [object.id];
		return object.id;
	}

	/**
	 * get an instance of a game object by id
	 */
	static getObjectFromId (id: number): GameObject
	{
		return this.gameObjects[id];
	}

	/**
	 * get an instance of a game object by name
	 * @param {string} name - the name of the instance
	 * @param {number} index - optional, if more objects have the same name, use this index to identify which one you want
	 */
	static getObjectFromName (name: string, index = 0): GameObject
	{
		if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);

		return this.getObjectFromId(this.nameIdMap[name][index]);
	}

	/**
	 * get all instances with the same name
	 */
	static getObjectArrayFromName (name: string): GameObject[]
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

	static deleteObjectFromId (objectId: number)
	{
		delete this.gameObjects[objectId];
	}
}
