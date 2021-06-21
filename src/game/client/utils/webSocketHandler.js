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
		console.log(JSON.stringify(ev));

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

	static createSingleObject (type, name, x, y)
	{
		const instance = new Loader.objectTypes[type]();
		if (x) instance.hexiObject.x = x;
		if (y) instance.hexiObject.y = y;
		GameData.storeObject(instance, name);
	}

	static speedUpdate (objectId, vx, vy)
	{
		if (!GameData.getObjectFromId(objectId)) return;
		const hexiObject = GameData.getObjectFromId(objectId).hexiObject;
		hexiObject.vx = vx;
		hexiObject.vy = vy;
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
