import type { FastifyPluginAsync } from "fastify";
import { getAuth } from "firebase-admin/auth";
import { ENodeMessage, type INodeCreatePeer, type INodeMessage } from "../node/types";
import { type AddBodyType, addSchema, tunnelsSchema } from "./schema";

const peer: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.addHook("preHandler",  async (req, res) => {
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            res.code(400).send({ message: "Bad Request" });
            return;
        }

        const token = req.headers.authorization?.substring(7);
        const user = await getAuth().verifyIdToken(token).catch(_ => null);
        
        fastify.user = user; 
    
        if (!user) {
            res.code(401).send({ message: "Unauthorized" });
            return;
        }
    });

    fastify.post<{ Body: AddBodyType }>("/add", { schema: addSchema }, async (req, res) => {
        for (const client of fastify.websocketServer.clients) {
            // @ts-ignore
            const nodeId = client.nodeId; 
            if (nodeId !== req.body.nodeId) continue;

            console.log(fastify.user);
            client.send(JSON.stringify({ 
                type: ENodeMessage.CreatePeer,
                body: {
                    userId: fastify.user?.uid
                }
            } as INodeMessage<INodeCreatePeer>));
            res.send({ message: "Peer Creation Requested." });
            return; 
        }

        res.code(404).send({ message: "Node Not Available." });
    });

    fastify.get('/tunnels', 
        { schema: tunnelsSchema }, 
        async (_req, res) => {
        const { firestore:db } = fastify;
        const tunnels = db.collection("tunnels");
        const data = await tunnels.get().catch(e => {
            console.log(`Error fetching tunnels: ${e}`);
            return null;
        });

        if (!data) {
            res.code(500);
            return; 
        }
        
        const result = data.docs.map(doc => ({ id: doc.id, ...doc.data() }));  
        res.send(result);
    });
}

export default peer;