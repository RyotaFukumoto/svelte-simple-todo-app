"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
// サーバーインスタンスを作成し、起動する
const server = new server_1.Server();
server.start();
