export default class Router
{

	private routes: Record<string, string>;
	constructor ()
	{
		this.routes = {};
		//this.setRoutes('./src/server/html',0);
	}
	// This sets the url required to reach the html file
	async setRoutes (path: string, subDir: number)
	{
		for await (const dirEntry of Deno.readDir(path))
		{

			//check if its a directory
			if (dirEntry.isDirectory && subDir == 0)
			{
				this.setRoutes(path + '/' + dirEntry.name, subDir + 1);
			}
			//check if its a file and then add it to the routes
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
					console.log(pathArray[pathArray.length - 1]);
				}

				if (regArray !== null)
				{
					this.routes[regArray[0]] = path + "/" + dirname;
				};
			};
		};
		console.log(this.routes);
	}
	resolveRoute (url: string): string | Uint8Array
	{
		url = url.slice(1);
		//console.log(url)

		if (this.routes[url])
		{
			const file = Deno.readFileSync(this.routes[url]);
			return file;
		}
		const file = Deno.readFileSync(`./src/server/html/badUrl.html`);
		return file;
	}
}
