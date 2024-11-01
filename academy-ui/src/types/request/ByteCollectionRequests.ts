import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';

export interface CreateByteCollectionRequest {
  name: string;
  description: string;
  priority?: number;
  videoUrl?: string | null;
}

export interface SortByteCollectionItemsRequest {
  newItemIdAndOrders: { itemId: string; itemType: ByteCollectionItemType; order: number }[];
}
