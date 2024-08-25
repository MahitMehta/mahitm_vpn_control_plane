import type { WebSocket as DefaultWebSocket } from "ws";

interface IClientSocket {
    nodeId: string; 
}

declare module "ws" {
    interface WebSocket extends IClientSocket {}
}

declare module "@fastify/websocket" {
    export interface WebSocket extends DefaultWebSocket, IClientSocket {}
}