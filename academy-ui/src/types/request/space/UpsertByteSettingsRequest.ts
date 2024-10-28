import { ByteViewMode } from '@/types/bytes/ByteDto';

export interface UpsertByteSettingsRequest {
  askForLoginToSubmit?: boolean | null;
  byteViewMode?: ByteViewMode | null;
  captureRating?: boolean | null;
  showCategoriesInSidebar?: boolean | null;
}
