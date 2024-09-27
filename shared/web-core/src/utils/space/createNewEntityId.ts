import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { v4 as uuidv4 } from 'uuid';

export function createNewEntityId(entityName: string, spaceId: string) {
  // Ensure spaceId is not empty and extract the first segment if it contains hyphens
  const firstSegment = spaceId.split('-')[0];
  // Take up to the first 8 characters of the first segment or the whole segment if it's shorter
  const normalizedSpaceId = firstSegment.substring(0, Math.min(8, firstSegment.length));
  // Return the combined new entity ID
  return `${slugify(entityName)}-${normalizedSpaceId}-${uuidv4().toString().substring(0, 4)}`;
}
