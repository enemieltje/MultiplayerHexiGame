class WebSocketHandler
{
	static messageBuffer = []; // a buffer of all the messages sent before the websocket was open

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
	static sendWorldRequest ()
	{
		const message = {
			messageType: "world"
		};
		this.send(message);
	}

	/**
	 * sends the data of a gameObject to the other players
	 * @param {uuid | uuid[]} objectIdArray objects to be sent
	 */
	static sendObjectsUpdate (objectIdArray = Object.keys(GameData.gameObjects))
	{
		if (!Array.isArray(objectIdArray)) objectIdArray = [objectIdArray];

		const message = {
			messageType: "object",
			data: {}
		};
		console.log(`sending objectsUpdate on: ${objectIdArray}`);
		objectIdArray.forEach((objectId) =>
		{
			message.data[objectId] = this.getMessageObject(objectId);
		});
		this.send(message);
	}

	/**
	 * collects the data from an object and puts it in the right format to be sent over the socket
	 * @param {uuid} objectId id of the gameObject to get the data from
	 * @returns
	 */
	static getMessageObject (objectId)
	{
		const object = GameData.getObjectFromId(objectId);
		return {
			id: objectId,
			name: object.name,
			type: object.__proto__.constructor.name,
			data: {
				x: object.hexiObject.x,
				y: object.hexiObject.y,
				vx: object.hexiObject.vx,
				vy: object.hexiObject.vy
			}
		};
	}

	/**
	 * updates the current gameObjects to the new versions received over a websocket
	 * @param {Record<uuid, messageObject>} objectList jsObject containing data about gameObjects
	 */
	static updateObjects (objectList)
	{
		Object.keys(objectList).forEach((objectId) =>
		{
			const messageObject = objectList[objectId];

			if (Object.keys(GameData.gameObjects).includes(objectId))
			{
				const localObject = GameData.getObjectFromId(objectId);
				if (localObject.name == messageObject.name &&
					localObject.__proto__.constructor.name == messageObject.type)
				{
					Object.keys(messageObject.data).forEach((key) =>
					{
						localObject.hexiObject[key] = messageObject.data[key];
					});
				} else
				{
					GameData.deleteObjectFromId(objectId);
					this.createNewObject(messageObject);
				}
			} else
			{
				this.createNewObject(messageObject);
			}
		});
	}

	/**
	 * creates a new gameObject from a messageObject
	 * @param {messageObject} messageObject data of a gameObject that has been sent over a websocket
	 */
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

	/**
	 * sends the messages received over the sockets to the functions that can handle them
	 * @param {JSON} ev socketMessage
	 */
	static handleSocketMessage (ev)
	{
		ev = JSON.parse(ev.data);

		console.log(`socket message received:`);
		console.log(ev);

		switch (ev.messageType)
		{
			case "object":
				WebSocketHandler.updateObjects(ev.data);
				break;
			case "world":
				WebSocketHandler.sendObjectsUpdate();
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
	static send (message)
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
