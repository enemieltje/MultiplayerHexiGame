class WebSocketHandler
{
	static functionBuffer = [];

	static executeBuffer ()
	{
		this.functionBuffer.forEach((message, i) =>
		{
			socket.send(JSON.stringify(message));
			delete this.functionBuffer[i];
		});
	}

	static handleSocketMessage (ev)
	{
		ev = JSON.parse(ev.data);

		console.log(`socket message received:`);
		console.log(ev);

		Object.keys(ev).forEach((functionName) =>
		{

			const data = ev[functionName];
			switch (functionName)
			{
				case "update":
					WebSocketHandler.handleUpdate(data);
					break;
				case "create":
					WebSocketHandler.handleCreation(data);
					break;
				case "downloadRequest":
					WebSocketHandler.handleDownloadRequest(data);
					break;
				case "downloadResponse":
					WebSocketHandler.receiveEverything(data);
					break;
				default:
					console.log("no response");
					break;
			}
		});
	}

	static sendUpdate (objectId, vx, vy)
	{
		const message = {
			"update": {
				"type": "speed",
				"objectId": objectId,
				"vx": vx,
				"vy": vy
			}
		};

		console.log(`socket message sent:`);
		console.log(message);
		socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.functionBuffer.push(message);
	}

	static sendCreate (objectType, name, x, y)
	{
		const message = {
			"create": {
				"type": "singleObject",
				"objectType": objectType,
				"objectName": name,
				"x": x,
				"y": y
			}
		};

		console.log(`socket message sent:`);
		console.log(message);
		socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.functionBuffer.push(message);
	}

	static sendDownloadRequest ()
	{
		const message = {
			"downloadRequest": "everything"
		};

		console.log(`socket message sent:`);
		console.log(message);
		socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.functionBuffer.push(message);
	}

	static handleUpdate (message)
	{
		if (!message.type) return;

		switch (message.type)
		{
			case "speed":
				WebSocketHandler.speedUpdate(message.objectId, message.vx, message.vy);
				break;
			default:
				console.log("no response");
				break;
		}
	}

	static handleCreation (message)
	{
		if (!message.type) return;

		console.log(`type: ${message.type}`);
		switch (message.type)
		{
			case "singleObject":
				WebSocketHandler.createSingleObject(message.objectType, message.objectName, message.x, message.y);
				break;
			default:
				console.log("no response");
				break;
		}
	}

	static handleDownloadRequest (message)
	{
		console.log("I see download!");
		// if (!message.downloadRequest) return;

		console.log(`type: ${message}`);
		switch (message)
		{
			case "everything":
				WebSocketHandler.sendEverything();
				break;
			default:
				console.log("no response");
				break;
		}

	}

	static createSingleObject (type, name, x, y, vx = 0, vy = 0)
	{
		const instance = new Loader.objectTypes[type]();
		if (x) instance.hexiObject.x = x;
		if (y) instance.hexiObject.y = y;
		instance.hexiObject.vx = vx;
		instance.hexiObject.vy = vy;
		GameData.storeObject(instance, name);
	}

	static speedUpdate (objectId, vx, vy)
	{
		if (!GameData.getObjectFromId(objectId)) return;
		const hexiObject = GameData.getObjectFromId(objectId).hexiObject;
		hexiObject.vx = vx;
		hexiObject.vy = vy;
	}

	static receiveEverything (message)
	{

		Object.keys(message.worldData).forEach((objectId) =>
		{
			const object = GameData.getObjectFromId(objectId);
			const messageObj = message.worldData[objectId];
			if (object)
			{
				if (object.__proto__.constructor.name == message.worldData[objectId].name)
				{
					object.hexiObject.x = messageObj.x;
					object.hexiObject.y = messageObj.y;
					object.hexiObject.vx = messageObj.vx;
					object.hexiObject.vy = messageObj.vy;
				} else
				{
					hexiGame.remove(object.hexiObject);
					GameData.deleteObjectFromId(objectId);

					this.createSingleObject(
						messageObj.name,
						messageObj.name,
						messageObj.x,
						messageObj.y,
						messageObj.vx,
						messageObj.vy);
				}
			} else
			{
				this.createSingleObject(
					messageObj.name,
					messageObj.name,
					messageObj.x,
					messageObj.y,
					messageObj.vx,
					messageObj.vy);
			}
		});
	}

	static sendEverything ()
	{
		console.log("I send everything!");
		const worldData = {};
		Object.keys(GameData.gameObjects).forEach((objectId) =>
		{
			const obj = {};
			const object = GameData.getObjectFromId(objectId);
			console.log(Object.keys(object));
			obj.name = object.__proto__.constructor.name;
			obj.id = object.id;
			obj.x = object.hexiObject.x;
			obj.y = object.hexiObject.y;
			obj.vx = object.hexiObject.vx;
			obj.vy = object.hexiObject.vy;
			worldData[object.id] = obj;
		});

		const message = {
			"downloadResponse": {
				"worldData": worldData
			}
		};

		console.log(`socket message sent:`);
		console.log(message);
		socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.functionBuffer.push(message);
	}
}

// create websocket
const socket = new WebSocket('ws:localhost:8186');

// add the listener
socket.addEventListener("message", WebSocketHandler.handleSocketMessage);
socket.onopen = function (_ev)
{
	console.log("WebSocket is open now.");
	WebSocketHandler.executeBuffer();
};
