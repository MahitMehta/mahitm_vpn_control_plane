import type { FastifyPluginAsync } from "fastify";

type NodeConnectionQuery = {
    id: string; 
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

        // const { firestore:db } = fastify;
        // const nodePeers = db.collection(`tunnels/${nodeId}/peers`);
        // nodePeers.onSnapshot(snapshot => {
        //     for (const change of snapshot.docChanges()) {
        //         console.log(change.type, change.doc.data())
        //     }
        // }); 
    
        conn.on("close", async () => {
            console.log(`Connection closed by ${nodeId}`);
        });
        conn.on('message', async buffer => {
            const msg = buffer.toString(); 
            console.log(msg);
            if (msg === 'ping') {
                conn.send('pong');
            }
        });
    })
  }
  
  export default node;
  