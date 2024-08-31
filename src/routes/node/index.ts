import type { FastifyPluginAsync } from "fastify";
import { 
    ENodeMessage, 
    type INodeCreatePeerResponse, 
    type INodeRemovePeerResponse 
} from "./types";

type NodeConnectionQuery = {
    id: string; 
}

function handleNodeMessage(
    serializedMSG: string, 
    nodeId: string,
    nodePeers: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
) {
    try {
        const msg = JSON.parse(serializedMSG);
        switch (msg.type) {
            case ENodeMessage.CreatePeerResponse: {
                const { userId, ipv4, privateKey, publicKey } = msg.body as INodeCreatePeerResponse;
                nodePeers.doc(userId).set({ ipv4, privateKey, publicKey });
                console.log(`Peer created by ${nodeId}`);

                break; 
            }
            case ENodeMessage.RemovePeerResponse: {
                const { userId } = msg.body as INodeRemovePeerResponse
                nodePeers.doc(userId).delete();
                console.log(`Peer removed by ${nodeId}`);

                break;
            } default: 
                console.log(`Unknown message from ${nodeId}, type: ${msg.type}`);
                break;
        }
    } catch {
        console.log(`Invalid message from ${nodeId}: ${serializedMSG}`);
    }
}

const node: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.get('/', { websocket: true, schema: { 
        querystring: {
            type: 'object',
            properties: {
                id: { type: 'string' }
            },
            required: ['id']
        } 
    }},  async (conn, req) => {
        const { id:nodeId } = req.query as NodeConnectionQuery; 
        console.log(`Connection from ${nodeId}`);
        conn.nodeId = nodeId;

        const { firestore:db } = fastify;
        const nodePeers = db.collection(`tunnels/${nodeId}/peers`);
    
        conn.on("close", async () => {
            console.log(`Connection closed by ${nodeId}`);
        });
        conn.on('message', async buffer => {
            const serializedMSG = buffer.toString(); 
            handleNodeMessage(serializedMSG, nodeId, nodePeers);
        });
    })
  }
  
  export default node;
  