export enum ENodeMessage {
    CreatePeer = 0,
    RemovePeer = 1,
    CreatePeerResponse = 2,
    RemovePeerResponse = 3,
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

export interface INodeMessage<T> {
    type: ENodeMessage;
    body: T; 
}