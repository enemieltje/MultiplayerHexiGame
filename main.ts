import HttpServer from "./src/server.ts";

const server: HttpServer = new HttpServer();

server.start(8080);
