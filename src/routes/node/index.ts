import type { FastifyPluginAsync } from "fastify";
import type { WebSocket } from "ws";
import {
	ENodeMessage,
	type INodeCreatePeerResponse,
	type INodeRemovePeerResponse,
	type INodeTunnel,
	type INodeTunnelRequest,
} from "./types";

interface NodeConnectionQuery {
	id: string;
}

async function handleNodeMessage(
	conn: WebSocket,
	serializedMSG: string,
	nodeId: string,
	db: FirebaseFirestore.Firestore,
) {
	try {
		const msg = JSON.parse(serializedMSG);
		switch (msg.type) {
			case ENodeMessage.RequestTunnel: {
				console.log(`Tunnel state requested by ${nodeId}`);
				const {
					ipv4,
					srcPort,
					dstPort,
					publicKey,
					userRules = [],
					mesh
				} = msg.body as INodeTunnelRequest;
				
				const tunnel = await db.collection("tunnels").doc(nodeId).get();
				conn.userRules = userRules;

				let doc = {
					ipv4,
					srcPort,
					dstPort,
					publicKey,
					userRules,
				} as INodeTunnel;
				if (mesh) doc = { ...doc, meshId: mesh.id, meshIpv4: mesh.ipv4 };

				if (tunnel.exists) {
					// TODO: Maybe don't update ipv4 once tunnel is created in db?
					await db.collection("tunnels").doc(nodeId).update(doc);
					const peers = await db.collection(`tunnels/${nodeId}/peers`).get();
					const response = JSON.stringify({
						type: ENodeMessage.RequestTunnelResponse,
						body: {
							...tunnel.data(),
							peers: peers.docs.map((doc) => ({
								userId: doc.id,
								...doc.data(),
							})),
						},
					});
					conn.send(response);

					break;
				}

				await db.collection("tunnels").doc(nodeId).create(doc);

				const response = JSON.stringify({
					type: ENodeMessage.RequestTunnelResponse,
					body: {
						ipv4,
						srcPort,
						dstPort,
						publicKey,
						peers: [],
					},
				});
				conn.send(response);

				break;
			}
			case ENodeMessage.CreatePeerResponse: {
				const nodePeers = db.collection(`tunnels/${nodeId}/peers`);
				const { userId, ipv4, privateKey, publicKey } =
					msg.body as INodeCreatePeerResponse;
				await nodePeers.doc(userId).set({ ipv4, privateKey, publicKey });
				console.log(`Peer created by ${nodeId}`);

				break;
			}
			case ENodeMessage.RemovePeerResponse: {
				const nodePeers = db.collection(`tunnels/${nodeId}/peers`);
				const { userId } = msg.body as INodeRemovePeerResponse;
				await nodePeers.doc(userId).delete();
				console.log(`Peer removed by ${nodeId}`);

				break;
			}
			default:
				console.log(`Unknown message from ${nodeId}, type: ${msg.type}`);
				break;
		}
	} catch (e) {
		console.log(`Invalid message from ${nodeId}:${serializedMSG}`);
		console.error(e);
	}
}

const node: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.addHook("preValidation", async (req, reply) => {
		const { id: nodeId } = req.query as NodeConnectionQuery;
		console.log(
			`Connection from ${nodeId} @ ${req.socket.localAddress}:${req.socket.remotePort}`,
		);

		// Make sure the node is not already connected
		for (const client of fastify.websocketServer.clients) {
			// @ts-ignore
			if (client.nodeId === nodeId) {
				console.log("Connection Refused: Node already connected.");
				reply.code(403).send({ message: "Connection Refused." });
				return;
			}
		}

		// TODO: Check if node exits, if so, make sure IPs match
	});

	fastify.get(
		"/",
		{
			websocket: true,
			schema: {
				querystring: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
			},
		},
		async (conn, req) => {
			const { id: nodeId } = req.query as NodeConnectionQuery;
			conn.nodeId = nodeId;
			conn.userRules = [];

			const { firestore: db } = fastify;

			conn.on("close", async () => {
				console.log(`Connection closed by ${nodeId}`);
			});
			conn.on("message", async (buffer) => {
				const serializedMSG = buffer.toString();
				await handleNodeMessage(conn, serializedMSG, nodeId, db);
			});
		},
	);
};

export default node;
