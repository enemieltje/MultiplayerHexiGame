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
	private socketList: WebSocket[] = [];
	private id: number;
	private refresh = false;

	public playerAmount = 0;

	constructor (id: number)
	{
		this.id = id;
	}

	addSocket (socket: WebSocket)
	{
		const index = this.socketList.length;
		this.socketList.push(socket);
		this.playerAmount = this.socketList.length;
		this.listenToSocket(socket, index);
		console.debug(`socket ${index} received`);
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
					console.debug(`ws:Close ${code} ${reason}`);
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
		console.debug(`socketListLength: ${this.socketList.length}`);
		this.socketList.forEach((sock, index) =>
		{
			if (index == sourceIndex) return;
			console.debug(`sending data: ${ev}`);
			sock.send(ev);
		});
	}
}
