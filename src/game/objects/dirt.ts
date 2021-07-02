import {GameObject, GameData, Loader} from "../utils/deps.ts";

export class Dirt extends GameObject
{
	x = 0;
	y = 0;
	map = [15, 14, 3, 2, 12, 13, 0, 1, 11, 10, 7, 6, 8, 9, 4, 5];

	constructor ()
	{
		super("dirt");
		this.useTileset = true;
		this.doubleSize();

		this.texture = [];
		for (let i = 0; i < 16; i++)
		{
			this.texture.push(`dirt${i}.png`);
		}
	}

	public updateSprite ()
	{
		let binary = "";
		binary += GameData.getBlock(this.x, this.y - 1) == "Dirt" ? "1" : "0";
		binary += GameData.getBlock(this.x + 1, this.y) == "Dirt" ? "1" : "0";
		binary += GameData.getBlock(this.x, this.y + 1) == "Dirt" ? "1" : "0";
		binary += GameData.getBlock(this.x - 1, this.y) == "Dirt" ? "1" : "0";

		const dec = parseInt(binary, 2);
		let index = this.map[dec];
		if (index === undefined) index = dec;
		this.hexiObject.show(index);
	}

	doubleSize (id?: number)
	{
		if (!this.hexiObject || !this.hexiObject.scale)
		{
			const id = setInterval(() => {this.doubleSize(id);}, 100);
			return;
		}
		clearInterval(id);
		this.hexiObject.scale = {x: 2, y: 2};
		this.updateSprite();
	}

	// the game tick in the play state
	playTick ()
	{
		// let hexi move the object according to the speed
		// hexiGame.move(this.hexiObject);
	}

	// add all the spritenames that need to be loaded
	static onLoad ()
	{
		super.onLoad(["simpleSpriteMapDirt.json"]);
	}

	// create the instances
	static create ()
	{
		// GameData.storeObject(new Dirt(), "dirt");
	}
}
// add the class to the objectTypes so it gets loaded
Loader.objectTypes.Dirt = Dirt;
