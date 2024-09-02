export enum ENodeMessage {
    CreatePeer = 0,
    RemovePeer = 1,
    CreatePeerResponse = 2,
    RemovePeerResponse = 3,
    RequestTunnel = 4,
    RequestTunnelResponse = 5
}

export type INodeCreatePeer = {
    userId: string;
}

export type INodeCreatePeerResponse = {
    userId: string;
    ipv4: string; 
    privateKey: string; 
    publicKey: string; 
}

export type INodeRemovePeerResponse = {
    userId: string;
}

export interface INodeTunnelRequest {
    ipv4: string;
    srcPort: number;
    dstPort: number;
    publicKey: string;
    privateKey: string; 
}

export interface INodeTunnelRequestResponse {
    ipv4: string;
    srcPort: number;
    dstPort: number;
    publicKey: string;
    privateKey: string; 
}

export interface INodeMessage<T> {
    type: ENodeMessage;
    body: T; 
}