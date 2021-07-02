deno bundle src/game/game.ts src/game/client/game.bundle.js
# deno bundle src/game/mapEditor.ts src/game/client/editor.bundle.js

deno run -A bundleFix.ts

Deno run -A main.ts
