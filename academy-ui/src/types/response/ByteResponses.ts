import { Byte, ClickableDemos, ShortVideo } from '@prisma/client';

export interface DeleteByteItemResponse {
  updated: Byte | ShortVideo | ClickableDemos;
}

export interface UnarchiveByteItemResponse {
  updated: Byte | ShortVideo | ClickableDemos;
}
