import { type Static, Type } from "@sinclair/typebox";
import type { FastifySchema } from "fastify";

export const Tunnel = Type.Object({
    id: Type.String(),
    ipv4: Type.String(),
    dstPort: Type.Number(),
    publicKey: Type.String(),
    connected: Type.Boolean()
})

export const Peer = Type.Object({
    ipv4: Type.String(),
    privateKey: Type.String()
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
    body: AddBody,
    response: {
        200: Peer
    }
}

export type AddBodyType = Static<typeof AddBody>;

export const RemoveBody = Type.Object({
    nodeId: Type.String()
})

export const removeSchema: FastifySchema = {
    body: RemoveBody
}

export type RemoveBodyType = Static<typeof RemoveBody>;