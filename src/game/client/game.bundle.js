class GameData
{
	static gameObjects = {
	};
	static nameIdMap = {
	};
	static typeIdMap = {
	};
	static categoryIdMap = {
	};
	static tileObjectMap = [];
	static gameSprites = [];
	static gameSounds = [];
	static worldData;
	static idGeneratorId = 0;
	static frame = 0;
	static genId ()
	{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
		{
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 3 | 8;
			return v.toString(16);
		});
	}
	static storeObject (object, name)
	{
		this.gameObjects[object.id] = object;
		this.nameIdMap[name] ? this.nameIdMap[name].push(object.id) : this.nameIdMap[name] = [
			object.id
		];
		this.typeIdMap[object.type] ? this.typeIdMap[object.type].push(object.id) : this.typeIdMap[object.type] = [
			object.id
		];
		this.categoryIdMap[object.category] ? this.categoryIdMap[object.category].push(object.id) : this.categoryIdMap[object.category] = [
			object.id
		];
		if (object.category == "tileObject")
		{
			const tileObject = object;
			if (!this.tileObjectMap[tileObject.y]) this.tileObjectMap[tileObject.y] = [];
			this.tileObjectMap[tileObject.y][tileObject.x] = tileObject.id;
		}
		return object;
	}
	static getObject (id, index)
	{
		if (id[8] == "-" && id[13] == "-" && id[18] == "-" && id[23] == "-")
		{
			const i = id;
			return this.gameObjects[i];
		} else if (id == "Dirt" || id == "Player")
		{
			return this.gameObjects[this.typeIdMap[id][index || 0]];
		} else if (id == "tileObject")
		{
			return this.gameObjects[this.categoryIdMap[id][index || 0]];
		} else if (this.nameIdMap[id])
		{
			return this.gameObjects[this.nameIdMap[id][index || 0]];
		} else
		{
			console.log(`could not resolve id: ${id}`);
			return {
			};
		}
	}
	static getObjectArray (id)
	{
		if (id == "Dirt" || id == "Player")
		{
			const objectArray = [];
			this.typeIdMap[id].forEach((uuid) =>
			{
				objectArray.push(this.gameObjects[uuid]);
			});
			return objectArray;
		} else if (id == "tileObject")
		{
			const objectArray = [];
			this.categoryIdMap[id].forEach((uuid) =>
			{
				objectArray.push(this.gameObjects[uuid]);
			});
			return objectArray;
		} else if (this.nameIdMap[id])
		{
			const objectArray = [];
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
	static getObjectFromId (id)
	{
		return this.gameObjects[id];
	}
	static getObjectFromName (name, index)
	{
		if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);
		return this.getObjectFromId(this.nameIdMap[name][index || 0]);
	}
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
	static async deleteObjectFromId (objectId)
	{
		const hexiObject = await this.gameObjects[objectId].hexiObject;
		hexiObject.remove();
		delete this.gameObjects[objectId];
	}
	static addSprite (name)
	{
		this.gameSprites.push(`sprites/${name}`);
	}
	static addSound (name)
	{
		this.gameSprites.push(`sounds/${name}`);
	}
	static getTile (x, y)
	{
		const uuid = (this.tileObjectMap[y] || [])[x];
		return uuid ? this.gameObjects[uuid] : undefined;
	}
}
class Loader
{
	static objectTypes = {
	};
	static globalSounds = [];
	static gridSize = {
		x: 32,
		y: 32
	};
	static load ()
	{
		console.log("Loading Objects");
		Object.keys(Loader.objectTypes).forEach((objectName) =>
		{
			Loader.objectTypes[objectName].onLoad();
		});
		console.log("Loading global Sounds");
		Loader.globalSounds.forEach((sound) =>
		{
			GameData.addSound(sound);
		});
	}
	static createObjects ()
	{
		console.log("Creating Objects");
		Object.keys(Loader.objectTypes).forEach((objectName) =>
		{
			Loader.objectTypes[objectName].create();
		});
		this.loop(this.exec);
	}
	static loadWorld (worldData)
	{
		GameData.worldData = worldData;
		this.loop(this.exec);
	}
	static loop (func)
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
	static exec (type, x, y)
	{
		if (type == "") return;
		if (!Loader.objectTypes[type]) return;
		const obj = new Loader.objectTypes[type]();
		obj.hexiObject.x = x * Loader.gridSize.x;
		obj.hexiObject.y = y * Loader.gridSize.y;
		obj.updateSprite();
		GameData.storeObject(obj, `world${type}`);
	}
}
class WebSocketHandler
{
	static messageBuffer = [];
	static executeBuffer ()
	{
		this.messageBuffer.forEach((message, i) =>
		{
			socket.send(JSON.stringify(message));
			delete this.messageBuffer[i];
		});
		WebSocketHandler.sendServerRequest("world");
	}
	static sendServerRequest (name)
	{
		const message = {
			messageType: "server",
			name: name
		};
		this.send(message);
	}
	static sendWorldRequest ()
	{
		const message = {
			messageType: "world"
		};
		this.send(message);
	}
	static sendObjectsUpdate (objectIdArray = Object.keys(GameData.gameObjects))
	{
		if (!Array.isArray(objectIdArray)) objectIdArray = [
			objectIdArray
		];
		const data = {
		};
		console.log(`sending objectsUpdate on ${objectIdArray.length} objects`);
		objectIdArray.forEach((objectId) =>
		{
			data[objectId] = this.getMessageObject(objectId);
		});
		const message = {
			messageType: "object",
			data: data
		};
		this.send(message);
	}
	static getMessageObject (objectId)
	{
		const object = GameData.getObjectFromId(objectId);
		const data = {
			id: objectId,
			name: object.name,
			type: object.type,
			category: object.category,
			data: {
				x: object.hexiObject.x,
				y: object.hexiObject.y,
				vx: object.hexiObject.vx,
				vy: object.hexiObject.vy
			}
		};
		return data;
	}
	static updateObjects (objectList)
	{
		Object.keys(objectList).forEach((objectId) =>
		{
			const objectData = objectList[objectId];
			if (Object.keys(GameData.gameObjects).includes(objectId))
			{
				const localObject = GameData.getObjectFromId(objectId);
				if (localObject.name == objectData.name && localObject.constructor.name == objectData.type)
				{
					Object.keys(objectData.data).forEach((key) =>
					{
						localObject.hexiObject[key] = objectData.data[key];
					});
				} else
				{
					GameData.deleteObjectFromId(objectId);
					this.createNewObject(objectData);
				}
			} else
			{
				this.createNewObject(objectData);
			}
		});
	}
	static createNewObject (messageObject)
	{
		const newObject = new Loader.objectTypes[messageObject.type]();
		newObject.id = messageObject.id;
		GameData.storeObject(newObject, messageObject.name);
		Object.keys(messageObject.data).forEach((key) =>
		{
			newObject.hexiObject[key] = messageObject.data[key];
		});
	}
	static handleSocketMessage (ev)
	{
		const message = JSON.parse(ev.data);
		console.log(`socket message received:`);
		console.log(message);
		switch (message.messageType)
		{
			case "object":
				WebSocketHandler.updateObjects(message.data);
				break;
			case "world":
				WebSocketHandler.sendObjectsUpdate();
				break;
			case "worldData":
				Loader.loadWorld(message.data);
				break;
			default:
				console.log("no response");
				break;
		}
	}
	static send (message)
	{
		console.log(`socket message sent:`);
		console.log(message);
		socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.messageBuffer.push(message);
	}
}
let hexiGame1;
class GameObject
{
	type = "";
	category = "";
	name;
	hexiObject;
	id = "";
	useTileset = false;
	constructor (name2 = "", texture = "empty.png")
	{
		this.id = this.genId();
		this.name = name2;
		if (Array.isArray(texture))
		{
			this.hexiObject = hexiGame1.sprite(texture);
		} else
		{
			const path = this.useTileset ? texture : `sprites/${texture}`;
			this.hexiObject = hexiGame1.sprite(path);
		}
	}
	genId ()
	{
		return GameData.genId();
	}
	playTick ()
	{
	}
	static onLoad (sprites = [], sounds = [])
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
	static create ()
	{
	}
}
class Player extends GameObject
{
	type = "Player";
	walkLeft = hexiGame1.keyboard(37);
	walkUp = hexiGame1.keyboard(38);
	walkRight = hexiGame1.keyboard(39);
	walkDown = hexiGame1.keyboard(40);
	constructor ()
	{
		super("player", "strawberry.png");
	}
	playTick ()
	{
		hexiGame1.move(this.hexiObject);
	}
	static onLoad ()
	{
		super.onLoad([
			"strawberry.png"
		]);
	}
	static create ()
	{
		GameData.storeObject(new Player(), "player");
	}
	defineMovementKeys ()
	{
		this.walkLeft.press = () =>
		{
			this.hexiObject.vx = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkLeft.release = () =>
		{
			if (!this.walkRight.isDown)
			{
				this.hexiObject.vx = 0;
			} else this.hexiObject.vx = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkUp.press = () =>
		{
			this.hexiObject.vy = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkUp.release = () =>
		{
			if (!this.walkDown.isDown)
			{
				this.hexiObject.vy = 0;
			} else this.hexiObject.vy = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkRight.press = () =>
		{
			this.hexiObject.vx = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkRight.release = () =>
		{
			if (!this.walkLeft.isDown)
			{
				this.hexiObject.vx = 0;
			} else this.hexiObject.vx = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkDown.press = () =>
		{
			this.hexiObject.vy = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkDown.release = () =>
		{
			if (!this.walkUp.isDown)
			{
				this.hexiObject.vy = 0;
			} else this.hexiObject.vy = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
	}
}
Loader.objectTypes.Player = Player;
class TileObject extends GameObject
{
	category = "tileObject";
	map = [
		15,
		14,
		3,
		2,
		12,
		13,
		0,
		1,
		11,
		10,
		7,
		6,
		8,
		9,
		4,
		5
	];
	constructor (name1, texture2)
	{
		super(name1, texture2);
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
	updateSprite ()
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
		this.hexiObject.scale = {
			x: 2,
			y: 2
		};
	}
}
class Dirt extends TileObject
{
	type = "Dirt";
	constructor ()
	{
		const texture1 = [];
		for (let i = 0; i < 16; i++)
		{
			texture1.push(`dirt${i}.png`);
		}
		super("dirt", texture1);
	}
	playTick ()
	{
	}
	static onLoad ()
	{
		super.onLoad([
			"simpleSpriteMapDirt.json"
		]);
	}
	static create ()
	{
	}
}
Loader.objectTypes.Dirt = Dirt;
class Game1
{
	static mouseObject;
	static startGame (setupFunction)
	{
		Loader.load();
		const resources = GameData.gameSprites.concat(GameData.gameSounds);
		hexiGame1 = JS.hexi(JS.window.innerWidth, JS.window.innerHeight, setupFunction, resources, this.load);
		hexiGame1.scaleToWindow();
		hexiGame1.start();
	}
	static load ()
	{
		console.log(`loading: ${hexiGame1.loadingFile}`);
		console.log(`progress: ${hexiGame1.loadingProgress}`);
		hexiGame1.loadingBar();
	}
	static setupHost ()
	{
		Loader.createObjects();
		GameData.getObjectFromName("player").defineMovementKeys();
		hexiGame1.state = Game1.play;
	}
	static setupJoin ()
	{
		WebSocketHandler.sendWorldRequest();
		Game1.createObject("Player", "player").defineMovementKeys();
		hexiGame1.state = Game1.play;
	}
	static setupMapEditor ()
	{
		Game1.mouseObject = Game1.createObject("Dirt", "mouseObject");
		hexiGame1.state = Game1.mapEditor;
	}
	static createObject (type, name)
	{
		const object = new Loader.objectTypes[type]();
		GameData.storeObject(object, name);
		WebSocketHandler.sendObjectsUpdate(object.id);
		return object;
	}
	static play ()
	{
		GameData.frame++;
		GameData.frame % hexiGame1.fps;
		GameData.getObjectArrayFromName("player").forEach((player) =>
		{
			player.playTick();
		});
		GameData.getObjectArray("tileObject").forEach((tileObject) =>
		{
			tileObject.updateSprite();
		});
	}
	static mapEditor ()
	{
		GameData.frame++;
		GameData.frame % hexiGame1.fps;
		Game1.mouseObject.hexiObject.x = hexiGame1.pointer.x;
		Game1.mouseObject.hexiObject.y = hexiGame1.pointer.y;
		GameData.getObjectArray("tileObject").forEach((tileObject) =>
		{
			tileObject.updateSprite();
		});
	}
}
console.log(window.location.href.split("/")[2]);
const socket = new WebSocket(`ws://${window.location.href.split("/")[2]}`);
socket.addEventListener("message", WebSocketHandler.handleSocketMessage);
socket.onopen = function (_ev)
{
	console.log("WebSocket is open now.");
	WebSocketHandler.executeBuffer();
};


