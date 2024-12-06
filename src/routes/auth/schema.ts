import { type Static, Type } from "@sinclair/typebox";
import type { FastifySchema } from "fastify";

export const EmailAuthBody = Type.Object({
	email: Type.String(),
	password: Type.String(),
});

export const emailAuthSchema: FastifySchema = {
	body: EmailAuthBody,
};

export type EmailAuthBodyType = Static<typeof EmailAuthBody>;