import {World} from "./game/server/world.ts";
import {WebsocketHanlder} from "./websocketHandler.ts";
import
{
	acceptWebSocket,
	acceptable,
	Server,
	serve,
	ServerRequest,
	setCookie,
	getCookies,
	Cookie,
} from "../deps.ts";
import {readAll} from "https://deno.land/std@0.95.0/io/util.ts";

import Router from "./router.ts";

export default class HttpServer
{
	private server?: Server;
	private idCounter = 0;
	private serverList: Record<number, World> = {};
	private idMap = new Map<number, Date>();
	private Router = new Router;
	decoder = new TextDecoder();

	constructor ()
	{
		// this.addClientFile("images/strawberry.png");
		// this.addClientFile("index.html");
		// this.addClientFile("pixi.min.js");
		// this.addClientFile("game/sprites/strawberry.png");
		// this.addClientFile("strawberry.js");
	}

	private generateWorldId ()
	{
		this.idCounter++;
		return this.idCounter;
	}

	async start (port = 8080)
	{
		this.Router.setRoutes('MultiplayerHexiGame/src/game/client', 0);
		this.server = serve(`:${port}`);
		console.log(`HTTP webserver running. Access it at:  http://localhost:${port}/`);


		for await (const req of this.server)
		{
			console.group(`Request: ${req.method} ${req.url}`);

			if (acceptable(req))
				this.webSocketRequest(req);
			else
				this.httpRequest(req);

			console.groupEnd();
		}
	}

	private async webSocketRequest (req: ServerRequest)
	{
		console.group("socket...");

		if (this.validateId(parseInt(getCookies(req).websocketId)))
		{
			console.debug("socket accepted");

			const {conn, headers, r: bufReader, w: bufWriter} = req;
			const sock = await acceptWebSocket({
				conn,
				headers,
				bufReader,
				bufWriter,
			});
			const serverId = parseInt(getCookies(req).serverId);
			this.serverList[serverId].addSocket(sock);
		}
		else
		{
			console.debug("socket rejected");
		}
		console.groupEnd();
	}

	private httpRequest (req: ServerRequest)
	{

		switch (req.method)
		{
			case ("GET"):
				this.httpGetRequest(req);

				break;
			case ("POST"):
				this.httpPostRequest(req);

				break;
			default:
				req.respond({status: 418, body: "invalid req"});
		}
	}
	private httpGetRequest (req: any)
	{
		req.respond({status: 200, body: this.Router.resolveRoute(req.url)});
	}

	private httpPostRequest (req: ServerRequest)
	{
		switch (req.url)
		{
			case ("/join"):
				this.joinServer(req);
				break;
			case ("/newServer"):
				this.newServer(req);
				break;
			default:
				this.respond(req, 418, "index.html");
				console.debug("unclear post request");
		}
	}

	private generateWsId (): number
	{
		// FIXME: Use ip?
		const id = Date.now(); //maybe not use time here...
		this.idMap.set(id, new Date());
		return id;
	}

	private validateId (id: number): boolean
	{
		console.group(`Validating ${id}...`);
		if (this.idMap.has(id))
		{
			console.debug("id exists");
			if ((this.idMap.get(id) as Date).getTime() > Date.now() - 10000)
			{
				console.debug("id valid!");
				console.groupEnd();
				return true;
			} else
			{
				console.debug("outdated");
				this.idMap.delete(id);
			}
		}
		console.debug("id invalid");
		console.groupEnd();
		return false;
	}

	private returnServerList (req: ServerRequest)
	{
		const file = `const serverList = ${JSON.stringify(this.serverList)};`;
		this.respond(req, 200, file);
	}

	private async joinServer (req: ServerRequest)
	{
		const uint8ArrayBody: Uint8Array = await readAll(req.body);
		const body = this.decoder.decode(uint8ArrayBody);
		const serverId = body.replace("serverId=", "");
		console.debug(`serverId: ${serverId}`);

		const path = "MultiplayerHexiGame/src/game/client";
		const file = Deno.readFileSync(`${path}/game.html`);
		const cookieSet = new Set<Cookie>();
		const websocketIdCookie: Cookie = {name: "websocketId", value: this.generateWsId() + "", maxAge: 10};
		const serverIdCookie: Cookie = {name: "serverId", value: serverId + "", maxAge: 10};
		cookieSet.add(websocketIdCookie);
		cookieSet.add(serverIdCookie);
		this.respond(req, 200, file, cookieSet);
	}

	private newServer (req: ServerRequest)
	{
		const worldId = this.generateWorldId();
		const world = new World(worldId);
		this.serverList[worldId] = world;
		console.debug("new server created!");

		const path = "MultiplayerHexiGame/src/game/client";
		const file = Deno.readFileSync(`${path}/game.html`);
		const cookieSet = new Set<Cookie>();
		const websocketIdCookie: Cookie = {name: "websocketId", value: this.generateWsId() + "", maxAge: 10};
		const serverIdCookie: Cookie = {name: "serverId", value: worldId + "", maxAge: 10};
		cookieSet.add(websocketIdCookie);
		cookieSet.add(serverIdCookie);
		this.respond(req, 200, file, cookieSet);
	}

	private respond (req: ServerRequest, status: number, file: string | Uint8Array, cookieSet?: Set<Cookie>)
	{
		const response: Response = new Response();
		if (cookieSet)
		{
			cookieSet.forEach((cookie) =>
			{
				setCookie(response, cookie);
			});
		}

		req.respond({status: status, headers: response.headers, body: file});
	}

}
