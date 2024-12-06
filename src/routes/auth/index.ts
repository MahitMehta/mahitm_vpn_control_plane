import type { FastifyPluginAsync } from "fastify";
import { type EmailAuthBodyType, emailAuthSchema } from "./schema";
import type { FirebaseAuthErrorWrapper } from "./types";

const auth: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.post<{ Body: EmailAuthBodyType }>(
		"/email",
        { schema: emailAuthSchema },
		async (req, res) => {
            const { auth } = fastify;

            const { email, password } = req.body;

            auth.getUserByEmail(email)
            .then(async (user) => {
                await auth.setCustomUserClaims(user.uid, {
                    otpCode: Math.floor(100000 + Math.random() * 900000),
                    otpExpires: Date.now() + 300000, // 5 minutes
                });
                

                res.status(200);
            })
            .catch((e: FirebaseAuthErrorWrapper) => {
                if (e.errorInfo?.code !== "auth/user-not-found") {
                    res.status(500).send({ message: "Internal Server Error" });
                    return; 
                }

                auth.createUser({
                    email,
                    password,
                    emailVerified: false,
                })
            });        
        }
    )
}

export default auth;
