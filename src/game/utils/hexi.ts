import {GameData, JS, loadGame, setupGame, loadMapEditor, setupMapEditor} from "./deps.ts";

export let hexiGame: any;

export function startGame ()
{
	//Initialize and start Hexi
	const resources = GameData.gameSprites.concat(GameData.gameSounds);
	hexiGame = JS.hexi(JS.window.innerWidth, JS.window.innerHeight, setupGame, resources, loadGame);
	hexiGame.scaleToWindow();
	hexiGame.start();
}

export function startMapeditor ()
{
	//Initialize and start Hexi
	const resources = GameData.gameSprites.concat(GameData.gameSounds);
	hexiGame = JS.hexi(JS.window.innerWidth, JS.window.innerHeight, setupMapEditor, resources, loadMapEditor);
	hexiGame.scaleToWindow();
	hexiGame.start();
}
