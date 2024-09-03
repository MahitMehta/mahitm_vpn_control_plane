import { type Static, Type } from "@sinclair/typebox";
import type { FastifySchema } from "fastify";

export const Tunnel = Type.Object({
    id: Type.String(),
    ipv4: Type.String(),
    port: Type.Number(),
    public_key: Type.String()
})
  
export type TunnelType = Static<typeof Tunnel>

export const tunnelsSchema: FastifySchema = {
    response: {
        200: Type.Array(Tunnel)
    }
}

export const AddBody = Type.Object({
    nodeId: Type.String()
})

export const addSchema: FastifySchema = {
    body: AddBody
}

export type AddBodyType = Static<typeof AddBody>;

export const RemoveBody = Type.Object({
    nodeId: Type.String()
})

export const removeSchema: FastifySchema = {
    body: RemoveBody
}

export type RemoveBodyType = Static<typeof RemoveBody>;