class Player extends GameObject
{
	// keyboardkeys by ascii
	walkLeft = hexiGame.keyboard(37);
	walkUp = hexiGame.keyboard(38);
	walkRight = hexiGame.keyboard(39);
	walkDown = hexiGame.keyboard(40);

	constructor ()
	{
		super("strawberry.png");
		this.hexiObject.setPosition(256, 256);
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
		GameData.storeObject(new Player(), "playerOne");
		GameData.storeObject(new Player(), "playerTwo");
	}

	// walk thingy from hexi tutorial
	defineMovementKeys ()
	{
		//Left arrow key `press` method
		this.walkLeft.press = () =>
		{
			//Change the player's velocity when the key is pressed
			this.hexiObject.vx = -5;
			this.hexiObject.vy = 0;
		};

		//Left arrow key `release` method
		this.walkLeft.release = () =>
		{
			//If the left arrow has been released, and the right arrow isn't down,
			//and the player isn't moving vertically:
			//Stop the player
			if (!this.walkRight.isDown && this.hexiObject.vy === 0)
			{
				this.hexiObject.vx = 0;
			}
		};

		//The up arrow
		this.walkUp.press = () =>
		{
			this.hexiObject.vy = -5;
			this.hexiObject.vx = 0;
		};
		this.walkUp.release = () =>
		{
			if (!this.walkDown.isDown && this.hexiObject.vx === 0)
			{
				this.hexiObject.vy = 0;
			}
		};

		//The right arrow
		this.walkRight.press = () =>
		{
			this.hexiObject.vx = 5;
			this.hexiObject.vy = 0;
		};
		this.walkRight.release = () =>
		{
			if (!this.walkLeft.isDown && this.hexiObject.vy === 0)
			{
				this.hexiObject.vx = 0;
			}
		};

		//The down arrow
		this.walkDown.press = () =>
		{
			this.hexiObject.vy = 5;
			this.hexiObject.vx = 0;
		};
		this.walkDown.release = () =>
		{
			if (!this.walkUp.isDown && this.hexiObject.vx === 0)
			{
				this.hexiObject.vy = 0;
			}
		};
	}
}
// add the class to the objectTypes so it gets loaded
Loader.objectTypes.push(Player);
