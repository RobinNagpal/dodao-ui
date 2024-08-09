import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { ByteSummary } from '@/types/bytes/Byte';
import { ClickableDemoSummary } from '@/types/clickableDemos/clickableDemo';
import { ShortVideo } from '@/types/shortVideos/shortVideo';

type ByteCollectionItem =
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
  bytes: Array<ByteSummary>;
  demos: Array<ClickableDemoSummary>;
  shorts: Array<ShortVideo>;
  items: Array<ByteCollectionItem>;
}

function showByteCollectionSummary(byteCollection: ByteCollectionSummary) {
  for (const item of byteCollection.items) {
    switch (item.type) {
      case ByteCollectionItemType.Byte:
        console.log(item.byte);
        break;
      case ByteCollectionItemType.ClickableDemo:
        console.log(item.demo);
        break;
      case ByteCollectionItemType.ShortVideo:
        console.log(item.short);
        break;
    }
  }
}
