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

export default class HttpServer
{
	private server?: Server;
	private idCounter = 0;
	private serverList: Record<number, World> = {};
	private idMap = new Map<number, Date>();

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

		this.server = serve(`:${port}`);
		console.log("running server...");


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

		if (this.validateId(parseInt(getCookies(req).id)))
		{
			console.debug("socket accepted");

			const {conn, headers, r: bufReader, w: bufWriter} = req;
			const sock = await acceptWebSocket({
				conn,
				headers,
				bufReader,
				bufWriter,
			});

			const dashboardHandler = new WebsocketHanlder(sock, getCookies(req).uuid);

			// Pass the socket on here
			// Why we make dashboardHandler if we dont use it

		} else
		{
			console.debug("socket rejected");
		}
		console.groupEnd();
	}

	private httpRequest (req: ServerRequest)
	{
		// console.debug(req.headers);
		switch (req.method)
		{
			case ("GET"):
				this.httpGet(req);
				break;
			case ("POST"):
				this.httpPost(req);
				break;
			default:
				req.respond({status: 418, body: "invalid request"});
		}
	}

	private httpGet (req: ServerRequest)
	{
		if (req.url == "/serverList")
		{
			this.returnServerList(req);
			return;
		}

		const path = "./src/game/client";
		let file: Uint8Array;
		const folders = req.url.split("/");
		const targetedFile = folders[folders.length - 1];
		const extentionDotCount = (targetedFile.match(/\./g) || []).length;
		const totalDotCount = (req.url.match(/\./g) || []).length;
		try
		{
			if (req.url.includes("./") || totalDotCount > extentionDotCount)
			{
				file = Deno.readFileSync(`${path}/index.html`);
				console.debug("malicious request, responded with index html");
			}
			else
			{
				file = Deno.readFileSync(`${path}/${req.url}`);
			}
		} catch (error)
		{
			file = Deno.readFileSync(`${path}/index.html`);
			console.debug(`${path}/index.html`);
			console.debug("file not found, responded with index html");
		}
		this.respond(req, 200, file);
	}

	private httpPost (req: ServerRequest)
	{
		switch (req.url)
		{
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

	private newServer (req: ServerRequest)
	{
		const worldId = this.generateWorldId();
		const world = new World(worldId);
		this.serverList[worldId] = world;
		console.debug("new server created!");

		const path = "./src/game/client";
		const file = Deno.readFileSync(`${path}/game.html`);
		const cookieSet = new Set<Cookie>();
		const cookie: Cookie = {name: "id", value: this.generateWsId() + "", maxAge: 10};
		cookieSet.add(cookie);
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
