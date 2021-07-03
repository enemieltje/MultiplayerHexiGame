import {GameData, uuid, Loader, worldData, objectType, objectCategory} from "./deps.ts";

export type WsMessage = objectWsMessage | worldWsMessage | serverWsMessage | worldDataWsMessage;

export type serverWsMessage = {
	messageType: "server",
	name: string;
};

export type objectWsMessage = {
	messageType: "object",
	data: Record<uuid, objectData>;
};

export type worldDataWsMessage = {
	messageType: "worldData",
	data: worldData;
};

export type worldWsMessage = {
	messageType: "world";
};

export type objectData = {
	id: uuid,
	name: string,
	type: objectType,
	category: objectCategory,
	data: Record<string, unknown>;
};

export class WebSocketHandler
{
	static messageBuffer: WsMessage[] = []; // a buffer of all the messages sent before the websocket was open

	// send all the messages from the buffer
	static executeBuffer ()
	{
		this.messageBuffer.forEach((message, i) =>
		{
			socket.send(JSON.stringify(message));
			delete this.messageBuffer[i];
		});
	}

	/**
	 * sends a request to download all the objects in the world already
	 */
	static sendServerRequest (name: string)
	{
		const message: serverWsMessage = {
			messageType: "server",
			name: name
		};
		this.send(message);
	}

	/**
	 * sends a request to download all the objects in the world already
	 */
	static sendWorldRequest ()
	{
		const message: worldWsMessage = {
			messageType: "world"
		};
		this.send(message);
	}

	/**
	 * sends the data of a gameObject to the other players
	 * @param {uuid | uuid[]} objectIdArray objects to be sent
	 */
	static sendObjectsUpdate (objectIdArray: uuid | uuid[] = Object.keys(GameData.gameObjects))
	{
		if (!Array.isArray(objectIdArray)) objectIdArray = [objectIdArray];


		const data: Record<string, objectData> = {};
		console.log(`sending objectsUpdate on ${objectIdArray.length} objects`);
		objectIdArray.forEach((objectId) =>
		{
			data[objectId] = this.getMessageObject(objectId);
		});

		const message: objectWsMessage = {
			messageType: "object",
			data: data
		};
		this.send(message);
	}

	/**
	 * collects the data from an object and puts it in the right format to be sent over the socket
	 * @param {uuid} objectId id of the gameObject to get the data from
	 * @returns
	 */
	static getMessageObject (objectId: uuid): objectData
	{
		const object = GameData.getObjectFromId(objectId);
		const data: objectData = {
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

	/**
	 * updates the current gameObjects to the new versions received over a websocket
	 * @param {Record<uuid, messageObject>} objectList jsObject containing data about gameObjects
	 */
	static updateObjects (objectList: Record<uuid, objectData>)
	{
		Object.keys(objectList).forEach((objectId) =>
		{
			const objectData = objectList[objectId];

			if (Object.keys(GameData.gameObjects).includes(objectId))
			{
				const localObject = GameData.getObjectFromId(objectId);
				if (localObject.name == objectData.name &&
					localObject.constructor.name == objectData.type)
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

	/**
	 * creates a new gameObject from a messageObject
	 * @param {messageObject} messageObject data of a gameObject that has been sent over a websocket
	 */
	static createNewObject (messageObject: objectData)
	{
		const newObject = new Loader.objectTypes[messageObject.type]();
		newObject.id = messageObject.id;

		GameData.storeObject(newObject, messageObject.name);

		Object.keys(messageObject.data).forEach((key) =>
		{
			newObject.hexiObject[key] = messageObject.data[key];
		});
	}

	/**
	 * sends the messages received over the sockets to the functions that can handle them
	 * @param {JSON} ev socketMessage
	 */
	static handleSocketMessage (ev: {data: string;})
	{
		const message = JSON.parse(ev.data) as WsMessage;

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

	/**
	 * sends an object over the websocket or saves it if the websocket is not open yet
	 * @param {jsObject} message object to be sent over the websocket
	 */
	static send (message: WsMessage)
	{
		console.log(`socket message sent:`);
		console.log(message);
		socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.messageBuffer.push(message);
	}
}

// create websocket
console.log(window.location.href.split("/")[2]);
const socket = new WebSocket(`ws://${window.location.href.split("/")[2]}`);

// add the listener
socket.addEventListener("message", WebSocketHandler.handleSocketMessage);
socket.onopen = function (_ev)
{
	console.log("WebSocket is open now.");
	WebSocketHandler.executeBuffer();
};
