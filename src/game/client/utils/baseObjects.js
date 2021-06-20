class GameObject
{
	hexiObject;
	id = GameData.genId();

	currentImageName;

	constructor (texture)
	{
		// this.hexiObject = hexiGame.sprite(`sprites/${texture}`);
	}

	addToParent (parent = gameScene)
	{
		parent.addChild(this.hexiObject);
	}

	removeFromParent (parent = gameScene)
	{
		parent.removeChild(this.hexiObject);
	}

	playTick () {}

	static onLoad (sprites = [])
	{
		console.log(`loading objectSprites: ${sprites}`);
		sprites.forEach((spritePath) =>
		{
			console.log(`loading sprite: ${spritePath}`);

			GameData.addSprite(spritePath);

		});
	}

	static create () {}

	// set image (imageName)
	// {
	// 	if (this.currentImageName != imageName)
	// 	{
	// 		const image = GameData.getSprite(imageName);
	// 		if (!image)
	// 		{
	// 			console.log(`${imageName} is not a valid image`);
	// 			return;
	// 		}

	// 		this.spriteOffset = GameData.getSpriteOffset(imageName);

	// 		this.hexiObject.textures = image;
	// 		this.hexiObject.play();
	// 		this.currentImageName = imageName;
	// 	}
	// }

	// get image ()
	// {
	// 	return this.currentImageName;
	// }
}
