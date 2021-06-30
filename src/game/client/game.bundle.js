class GameData {
    static gameObjects = {
    };
    static nameIdMap = {
    };
    static gameSprites = [];
    static gameSounds = [];
    static worldData;
    static idGeneratorId = 0;
    static frame = 0;
    static genId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 3 | 8;
            return v.toString(16);
        });
    }
    static storeObject(object, name) {
        const texture = object.texture || "empty.png";
        if (Array.isArray(texture)) {
            object.hexiObject = hexiGame1.sprite(texture);
        } else {
            const path = object.useTileset ? texture : `sprites/${texture}`;
            object.hexiObject = hexiGame1.sprite(path);
        }
        this.gameObjects[object.id] = object;
        this.nameIdMap[name] ? this.nameIdMap[name].push(object.id) : this.nameIdMap[name] = [
            object.id
        ];
        return object;
    }
    static getObjectFromId(id) {
        return this.gameObjects[id];
    }
    static getObjectFromName(name, index = 0) {
        if (!this.nameIdMap[name]) console.log(`tried to get object ${name} that does not exist`);
        return this.getObjectFromId(this.nameIdMap[name][index]);
    }
    static getObjectArrayFromName(name) {
        if (!this.nameIdMap[name]) {
            console.log(`tried to get object ${name} that does not exist`);
            return [];
        }
        const objectArray = [];
        this.nameIdMap[name].forEach((id)=>{
            objectArray.push(this.getObjectFromId(id));
        });
        return objectArray;
    }
    static deleteObjectFromId(objectId) {
        const hexiObject = this.gameObjects[objectId].hexiObject;
        if (hexiObject) hexiObject.remove();
        delete this.gameObjects[objectId];
    }
    static addSprite(name) {
        this.gameSprites.push(`sprites/${name}`);
    }
    static addSound(name) {
        this.gameSprites.push(`sounds/${name}`);
    }
    static getBlock(x, y) {
        if (x < 0 || x > 15 || y < 0 || y > 15) return "Air";
        const index = this.worldData.data[y][x];
        return this.worldData.map[index];
    }
}
class Loader {
    static objectTypes = {
    };
    static globalSounds = [];
    static gridSize = {
        x: 32,
        y: 32
    };
    static load() {
        console.log("Loading Objects");
        Object.keys(Loader.objectTypes).forEach((objectName)=>{
            Loader.objectTypes[objectName].onLoad();
        });
        console.log("Loading global Sounds");
        Loader.globalSounds.forEach((sound)=>{
            GameData.addSound(sound);
        });
    }
    static createObjects() {
        console.log("Creating Objects");
        Object.keys(Loader.objectTypes).forEach((objectName)=>{
            Loader.objectTypes[objectName].create();
        });
        this.loop(this.exec);
    }
    static loadWorld(worldData) {
        GameData.worldData = worldData;
        this.loop(this.exec);
    }
    static loop(func) {
        if (!GameData.worldData) return;
        GameData.worldData.data.forEach((row, y)=>{
            row.forEach((mapIndex, x)=>{
                func(GameData.worldData.map[mapIndex], x, y);
            });
        });
    }
    static exec(type, x, y) {
        if (type == "Air") return;
        if (!Loader.objectTypes[type]) return;
        const obj = GameData.storeObject(new Loader.objectTypes[type](), `world${type}`);
        obj.hexiObject.x = x * Loader.gridSize.x;
        obj.hexiObject.y = y * Loader.gridSize.y;
        obj.x = x;
        obj.y = y;
    }
}
class WebSocketHandler {
    static messageBuffer = [];
    static executeBuffer() {
        this.messageBuffer.forEach((message, i)=>{
            socket.send(JSON.stringify(message));
            delete this.messageBuffer[i];
        });
        WebSocketHandler.sendServerRequest("world");
    }
    static sendServerRequest(name) {
        const message = {
            messageType: "server",
            name: name
        };
        this.send(message);
    }
    static sendWorldRequest() {
        const message = {
            messageType: "world"
        };
        this.send(message);
    }
    static sendObjectsUpdate(objectIdArray = Object.keys(GameData.gameObjects)) {
        if (!Array.isArray(objectIdArray)) objectIdArray = [
            objectIdArray
        ];
        const data = {
        };
        console.log(`sending objectsUpdate on: ${objectIdArray}`);
        objectIdArray.forEach((objectId)=>{
            data[objectId] = this.getMessageObject(objectId);
        });
        const message = {
            messageType: "object",
            data: data
        };
        this.send(message);
    }
    static getMessageObject(objectId) {
        const object = GameData.getObjectFromId(objectId);
        const data = {
            id: objectId,
            name: object.name,
            type: object.constructor.name,
            data: {
                x: object.hexiObject.x,
                y: object.hexiObject.y,
                vx: object.hexiObject.vx,
                vy: object.hexiObject.vy
            }
        };
        return data;
    }
    static updateObjects(objectList) {
        Object.keys(objectList).forEach((objectId)=>{
            const objectData = objectList[objectId];
            if (Object.keys(GameData.gameObjects).includes(objectId)) {
                const localObject = GameData.getObjectFromId(objectId);
                if (localObject.name == objectData.name && localObject.constructor.name == objectData.type) {
                    Object.keys(objectData.data).forEach((key)=>{
                        localObject.hexiObject[key] = objectData.data[key];
                    });
                } else {
                    GameData.deleteObjectFromId(objectId);
                    this.createNewObject(objectData);
                }
            } else {
                this.createNewObject(objectData);
            }
        });
    }
    static createNewObject(messageObject) {
        const newObject = new Loader.objectTypes[messageObject.type]();
        newObject.id = messageObject.id;
        GameData.storeObject(newObject, messageObject.name);
        Object.keys(messageObject.data).forEach((key)=>{
            newObject.hexiObject[key] = messageObject.data[key];
        });
    }
    static handleSocketMessage(ev) {
        const message = JSON.parse(ev.data);
        console.log(`socket message received:`);
        console.log(message);
        switch(message.messageType){
            case "object":
                WebSocketHandler.updateObjects(message.data);
                break;
            case "world":
                WebSocketHandler.sendObjectsUpdate();
                break;
            case "worldData":
                Loader.loadWorld(message.data);
                break;
            default:
                console.log("no response");
                break;
        }
    }
    static send(message) {
        console.log(`socket message sent:`);
        console.log(message);
        socket.readyState === WebSocket.OPEN ? socket.send(JSON.stringify(message)) : this.messageBuffer.push(message);
    }
}
class GameObject {
    name;
    hexiObject = {
    };
    id = "";
    texture;
    useTileset = false;
    constructor(name = ""){
        this.id = this.genId();
        this.name = name;
    }
    genId() {
        return GameData.genId();
    }
    playTick() {
    }
    static onLoad(sprites = [], sounds = []) {
        sprites.forEach((spritePath)=>{
            GameData.addSprite(spritePath);
        });
        sounds.forEach((soundPath)=>{
            GameData.addSound(soundPath);
        });
    }
    static create() {
    }
}
class Player extends GameObject {
    texture = "strawberry.png";
    walkLeft = hexiGame1.keyboard(37);
    walkUp = hexiGame1.keyboard(38);
    walkRight = hexiGame1.keyboard(39);
    walkDown = hexiGame1.keyboard(40);
    constructor(){
        super("player");
    }
    playTick() {
        hexiGame1.move(this.hexiObject);
    }
    static onLoad() {
        super.onLoad([
            "strawberry.png"
        ]);
    }
    static create() {
        GameData.storeObject(new Player(), "player");
    }
    defineMovementKeys() {
        this.walkLeft.press = ()=>{
            this.hexiObject.vx = -5;
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
        this.walkLeft.release = ()=>{
            if (this.hexiObject) {
                if (!this.walkRight.isDown) {
                    this.hexiObject.vx = 0;
                } else this.hexiObject.vx = 5;
            }
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
        this.walkUp.press = ()=>{
            if (this.hexiObject) this.hexiObject.vy = -5;
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
        this.walkUp.release = ()=>{
            if (this.hexiObject) {
                if (!this.walkDown.isDown) {
                    this.hexiObject.vy = 0;
                } else this.hexiObject.vy = 5;
            }
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
        this.walkRight.press = ()=>{
            if (this.hexiObject) this.hexiObject.vx = 5;
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
        this.walkRight.release = ()=>{
            if (this.hexiObject) {
                if (!this.walkLeft.isDown) {
                    this.hexiObject.vx = 0;
                } else this.hexiObject.vx = -5;
            }
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
        this.walkDown.press = ()=>{
            if (this.hexiObject) this.hexiObject.vy = 5;
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
        this.walkDown.release = ()=>{
            if (this.hexiObject) {
                if (!this.walkUp.isDown) {
                    this.hexiObject.vy = 0;
                } else this.hexiObject.vy = -5;
            }
            WebSocketHandler.sendObjectsUpdate(this.id);
        };
    }
}
Loader.objectTypes.Player = Player;
class Dirt extends GameObject {
    x = 0;
    y = 0;
    map = [
        15,
        14,
        3,
        2,
        12,
        13,
        0,
        1,
        11,
        10,
        7,
        6,
        8,
        9,
        4,
        5
    ];
    constructor(){
        super("dirt");
        this.useTileset = true;
        this.doubleSize();
        this.texture = [];
        for(let i = 0; i < 16; i++){
            this.texture.push(`dirt${i}.png`);
        }
    }
    updateSprite() {
        const blockArray = [
            GameData.getBlock(this.x, this.y - 1) == "Dirt",
            GameData.getBlock(this.x + 1, this.y) == "Dirt",
            GameData.getBlock(this.x, this.y + 1) == "Dirt",
            GameData.getBlock(this.x - 1, this.y) == "Dirt"
        ];
        console.log(blockArray);
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
    doubleSize(id) {
        if (!this.hexiObject || !this.hexiObject.scale) {
            const id = setInterval(()=>{
                this.doubleSize(id);
            }, 100);
            return;
        }
        clearInterval(id);
        this.hexiObject.scale = {
            x: 2,
            y: 2
        };
        this.updateSprite();
    }
    playTick() {
    }
    static onLoad() {
        super.onLoad([
            "simpleSpriteMapDirt.json"
        ]);
    }
    static create() {
    }
}
Loader.objectTypes.Dirt = Dirt;
Loader.load();
const resources = GameData.gameSprites.concat(GameData.gameSounds);
const hexiGame1 = JS.hexi(JS.window.innerWidth, JS.window.innerHeight, setup, resources, load);
hexiGame1.scaleToWindow();
hexiGame1.start();
function load() {
    console.log(`loading: ${hexiGame1.loadingFile}`);
    console.log(`progress: ${hexiGame1.loadingProgress}`);
    hexiGame1.loadingBar();
}
function setup() {
    if (JS.isHost) {
        Loader.createObjects();
        GameData.getObjectFromName("player").defineMovementKeys();
    } else {
        WebSocketHandler.sendWorldRequest();
        createObject("Player", "player").defineMovementKeys();
    }
    GameData.getObjectArrayFromName("worldDirt").forEach((dirt)=>{
    });
    hexiGame1.state = play;
}

console.log(window.location.href.split("/")[2]);
const socket = new WebSocket(`ws://${window.location.href.split("/")[2]}`);
socket.addEventListener("message", WebSocketHandler.handleSocketMessage);
socket.onopen = function(_ev) {
    console.log("WebSocket is open now.");
    WebSocketHandler.executeBuffer();
};
function createObject(type, name1) {
    const object = new Loader.objectTypes[type]();
    GameData.storeObject(object, name1);
    WebSocketHandler.sendObjectsUpdate(object.id);
    return object;
}
function play() {
    GameData.frame++;
    GameData.frame % hexiGame1.fps;
    GameData.getObjectArrayFromName("player").forEach((player)=>{
        player.playTick();
    });
}
