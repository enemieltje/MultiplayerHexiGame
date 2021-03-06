import {GameObject, hexiGame, GameData, WebSocketHandler, Loader, objectType} from "../utils/deps.ts";

export class Player extends GameObject
{
	type: objectType = "Player";
	// declare hexiObject;
	// declare id;

	// keyboardkeys by ascii
	private walkLeft = hexiGame.keyboard(37);
	private walkUp = hexiGame.keyboard(38);
	private walkRight = hexiGame.keyboard(39);
	private walkDown = hexiGame.keyboard(40);

	constructor ()
	{
		super("player", "strawberry.png");
	}

	// the game tick in the play state
	playTick ()
	{
		// let hexi move the object according to the speed
		hexiGame.move((this.hexiObject));
	}

	// add all the spritenames that need to be loaded
	static onLoad ()
	{
		super.onLoad(["strawberry.png"]);
	}

	// create the instances
	static create ()
	{
		GameData.storeObject(new Player(), "player");
	}

	// modified walk thingy from hexi tutorial
	/**
	 * initialise the keys used to control the player
	 */
	defineMovementKeys ()
	{
		//Left arrow key `press` method
		this.walkLeft.press = () =>
		{
			//Change the player's velocity when the key is pressed
			(this.hexiObject).vx = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};

		//Left arrow key `release` method
		this.walkLeft.release = () =>
		{
			//If the left arrow has been released, and the right arrow isn't down,
			//and the player isn't moving vertically:
			//Stop the player
			if (!this.walkRight.isDown)
			{
				(this.hexiObject).vx = 0;
			} else (this.hexiObject).vx = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};

		//The up arrow
		this.walkUp.press = () =>
		{
			(this.hexiObject).vy = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkUp.release = () =>
		{
			if (!this.walkDown.isDown)
			{
				(this.hexiObject).vy = 0;
			} else (this.hexiObject).vy = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};

		//The right arrow
		this.walkRight.press = () =>
		{
			(this.hexiObject).vx = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkRight.release = () =>
		{
			if (!this.walkLeft.isDown)
			{
				(this.hexiObject).vx = 0;
			} else (this.hexiObject).vx = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};

		//The down arrow
		this.walkDown.press = () =>
		{
			(this.hexiObject).vy = 5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
		this.walkDown.release = () =>
		{
			if (!this.walkUp.isDown)
			{
				(this.hexiObject).vy = 0;
			} else (this.hexiObject).vy = -5;
			WebSocketHandler.sendObjectsUpdate(this.id);
		};
	}
}
// add the class to the objectTypes so it gets loaded
Loader.objectTypes.Player = Player;
