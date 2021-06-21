class Player extends GameObject
{
	// keyboardkeys by ascii
	walkLeft = hexiGame.keyboard(37);
	walkUp = hexiGame.keyboard(38);
	walkRight = hexiGame.keyboard(39);
	walkDown = hexiGame.keyboard(40);

	constructor (isController)
	{
		super("strawberry.png", "player");
		const xpos = GameData.getObjectArrayFromName("player").length * 256 + 256;
		this.hexiObject.setPosition(xpos, 256);
		if (isController)
			this.defineMovementKeys();
	}

	// the game tick in the play state
	playTick ()
	{
		// let hexi move the object according to the speed
		hexiGame.move(this.hexiObject);
	}

	// add all the spritenames that need to be loaded
	static onLoad ()
	{
		super.onLoad(["strawberry.png"]);
	}

	// create the instances
	static create ()
	{
		// if (GameData.getObjectArrayFromName("player").length > 1)
		GameData.storeObject(new Player(true), "player");
		WebSocketHandler.sendCreate("Player", "player");
	}

	// walk thingy from hexi tutorial
	defineMovementKeys ()
	{
		//Left arrow key `press` method
		this.walkLeft.press = () =>
		{
			//Change the player's velocity when the key is pressed
			this.hexiObject.vx = -5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};

		//Left arrow key `release` method
		this.walkLeft.release = () =>
		{
			//If the left arrow has been released, and the right arrow isn't down,
			//and the player isn't moving vertically:
			//Stop the player
			if (!this.walkRight.isDown)
			{
				this.hexiObject.vx = 0;
			} else this.hexiObject.vx = 5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};

		//The up arrow
		this.walkUp.press = () =>
		{
			this.hexiObject.vy = -5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};
		this.walkUp.release = () =>
		{
			if (!this.walkDown.isDown)
			{
				this.hexiObject.vy = 0;
			} else this.hexiObject.vy = 5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};

		//The right arrow
		this.walkRight.press = () =>
		{
			this.hexiObject.vx = 5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};
		this.walkRight.release = () =>
		{
			if (!this.walkLeft.isDown)
			{
				this.hexiObject.vx = 0;
			} else this.hexiObject.vx = -5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};

		//The down arrow
		this.walkDown.press = () =>
		{
			this.hexiObject.vy = 5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};
		this.walkDown.release = () =>
		{
			if (!this.walkUp.isDown)
			{
				this.hexiObject.vy = 0;
			} else this.hexiObject.vy = -5;
			WebSocketHandler.sendUpdate(this.id, this.hexiObject.vx, this.hexiObject.vy);
		};
	}
}
// add the class to the objectTypes so it gets loaded
Loader.objectTypes.Player = Player;
