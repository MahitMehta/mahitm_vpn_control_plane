import type { FastifyPluginAsync } from "fastify";
import { getAuth } from "firebase-admin/auth";
import { ENodeMessage, INodeRemovePeer, type INodeCreatePeer, type INodeMessage } from "../node/types";
import { type AddBodyType, type RemoveBodyType, addSchema, removeSchema, tunnelsSchema } from "./schema";

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
            if (!fastify.user) return res.code(500).send({ message: "User object not retrievable." });

            client.send(JSON.stringify({ 
                type: ENodeMessage.CreatePeer,
                body: {
                    userId: fastify.user.uid
                }
            } as INodeMessage<INodeCreatePeer>));
            console.log("Peer Creation Requested.");

            const { firestore:db } = fastify;

            let created = false; 
            const unsubscribe = db
                .collection(`tunnels/${req.body.nodeId}/peers`)
                .doc(fastify.user.uid)
                .onSnapshot(doc => {
                    if (doc.exists) {
                        created = true;
                        unsubscribe();
                        res.send({ ...doc.data()});
                    }
            });

            await new Promise(resolve => setTimeout(resolve, 5000));
            if (created) return;

            unsubscribe();
            res.code(500).send({ message: "Peer Creation Timeout." });
            return; 
        }

        res.code(404).send({ message: "Node Not Available." });
    });

    fastify.post<{ Body: RemoveBodyType }>("/remove", { schema: removeSchema }, async (req, res) => {
        for (const client of fastify.websocketServer.clients) {
            // @ts-ignore
            const nodeId = client.nodeId; 
            if (nodeId !== req.body.nodeId) continue;
            if (!fastify.user) return res.code(500).send({ message: "User object not retrievable." });

            client.send(JSON.stringify({ 
                type: ENodeMessage.RemovePeer,
                body: {
                    userId: fastify.user.uid
                }
            } as INodeMessage<INodeRemovePeer>));
            console.log("Peer Removal Requested.");

            const { firestore:db } = fastify;

            let removed = false; 
            const unsubscribe = db
                .collection(`tunnels/${req.body.nodeId}/peers`)
                .doc(fastify.user.uid)
                .onSnapshot(doc => {
                    if (!doc.exists) {
                        removed = true;
                        unsubscribe();
                        res.send({ message: "Peer Removed." });
                    }
            });

            await new Promise(resolve => setTimeout(resolve, 5000));
            if (removed) return;

            unsubscribe();
            res.code(500).send({ message: "Peer Removal Timeout." });
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
        
        const result = data.docs
            .filter(doc => !!doc.data().dstPort) // TODO: Remove this filter
            .map(doc => ({ id: doc.id, ...doc.data() }));
        res.send(result);
    });
}

export default peer;