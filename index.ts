import { httpServer } from './src/http_server/index.js';
import { wsServer } from './src/WsServer/server.js';

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log(`Start battleship ws server on the ${WS_PORT} port!`);
wsServer(WS_PORT);
