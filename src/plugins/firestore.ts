import fp from "fastify-plugin"
import * as admin from "firebase-admin";
import { cert } from "firebase-admin/app";

declare module 'fastify' {
    interface FastifyInstance {
        firestore: admin.firestore.Firestore
    }
  }

export default fp((fastify, _options, done) => {
    admin.initializeApp({
        credential: cert({ 
            clientEmail: "mahitm-vpn-control-plane@mahitmvpn.iam.gserviceaccount.com",
            privateKey: process.env.FB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            projectId: "mahitmvpn"
        })
    });
    
    const db = admin.firestore();

    if (!fastify.firestore) {
        fastify.decorate('firestore', db)
    }

    fastify.addHook('onClose', (_fastify, done) => { 
        db.terminate().then(() => done()).catch(done) 
    })

    done()
}, { name: 'fastify-firestore' });