import
{
	WebSocket,
	isWebSocketCloseEvent,
	isWebSocketPingEvent,
	isWebSocketPongEvent
} from "../deps.ts";

export class WebsocketHanlder
{
	private websocket: WebSocket;
	private userId: string;

	/**
	 * Handles a dashboard of one specific logged in user
	 * @param acceptedSocket the websocket over which this dashboard is sent
	 * @param userId id of the user that logged in to this dashboard
	 * @param pluginLoader the pluginLoader that contains the plugins available to logged in users
	 */
	constructor (acceptedSocket: WebSocket, userId: string)
	{
		this.websocket = acceptedSocket;
		this.userId = userId;
		this.listenToSocket();
	}

	/**
	 *
	 * @returns userID
	 */
	getUserId ()
	{
		return this.userId;
	}

	private async listenToSocket ()
	{
		try
		{
			for await (const ev of this.websocket)
			{
				if (typeof ev === "string")
				{
					console.debug(`ws:Text ${ev}`);
					this.onMessage(ev);
				}
				else if (ev instanceof Uint8Array)
				{
					console.debug(`ws:Binary ${ev}`);
				}
				else if (isWebSocketPingEvent(ev) )
				{
					const [, body] = ev;
					console.debug(`ws:Ping ${body}`);
				}
				else if (isWebSocketPongEvent(ev) )
				{
					const [, body] = ev;
					console.debug(`ws:Pong ${body}`);
				}
				else if (isWebSocketCloseEvent(ev) )
				{
					const {code, reason} = ev;
					console.debug(`ws:Close ${code} ${reason}`);
				}
			}

		} catch (error)
		{
			console.debug(`websocket event errored: ${error}`);
		}
	}

	private onMessage (ev: string)
	{
		const jsonMessage = JSON.parse(ev);
		for (const item in jsonMessage)
		{
			this.executeItem(item, jsonMessage[item]);
		}
	}
}
