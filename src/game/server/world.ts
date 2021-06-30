import
{
	WebSocket,
	isWebSocketCloseEvent,
	isWebSocketPingEvent,
	isWebSocketPongEvent
} from "../../../deps.ts";

export class World
{
	private name = "new world";
	private socketList: Record<number, WebSocket> = {};
	private id: number;
	private refresh = false;

	public playerAmount = 0;

	constructor (id: number)
	{
		this.id = id;
	}

	addSocket (socket: WebSocket)
	{
		let index = Object.keys(this.socketList).length;
		while (Object.keys(this.socketList).includes(index + ""))
			index++;
		this.socketList[index] = (socket);
		this.playerAmount = Object.keys(this.socketList).length;
		this.listenToSocket(socket, index);
		console.debug(`socket ${index} received`);
	}

	private removeSocket (index: number)
	{
		delete this.socketList[index];
		this.playerAmount = Object.keys(this.socketList).length;
	}

	private async listenToSocket (sock: WebSocket, index: number)
	{
		try
		{
			console.debug(`listening to socket ${index}`);
			for await (const ev of sock)
			{
				if (typeof ev === "string")
				{
					console.debug(`ws:String ${ev}`);
					this.onMessage(ev, index);
				}
				else if (ev instanceof Uint8Array)
				{
					console.debug(`ws:Binary ${ev}`);
				}
				else if (isWebSocketPingEvent(ev))
				{
					const [, body] = ev;
					console.debug(`ws:Ping ${body}`);
				}
				else if (isWebSocketPongEvent(ev))
				{
					const [, body] = ev;
					console.debug(`ws:Pong ${body}`);
				}
				else if (isWebSocketCloseEvent(ev))
				{
					const {code, reason} = ev;
					this.removeSocket(index);
					console.debug(`ws:Close ${code} ${reason}`);
					return;
				}

				if (this.refresh)
				{
					this.refresh = false;
					return;
				}
			}

		} catch (error)
		{
			console.debug(`websocket event errored: ${error}`);
		}
	}

	private onMessage (ev: string, sourceIndex: number)
	{
		const evData = JSON.parse(ev);
		if (evData.messageType == "server")
		{
			this.returnWorld(this.socketList[sourceIndex], evData.name as string);
			return;
		}

		Object.keys(this.socketList).forEach((index) =>
		{
			const sock = this.socketList[index as unknown as number];
			if (index as unknown as number == sourceIndex as unknown as number) return;
			console.debug(`sending data: ${ev}`);
			sock.send(ev);
		});
	}
	private returnWorld (sock: WebSocket, name: string)
	{
		const path = `./src/game/server/data/${name}.json`;
		console.debug(`reading file ${path}`);
		const file = Deno.readTextFileSync(path);
		const message = {
			messageType: "worldData",
			data: JSON.parse(file)
		};
		sock.send(JSON.stringify(message));
	}
}
