class GameObject
{
	name;
	hexiObject; // the object hexi uses for physics
	id = GameData.genId(); // the id the gamedata uses to identify instances

	constructor (texture, name)
	{
		this.name = name;
		// create a hexiObject with the default sprite
		this.hexiObject = hexiGame.sprite(`sprites/${texture}`);
	}

	/**
	 * add this instance to a parent so it is visible on screen
	 * @param {HexiGroup} parent - parent to add the instance to
	 */
	addToParent (parent = gameScene)
	{
		parent.addChild(this.hexiObject);
	}

	/**
	 * remove this instance from a parent so it is no longer visible on screen
	 * @param {HexiGroup} parent - parent to remove this instance from
	 */
	removeFromParent (parent = gameScene)
	{
		parent.removeChild(this.hexiObject);
	}

	// gameTick
	playTick () {}

	/**
	 * collect all the sprites an sounds that hexi needs to load for this object
	 * @param {Array<String>} sprites the filenames of the sprites
	 * @param {Array<String>} sounds the filenames of the sounds
	 */
	static onLoad (sprites = [], sounds = [])
	{
		sprites.forEach((spritePath) =>
		{
			GameData.addSprite(spritePath);
		});

		sounds.forEach((soundPath) =>
		{
			GameData.addSound(soundPath);
		});
	}

	// create the instances of this object for the start of the game, new ones can be made later also
	static create () {}
}
