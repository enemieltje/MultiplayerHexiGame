export default class Router
{
	private path = "./src/game/client";
	private routes: Record<string, string>;
	constructor ()
	{
		this.routes = {};
		//this.setRoutes('./src/server/html',0);
	}
	// This sets the url required to reach the html string
	async setRoutes (path: string, subDir: number)
	{
		for await (const dirEntry of Deno.readDir(path))
		{
			//check if its a directory
			if (dirEntry.isDirectory && subDir == 0)
			{
				this.setRoutes(path + '/' + dirEntry.name, subDir + 1);
			}
			//check if its a string and then add it to the routes
			if (dirEntry.isFile)
			{
				const regexPathObj = RegExp(/[^\\/]{1,}/g);
				const regexUrlObj = RegExp(/[^.]{1,}/g);

				let dirname = dirEntry.name;
				let regArray = regexUrlObj.exec(dirname) as RegExpExecArray;

				for (let iter = subDir; iter > 0; iter--)
				{

					let pathArray: Array<string> = [];
					let FregArray: RegExpExecArray | null;
					while ((FregArray = regexPathObj.exec(path)) != null)
					{
						pathArray.push(FregArray[0]);
					}
					//make url append
					// console.log(pathArray[pathArray.length - 1]);
				}

				if (regArray !== null)
				{
					const subname = dirname.split(".");
					if (subname[subname.length - 1] == "map")
						this.routes[regArray[0] + ".map"] = path + "/" + dirname;
					else
						this.routes[regArray[0]] = path + "/" + dirname;
				};
			};
		};
		// console.log(this.routes);
	}
	resolveRoute (url: string): string | Uint8Array
	{
		//FIXME: fix the regexp to use the key and not the values...
		url = url.slice(1);
		//console.log(url)
		//console.log(Object.values(this.routes))
		if (Object.values(this.routes).includes(`${this.path}/${url}`))
		{
			const file = Deno.readFileSync(`${this.path}/${url}`);
			return file;
		}
		console.log("can't find " + url);
		console.log(`${this.path}/index.html`);
		const file = Deno.readFileSync(`${this.path}/index.html`);
		return file;
	}
}
