import { PineconeClient } from '@pinecone-database/pinecone';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import dotenv from 'dotenv';

dotenv.config();

let pinecone: PineconeClient | null = null;
let pineconeIndex: VectorOperationsApi | null = null;

export const initPineconeClient = async (): Promise<VectorOperationsApi> => {
  if (pineconeIndex) return pineconeIndex;

  pinecone = new PineconeClient();
  console.log('init pinecone');
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });

  pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  return pineconeIndex;
};

export async function getIndexStats(pineconeIndex: VectorOperationsApi, filter: object) {
  return await pineconeIndex.describeIndexStats({
    describeIndexStatsRequest: {
      filter,
    },
  });
}
