import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { ByteSummary } from '@/types/bytes/Byte';
import { ClickableDemoSummary } from '@/types/clickableDemos/ClickableDemoDto';
import { ShortVideo } from '@/types/shortVideos/shortVideo';

export type ByteCollectionItem =
  | { type: ByteCollectionItemType.Byte; byte: ByteSummary; order: number }
  | { type: ByteCollectionItemType.ClickableDemo; demo: ClickableDemoSummary; order: number }
  | { type: ByteCollectionItemType.ShortVideo; short: ShortVideo; order: number };

export interface ByteCollectionSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  byteIds: Array<string>;
  priority: number;
  videoUrl?: string | null;
  bytes?: Array<ByteSummary>;
  demos?: Array<ClickableDemoSummary>;
  shorts?: Array<ShortVideo>;
  items: Array<ByteCollectionItem>;
}

export enum ByteCollectionStatus {
  LIVE = 'LIVE',
}

export interface ByteCollectionDto {
  id: string;
  name: string;
  description: string;
  status: ByteCollectionStatus;
  byteIds: Array<string>;
  priority: number;
  videoUrl?: string | null;
}
