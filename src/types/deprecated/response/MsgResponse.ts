export interface RelayerResponse {
  address: string;
  receipt: string;
}

export interface MsgResponse {
  id: string;
  uuid?: string;
  ipfs: string;
  relayer: RelayerResponse;
  result: any;
}
