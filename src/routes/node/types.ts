export enum ENodeMessage {
	CreatePeer = 0,
	RemovePeer = 1,
	CreatePeerResponse = 2,
	RemovePeerResponse = 3,
	RequestTunnel = 4,
	RequestTunnelResponse = 5,
}

export type INodeCreatePeer = {
	userId: string;
};

export type INodeRemovePeer = {
	userId: string;
};

export type INodeCreatePeerResponse = {
	userId: string;
	ipv4: string;
	privateKey: string;
	publicKey: string;
};

export type INodeRemovePeerResponse = {
	userId: string;
};

export type IUserRule = {
	pattern: string;
};

export type IMesh = {
	id: string;
	ipv4: string;	
}

export type INodeTunnel = {
	ipv4: string;
	srcPort: number;
	dstPort: number;
	publicKey: string;
	privateKey: string;
	userRules: IUserRule[];
	meshId?: string;
	meshIpv4?: string;
}

export type INodeTunnelRequest = {
	ipv4: string;
	srcPort: number;
	dstPort: number;
	publicKey: string;
	privateKey: string;
	userRules: IUserRule[];
	mesh?: IMesh;
};

export type INodeTunnelRequestResponse = {
	ipv4: string;
	srcPort: number;
	dstPort: number;
	publicKey: string;
	privateKey: string;
};

export interface INodeMessage<T> {
	type: ENodeMessage;
	body: T;
}
