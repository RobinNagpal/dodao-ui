import {
  ByteCollectionFragment,
  ByteSummaryFragment,
  ProjectByteCollectionFragment,
  ProjectByteFragment,
  SpaceWithIntegrationsFragment,
  useByteCollectionQuery,
} from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type EditByteCollection = Omit<ByteCollectionFragment | ProjectByteCollectionFragment, 'id'> & { id?: string };

interface HelperFunctions {
  updateByteCollectionName: (name: string) => void;
  updateByteCollectionDescription: (description: string) => void;
  updateByteCollectionOrder: (order: number) => void;
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
  byteCollectionId: string | null;
  byteSummaries: (ByteSummaryFragment | ProjectByteFragment)[];
  upsertByteCollectionFn: (byteCollection: EditByteCollection, byteCollectionId: string | null) => Promise<void>;
}

export function useEditByteCollection({
  space,
  viewByteCollectionsUrl,
  byteCollectionId,
  byteSummaries,
  upsertByteCollectionFn,
}: UseEditByteCollectionArgs): UseEditByteCollectionType {
  const [isPrestine, setIsPrestine] = useState<boolean>(true);
  const router = useRouter();

  const [byteCollection, setByteCollection] = useState<EditByteCollection>({
    bytes: [],
    name: '',
    order: 50,
    description: '',
    byteIds: [],
    status: 'DRAFT',
    priority: 50,
  });

  const { data, loading } = useByteCollectionQuery({
    variables: {
      spaceId: space.id,
      byteCollectionId: byteCollectionId!,
    },
    skip: !byteCollectionId,
  });

  useEffect(() => {
    if (data?.byteCollection) {
      setByteCollection(data.byteCollection);
    }
  }, [data?.byteCollection]);

  const moveByteUp = useCallback((byteUuid: string) => {
    setByteCollection((prevByte) => {
      const bytes = prevByte.bytes;
      const index = bytes.findIndex((byte) => byte.byteId === byteUuid);
      if (index > 0) {
        [bytes[index - 1], bytes[index]] = [bytes[index], bytes[index - 1]];
      }

      return { ...prevByte, bytes: [...bytes] };
    });
  }, []);

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

  const updateByteCollectionOrder = (order: number) => {
    setByteCollection((prevByte) => ({ ...prevByte, order }));
  };
  const updateByteCollectionPriority = (priority: number) => {
    setByteCollection((prevByte) => ({ ...prevByte, priority }));
  };
  const upsertByteCollection = async () => {
    setIsPrestine(false);

    if (!byteCollection.name.trim() || !byteCollection.description.trim()) {
      return;
    }
    await upsertByteCollectionFn(byteCollection, byteCollectionId);
    router.push(viewByteCollectionsUrl);
  };

  return {
    isPrestine,
    byteCollection,
    byteSummaries,
    helperFunctions: {
      updateByteCollectionName,
      updateByteCollectionDescription,
      updateByteCollectionOrder,
      updateByteCollectionPriority,
      addByte,
      moveByteUp,
      moveByteDown,
      removeByte,
      upsertByteCollection,
    },
  };
}
