class WebSocketHandler
{
	static functionBuffer = [];
	static responseBuffer = [];
	static token = 0;

	static executeBuffer ()
	{
		this.functionBuffer.forEach((message, i) =>
		{
			socket.send(JSON.stringify(message));
			delete this.functionBuffer[i];
		});
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

	static send (message)
	{
		console.log(`socket message sent:`);
		console.log(message);
		socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.functionBuffer.push(message);
	}
}

// create websocket
const socket = new WebSocket('ws:localhost:8080');

// add the listener
socket.addEventListener("message", WebSocketHandler.handleSocketMessage);
socket.onopen = function (_ev)
{
	console.log("WebSocket is open now.");
	WebSocketHandler.executeBuffer();
};
