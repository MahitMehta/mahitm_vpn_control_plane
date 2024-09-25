import type { WebSocket as DefaultWebSocket } from "ws";
import type { IUserRule } from "../routes/node/types";

interface IClientSocket {
	nodeId: string;
	userRules: IUserRule[];
}

declare module "ws" {
	interface WebSocket extends IClientSocket {}
}

declare module "@fastify/websocket" {
	export interface WebSocket extends DefaultWebSocket, IClientSocket {}
}
