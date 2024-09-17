import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';

export interface DeleteByteItemRequest {
  itemId: string;
  itemType: ByteCollectionItemType;
}
