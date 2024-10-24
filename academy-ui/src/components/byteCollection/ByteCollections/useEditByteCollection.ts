import { ByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { CreateByteCollectionRequest } from '@/types/request/ByteCollectionRequests';
import { SpaceTypes } from '@/types/space/SpaceDto';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type EditByteCollection = Omit<ByteCollectionSummary, 'id' | 'items'> & { id?: string };

interface HelperFunctions {
  updateByteCollectionName: (name: string) => void;
  updateByteCollectionDescription: (description: string) => void;
  updateByteCollectionVideoUrl: (videoUrl: string) => void;
  updateByteCollectionPriority: (priority: number) => void;
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
  byteCollection?: ByteCollectionSummary;
}

export function useEditByteCollection({ space, byteCollection: byteCollectionProp }: UseEditByteCollectionArgs): UseEditByteCollectionType {
  const { postData, putData } = useFetchUtils();
  const [isPrestine, setIsPrestine] = useState<boolean>(true);
  const router = useRouter();
  const [loading, setloading] = useState<boolean>(false);

  const [byteCollection, setByteCollection] = useState<EditByteCollection>({
    id: byteCollectionProp?.id,
    bytes: byteCollectionProp?.bytes || [],
    demos: byteCollectionProp?.demos || [],
    shorts: byteCollectionProp?.shorts || [],
    name: byteCollectionProp?.name || '',
    description: byteCollectionProp?.description || '',
    byteIds: byteCollectionProp?.bytes?.map((byte) => byte.byteId) || [],
    status: byteCollectionProp?.status || 'DRAFT',
    priority: byteCollectionProp?.priority || 50,
    videoUrl: byteCollectionProp?.videoUrl || '',
  });

  useEffect(() => {
    setByteCollection({
      id: byteCollectionProp?.id,
      bytes: byteCollectionProp?.bytes || [],
      demos: byteCollectionProp?.demos || [],
      shorts: byteCollectionProp?.shorts || [],
      name: byteCollectionProp?.name || '',
      description: byteCollectionProp?.description || '',
      byteIds: byteCollectionProp?.bytes?.map((byte) => byte.byteId) || [],
      status: byteCollectionProp?.status || 'DRAFT',
      priority: byteCollectionProp?.priority || 50,
      videoUrl: byteCollectionProp?.videoUrl || '',
    });
  }, [byteCollectionProp]);

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
    const redirectPath = space.type === SpaceTypes.AcademySite ? '/tidbit-collections' : '/';
    try {
      if (byteCollectionProp?.id) {
        await putData<ByteCollection, CreateByteCollectionRequest>(
          `${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollectionProp?.id}`,
          {
            name: byteCollection.name,
            description: byteCollection.description,
            priority: byteCollection.priority,
            videoUrl: byteCollection.videoUrl,
          },
          {
            redirectPath: `${redirectPath}?updated=${Date.now()}`,
            successMessage: 'Tidbit collection updated successfully',
            errorMessage: 'Failed to create updated collection',
          }
        );
      } else {
        await postData<ByteCollection, CreateByteCollectionRequest>(
          `${getBaseUrl()}/api/${space.id}/byte-collections`,
          {
            name: byteCollection.name,
            description: byteCollection.description,
            priority: byteCollection.priority,
            videoUrl: byteCollection.videoUrl,
          },
          {
            redirectPath: `${redirectPath}?updated=${Date.now()}`,
            successMessage: 'Tidbit collection created successfully',
            errorMessage: 'Failed to create tidbit collection',
          }
        );
      }
    } catch (e) {
      console.error(e);
    }
    setloading(false);
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
      upsertByteCollection,
    },
  };
}
