const path = `./src/game/client/game.bundle.js`;
const str = "export { hexiGame1 as hexiGame };";

let file = Deno.readTextFileSync(path);

const changes = (file.match(str) || []).length;
file = file.replace(str, "");

Deno.writeTextFileSync(path, file);
console.log(`file written, ${changes} changes made`);
