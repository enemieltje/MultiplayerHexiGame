class Loader
{
	static objectTypes = {}; // each object class gets added here
	static globalSounds = []; // all filenames of sounds that do not specifically belong to an object

	// load the objects and sounds
	static load ()
	{
		console.log("Loading Objects");
		Loader.objectTypes.forEach(object =>
		{
			object.onLoad();
		});

		console.log("Loading global Sounds");
		Loader.globalSounds.forEach(sound =>
		{
			GameData.addSound(sound);
		});
	}

	// create instances of the objects
	static createObjects ()
	{
		console.log("Creating Objects");
		Object.keys(Loader.objectTypes).forEach(objectName =>
		{
			Loader.objectTypes[objectName].create();
		});
	}
}
