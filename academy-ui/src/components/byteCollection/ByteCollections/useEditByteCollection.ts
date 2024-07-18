import {
  ByteCollectionFragment,
  ByteSummaryFragment,
  ProjectByteCollectionFragment,
  ProjectByteFragment,
  SpaceWithIntegrationsFragment,
} from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export type EditByteCollection = Omit<ByteCollectionFragment | ProjectByteCollectionFragment, 'id'> & { id?: string };

interface HelperFunctions {
  updateByteCollectionName: (name: string) => void;
  updateByteCollectionDescription: (description: string) => void;
  updateByteCollectionVideoUrl: (videoUrl: string) => void;
  updateByteCollectionPriority: (priority: number) => void;
  addByte: (byteId: string) => void;
  moveByteUp: (byteUuid: string) => void;
  moveByteDown: (byteUuid: string) => void;
  removeByte: (byteUuid: string) => void;
  upsertByteCollection: () => void;
}

interface UseEditByteCollectionType {
  isPrestine: boolean;
  byteSummaries: (ByteSummaryFragment | ProjectByteFragment)[];
  byteCollection: EditByteCollection;
  helperFunctions: HelperFunctions;
}

export interface UseEditByteCollectionArgs {
  space: SpaceWithIntegrationsFragment;
  viewByteCollectionsUrl: string;
  byteCollection?: ByteCollectionFragment | ProjectByteCollectionFragment;
  byteSummaries: (ByteSummaryFragment | ProjectByteFragment)[];
  upsertByteCollectionFn: (byteCollection: EditByteCollection, byteCollectionId: string | null) => Promise<void>;
}

export function useEditByteCollection({
  space,
  viewByteCollectionsUrl,
  byteCollection: byteCollectionProp,
  byteSummaries,
  upsertByteCollectionFn,
}: UseEditByteCollectionArgs): UseEditByteCollectionType {
  const [isPrestine, setIsPrestine] = useState<boolean>(true);
  const router = useRouter();

  const [byteCollection, setByteCollection] = useState<EditByteCollection>({
    id: byteCollectionProp?.id,
    bytes: byteCollectionProp?.bytes || [],
    name: byteCollectionProp?.name || '',
    description: byteCollectionProp?.description || '',
    byteIds: byteCollectionProp?.bytes.map((byte) => byte.byteId) || [],
    status: byteCollectionProp?.status || 'DRAFT',
    priority: byteCollectionProp?.priority || 50,
    videoUrl: byteCollectionProp?.videoUrl || '',
  });

  useEffect(() => {
    setByteCollection({
      id: byteCollectionProp?.id,
      bytes: byteCollectionProp?.bytes || [],
      name: byteCollectionProp?.name || '',
      description: byteCollectionProp?.description || '',
      byteIds: byteCollectionProp?.bytes.map((byte) => byte.byteId) || [],
      status: byteCollectionProp?.status || 'DRAFT',
      priority: byteCollectionProp?.priority || 50,
      videoUrl: byteCollectionProp?.videoUrl || '',
    });
  }, [byteCollectionProp]);

  const moveByteUp = useCallback(
    (byteUuid: string) => {
      setByteCollection((prevByte) => {
        const bytes = [...prevByte.bytes];
        const index = bytes.findIndex((byte) => byte.byteId === byteUuid);
        if (index > 0) {
          const temp = bytes[index - 1];
          bytes[index - 1] = bytes[index];
          bytes[index] = temp;
        }
        return { ...prevByte, bytes: bytes };
      });
    },
    [setByteCollection]
  );

  const moveByteDown = useCallback((byteUuid: string) => {
    setByteCollection((prevByte) => {
      const newBytes = [...prevByte.bytes];
      const index = newBytes.findIndex((byte) => byte.byteId === byteUuid);
      if (index >= 0 && index < newBytes.length - 1) {
        [newBytes[index], newBytes[index + 1]] = [newBytes[index + 1], newBytes[index]];
      }

      return { ...prevByte, bytes: newBytes };
    });
  }, []);

  const removeByte = useCallback((byteUuid: string) => {
    setByteCollection((prevByte) => {
      const updatedBytes = prevByte.bytes
        .filter((s) => s.byteId !== byteUuid)
        .map((byte, index) => ({
          ...byte,
          order: index,
        }));

      return { ...prevByte, bytes: updatedBytes };
    });
  }, []);

  const addByte = (byteId: string) => {
    setByteCollection((prevByte) => {
      const newByte = byteSummaries.find((byte: ByteSummaryFragment | ProjectByteFragment) => byte.id === byteId);
      if (!newByte) {
        return prevByte;
      }
      const newBytes: ByteCollectionFragment['bytes'] = [...prevByte.bytes, { byteId: newByte.id, name: newByte.name, content: newByte.content }];

      return { ...prevByte, bytes: newBytes };
    });
  };

  const updateByteCollectionName = (name: string) => {
    setByteCollection((prevByte) => ({ ...prevByte, name }));
  };

  const updateByteCollectionDescription = (description: string) => {
    setByteCollection((prevByte) => ({ ...prevByte, description }));
  };

  const updateByteCollectionVideoUrl = (videoUrl: string) => {
    setByteCollection((prevByte) => ({ ...prevByte, videoUrl }));
  };

  const updateByteCollectionPriority = (priority: number) => {
    setByteCollection((prevByte) => ({ ...prevByte, priority }));
  };
  const upsertByteCollection = async () => {
    setIsPrestine(false);

    if (!byteCollection.name.trim() || !byteCollection.description.trim()) {
      return;
    }
    await upsertByteCollectionFn(byteCollection, byteCollection.id || null);
    router.push(viewByteCollectionsUrl);
    router.refresh();
  };

  return {
    isPrestine,
    byteCollection,
    byteSummaries,
    helperFunctions: {
      updateByteCollectionName,
      updateByteCollectionDescription,
      updateByteCollectionVideoUrl,
      updateByteCollectionPriority,
      addByte,
      moveByteUp,
      moveByteDown,
      removeByte,
      upsertByteCollection,
    },
  };
}
