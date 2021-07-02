export {GameData} from "./gameData.ts";
export {Loader} from "./loader.ts";
export {WebSocketHandler} from "./webSocketHandler.ts";
export {GameObject, TileObject} from "./baseObjects.ts";
export {JS} from "../client/conversion.js";
export {Player} from "../objects/player.ts";
export {Dirt} from "../objects/dirt.ts";
export {hexiGame, Game} from "../game.ts";
import type {objectCategory, objectType} from "./baseObjects.ts";
export type {objectCategory, objectType};

export type uuid = string;
export type hexiObject = hexiData & Record<string, unknown>;

type hexiData = {
	show: (i: number) => void,
	remove: () => void,
	x: number,
	y: number,
	vx: number,
	vy: number,
};

export type worldData = {
	map: objectType[],
	data: number[][];
};

