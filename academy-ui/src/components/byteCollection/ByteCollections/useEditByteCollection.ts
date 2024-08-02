import { ByteCollectionFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type EditByteCollection = Omit<ByteCollectionFragment, 'id'> & { id?: string };

interface HelperFunctions {
  updateByteCollectionName: (name: string) => void;
  updateByteCollectionDescription: (description: string) => void;
  updateByteCollectionVideoUrl: (videoUrl: string) => void;
  updateByteCollectionPriority: (priority: number) => void;
  moveByteUp: (byteUuid: string) => void;
  moveByteDown: (byteUuid: string) => void;
  removeByte: (byteUuid: string) => void;
  upsertByteCollection: () => void;
}

interface UseEditByteCollectionType {
  isPrestine: boolean;
  loading: boolean;
  byteCollection: EditByteCollection;
  helperFunctions: HelperFunctions;
}

export interface UseEditByteCollectionArgs {
  space: SpaceWithIntegrationsFragment;
  viewByteCollectionsUrl: string;
  byteCollection?: ByteCollectionFragment;
  upsertByteCollectionFn: (byteCollection: EditByteCollection, byteCollectionId: string | null) => Promise<void>;
}

export function useEditByteCollection({
  space,
  viewByteCollectionsUrl,
  byteCollection: byteCollectionProp,
  upsertByteCollectionFn,
}: UseEditByteCollectionArgs): UseEditByteCollectionType {
  const [isPrestine, setIsPrestine] = useState<boolean>(true);
  const router = useRouter();
  const [loading, setloading] = useState<boolean>(false);

  const [byteCollection, setByteCollection] = useState<EditByteCollection>({
    id: byteCollectionProp?.id,
    bytes: byteCollectionProp?.bytes || [],
    demos: byteCollectionProp?.demos || [],
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
      demos: byteCollectionProp?.demos || [],
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
    setloading(true);
    setIsPrestine(false);

    if (!byteCollection.name.trim() || !byteCollection.description.trim()) {
      return;
    }
    await upsertByteCollectionFn(byteCollection, byteCollection.id || null);
    setloading(false);
    router.push(viewByteCollectionsUrl);
    router.refresh();
  };

  return {
    isPrestine,
    loading,
    byteCollection,
    helperFunctions: {
      updateByteCollectionName,
      updateByteCollectionDescription,
      updateByteCollectionVideoUrl,
      updateByteCollectionPriority,
      moveByteUp,
      moveByteDown,
      removeByte,
      upsertByteCollection,
    },
  };
}
