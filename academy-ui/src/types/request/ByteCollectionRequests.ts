import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';

export interface CreateByteCollectionRequest {
  name: string;
  description: string;
  order?: number;
  videoUrl?: string | null;
  archive?: boolean;
}

export interface SortByteCollectionItemsRequest {
  newItemIdAndOrders: { itemId: string; itemType: ByteCollectionItemType; order: number }[];
}
