export enum ENodeMessage {
    CreatePeer = 0,
    RemovePeer = 1,
}

export type INodeCreatePeer = {
    userId: string;
}

export interface INodeMessage<T> {
    type: ENodeMessage;
    body: T; 
}