class WebSocketHandler
{
	static handleSocketMessage (ev)
	{
		ev = JSON.parse(ev.data);
		ev = ev.response;
		ev.forEach((obj) =>
		{
			const key = Object.keys(obj)[0];
			const test = obj[key];
			console.log(`socket message received: ${test}`);
			switch (key)
			{
				case "update":
					WebSocketHandler.handleUpdate(obj);
					break;
				case "create":
					WebSocketHandler.handleCreation(obj);
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
		socket.send(JSON.stringify(message));
	}

	static sendCreate (objectType, name, x, y)
	{
		const message = {
			"create": {
				"objectType": objectType,
				"objectName": name,
				"x": x,
				"y": y
			}
		};
		socket.send(JSON.stringify(message));
	}

	static handleUpdate (message)
	{
		if (!message.type) return;

		console.log(`type: ${message.type}`);
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
		instance.hexiObject.x = x;
		instance.hexiObject.y = y;
		GameData.storeObject(instance, name);
	}

	static speedUpdate (objectId, vx, vy)
	{
		const hexiObject = GameData.getObjectFromId(objectId).hexiObject;
		hexiObject.vx = vx;
		hexiObject.vy = vy;
	}
}

// create websocket
const socket = new WebSocket('ws:localhost:8186');

// add the listener
socket.addEventListener("message", WebSocketHandler.handleSocketMessage);
