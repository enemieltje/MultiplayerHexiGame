import
{
	WebSocket,
	isWebSocketCloseEvent,
	isWebSocketPingEvent,
	isWebSocketPongEvent
} from "../../../deps.ts";

import {GameObject, GameData} from "./gameData.ts";
/*
export type clientMessage =
	{
		messageType: "client";
		data: unknown;
	};

export type serverMessage =
	{
		messageType: "server";
		data: genIdMessage | storeMessage | getIdMessage | getNameMessage | getNameArrayMessage;
	};

export type genIdMessage =
	{
		type: "genId";
		token: number;
	};

export type storeMessage =
	{
		type: "store";
		token: number;
		object: GameObject;
		name: string;
	};

export type getIdMessage =
	{
		type: "get";
		token: number;
		id: number;
	};

export type getNameMessage =
	{
		type: "get";
		token: number;
		name: string;
		index: number | undefined;
	};

export type getNameArrayMessage =
	{
		type: "getArray";
		token: number;
		name: string;
	};

export type deleteMessage =
	{
		type: "delete";
		token: number;
		id: number;
	};

export type objectReply =
	{
		messageType: "objectReply";
		token: number;
		object: GameObject;
	};

export type idReply =
	{
		token: number;
		id: number;
	};

export type objectArrayReply =
	{
		messageType: "objectArrayReply";
		token: number;
		object: GameObject[];
	};



type uuid = number;

type message = {
	messageType: "object";
	data: Record<uuid, objectMessage>;
};

type objectMessage = {
	id: uuid;
	name: string;
	type: string;
	data: {
		x: number;
		y: number;
	};
};

*/



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
		const evData = JSON.parse(ev);
		if (evData.messageType == "server")
		{
			console.debug(`got serverMessage: ${evData}`);
			// this.handleDataRequest(evData.data, sourceIndex);
			return;
		}

		this.socketList.forEach((sock, index) =>
		{
			if (index == sourceIndex) return;
			console.debug(`sending data: ${ev}`);
			sock.send(ev);
		});
	}
	/*
		private handleDataRequest (data: genIdMessage | storeMessage | getIdMessage | getNameMessage | getNameArrayMessage,
			sourceIndex: number)
		{
			console.debug(`Received serverMessage: ${JSON.stringify(data)}`);
	
			switch (data.type)
			{
				case ("genId"):
					this.handleGenIdMessage(data, sourceIndex);
					break;
				case ("store"):
					this.handleStoreMessage(data, sourceIndex);
					break;
				case ("get"):
					this.handleGetMessage(data, sourceIndex);
					break;
				case ("getArray"):
					this.handleGetArrayMessage(data, sourceIndex);
					break;
				default:
					console.debug("no reply");
			}
		}
	
		private handleGenIdMessage (data: genIdMessage, sourceIndex: number)
		{
			const message = {token: data.token, id: GameData.genId()};
			this.socketList[sourceIndex].send(JSON.stringify(message));
		}
	
		private handleGetArrayMessage (data: getNameArrayMessage, sourceIndex: number)
		{
			const object = GameData.getObjectArrayFromName(data.name);
			const message = <objectArrayReply> {object: object, token: data.token};
			this.socketList[sourceIndex].send(JSON.stringify(message));
		}
	
		private handleGetMessage (data: getIdMessage | getNameMessage, sourceIndex: number)
		{
			if ((data as getIdMessage).id)
			{
				const object = GameData.getObjectFromId((data as getIdMessage).id);
				const message = <objectReply> {object: object, token: data.token};
				this.socketList[sourceIndex].send(JSON.stringify(message));
			} else
			{
				data = data as getNameMessage;
				const object = GameData.getObjectFromName(data.name, data.index);
				const message = <objectReply> {object: object, token: data.token};
				this.socketList[sourceIndex].send(JSON.stringify(message));
			}
		}
	
		private handleStoreMessage (data: storeMessage, sourceIndex: number)
		{
			GameData.storeObject(data.object, data.name);
			console.debug("sendCreateMessage");
		}
		*/
}
