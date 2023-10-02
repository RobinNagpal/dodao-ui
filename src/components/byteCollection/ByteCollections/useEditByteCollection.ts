import {
  ByteCollectionFragment,
  ByteSummaryFragment,
  SpaceWithIntegrationsFragment,
  useByteCollectionQuery,
  useCreateByteCollectionMutation,
  useQueryBytesQuery,
  useUpdateByteCollectionMutation,
} from '@/graphql/generated/generated-types';
import { useCallback, useEffect, useState } from 'react';

type EditByteCollection = Omit<ByteCollectionFragment, 'id'> & { id?: string };

interface HelperFunctions {
  updateByteCollectionName: (name: string) => void;
  updateByteCollectionDescription: (description: string) => void;
  updateByteCollectionOrder: (order: number) => void;
  addByte: (byteId: string) => void;
  moveByteUp: (byteUuid: string) => void;
  moveByteDown: (byteUuid: string) => void;
  removeByte: (byteUuid: string) => void;
  upsertByteCollection: () => void;
}

interface UseEditByteCollectionType {
  isPrestine: boolean;
  byteSummaries: ByteSummaryFragment[];
  byteCollection: EditByteCollection;
  helperFunctions: HelperFunctions;
}

export function useEditByteCollection(space: SpaceWithIntegrationsFragment, byteCollectionId: string | null): UseEditByteCollectionType {
  const [isPrestine, setIsPrestine] = useState<boolean>(true);

  const [byteCollection, setByteCollection] = useState<EditByteCollection>({
    bytes: [],
    name: '',
    order: 50,
    description: '',
    byteIds: [],
    status: 'DRAFT',
  });

  const [byteSummaries, setByteSummaries] = useState<ByteSummaryFragment[]>([]);

  const { data, loading } = useByteCollectionQuery({
    variables: {
      spaceId: space.id,
      byteCollectionId: byteCollectionId!,
    },
    skip: !byteCollectionId,
  });

  const { data: byteSummariesResponse } = useQueryBytesQuery({
    variables: {
      spaceId: space.id,
    },
  });

  const [updateByteCollectionMutation] = useUpdateByteCollectionMutation();

  const [createByteCollectionMutation] = useCreateByteCollectionMutation();

  useEffect(() => {
    if (data?.byteCollection) {
      setByteCollection(data.byteCollection);
    }
  }, [data?.byteCollection]);

  useEffect(() => {
    if (byteSummariesResponse?.bytes) {
      setByteSummaries(byteSummariesResponse.bytes);
    }
  }, [byteSummariesResponse?.bytes]);

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
      const newByte = byteSummaries.find((byte) => byte.id === byteId);
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
  const upsertByteCollection = async () => {
    setIsPrestine(false);

    if (!byteCollection.name.trim() || !byteCollection.description.trim()) {
      return;
    }

    if (!byteCollectionId) {
      await createByteCollectionMutation({
        variables: {
          input: {
            spaceId: space.id,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: byteCollection.bytes.map((byte) => byte.byteId),
            status: byteCollection.status,
            order: byteCollection.order,
          },
        },
      });
    } else {
      await updateByteCollectionMutation({
        variables: {
          input: {
            byteCollectionId,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: byteCollection.bytes.map((byte) => byte.byteId),
            status: byteCollection.status,
            spaceId: space.id,
            order: byteCollection.order,
          },
        },
      });
    }
  };

  return {
    isPrestine,
    byteCollection,
    byteSummaries,
    helperFunctions: {
      updateByteCollectionName,
      updateByteCollectionDescription,
      updateByteCollectionOrder,
      addByte,
      moveByteUp,
      moveByteDown,
      removeByte,
      upsertByteCollection,
    },
  };
}
