import fp from "fastify-plugin";
import * as admin from "firebase-admin";
import { cert } from "firebase-admin/app";
import type { DecodedIdToken } from "firebase-admin/auth";

declare module "fastify" {
	interface FastifyInstance {
		firestore: admin.firestore.Firestore;
		auth: admin.auth.Auth;	
		user: DecodedIdToken | null;
	}
}

const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL || "mahitm-vpn-control-plane@mahitmvpn.iam.gserviceaccount.com"
const projectId = process.env.FB_ADMIN_PROJECT_ID || "mahitmvpn"

export default fp(
	(fastify, _options, done) => {
		admin.initializeApp({
			credential: cert({
				clientEmail,
				projectId,
				privateKey: process.env.FB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
			}),
		});

		const db = admin.firestore();
		const auth = admin.auth();

		if (!fastify.auth) {
			fastify.decorate("auth", auth);
		}

		if (!fastify.firestore) {
			fastify.decorate("firestore", db);
		}

		fastify.addHook("onClose", (_fastify, done) => {
			db.terminate()
				.then(() => done())
				.catch(done);
		});

		done();
	},
	{ name: "fastify-firebase" },
);
