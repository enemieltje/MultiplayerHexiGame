class Loader
{
	// will be done automatically for each object file
	// static objectTypes = [Strawberry, Ready, Background, Block, Planet];
	static objectTypes = [];

	static spritesReady = false;
	static soundsReady = true;
	static ready = false;

	/**
	 * calls the onLoad function for each Type of object
	 * @returns void
	 */
	static load ()
	{
		// const style = new PIXI.TextStyle({
		// 	fontSize: 12,
		// 	fill: "white",
		// });
		// GameData.debugScreen = new PIXI.Text("", style);

		return new Promise((resolve) =>
		{
			Loader.loadSprites().then(() =>
			{
				resolve();
				// if (Loader.soundsReady) resolve();
			});

			// Loader.loadSounds().then(() =>
			// {
			// 	if (Loader.spritesReady) resolve();
			// });
		});
	}

	// static loadSounds ()
	// {
	// 	return new Promise(resolve =>
	// 	{
	// 		const soundArray = [];
	// 		const path = "sounds";

	// 		Loader.objectTypes.forEach(object =>
	// 		{
	// 			if (!object.soundFiles) return;
	// 			object.soundFiles.forEach(sound =>
	// 			{
	// 				soundArray.push(`${path}/${sound}`);
	// 			});
	// 		});

	// 		sounds.load(soundArray);

	// 		sounds.onProgress = (progress, res) =>
	// 		{
	// 			console.log('File ' + res.url + ' just finished loading.');
	// 			console.log(progress + '% done');
	// 		};

	// 		sounds.whenLoaded = () =>
	// 		{
	// 			Loader.soundsReady = true;
	// 			resolve();
	// 			Loader.init();
	// 		};
	// 	});
	// }

	static loadSprites ()
	{
		console.log("Loading Sprites");
		return new Promise(resolve =>
		{
			Loader.objectTypes.forEach(object =>
			{
				object.onLoad();
			});
			resolve();
		});
	}

	static createSprites ()
	{
		console.log("Creating Sprites");

		// GameData.loadSprites();
		Loader.objectTypes.forEach(object =>
		{
			console.log(`creating ${object.name}`);
			object.create();
		});

		console.log("Sprites finished creating");
		Loader.spritesReady = true;
		Loader.init();
	}

	static init ()
	{
		if (!Loader.spritesReady || !Loader.soundsReady) return;

		Loader.ready = true;
	}
}
