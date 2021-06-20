import {World} from "./game/server/world.ts";

import
{
	Server,
	serve,
	ServerRequest,
	setCookie,
	Cookie,
} from "../deps.ts";

export default class HttpServer
{
	private server?: Server;
	private idCounter = 0;
	private serverList: Record<number, World> = {};
	private clientFiles = new Map<string, string>();

	constructor ()
	{
		// this.addClientFile("images/strawberry.png");
		// this.addClientFile("index.html");
		// this.addClientFile("pixi.min.js");
		// this.addClientFile("game/sprites/strawberry.png");
		// this.addClientFile("strawberry.js");
	}

	private genId ()
	{
		this.idCounter++;
		return this.idCounter;
	}

	private addClientFile (fileName: string)
	{
		const path = "./client";
		const file = Deno.readTextFileSync(`${path}/${fileName}`);
		this.clientFiles.set(fileName, file);
	}

	async start (port = 8080)
	{

		this.server = serve(`:${port}`);
		console.log("running server...");


		for await (const req of this.server)
		{
			console.group(`Request: ${req.method} ${req.url}`);

			this.httpRequest(req);

			console.groupEnd();
		}
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
		req.respond({status: 200, headers: new Response().headers, body: file});
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

	returnServerList (req: ServerRequest)
	{
		const file = `const serverList = ${JSON.stringify(this.serverList)};`;
		req.respond({status: 200, headers: new Response().headers, body: file});
	}

	newServer (req: ServerRequest)
	{
		const id = this.genId();
		const world = new World(id);
		this.serverList[id] = world;
		console.debug("new server created!");

		const path = "./src/game/client";
		const file = Deno.readFileSync(`${path}/game.html`);
		req.respond({status: 200, headers: new Response().headers, body: file});
	}

	private respond (req: ServerRequest, status: number, file: string, cookieSet?: Set<Cookie>)
	{

		if (this.clientFiles.get(file))
			file = this.clientFiles.get(file) as string;

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
