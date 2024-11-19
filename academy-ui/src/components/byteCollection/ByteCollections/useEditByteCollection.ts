import { ByteCollectionDto, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { CreateByteCollectionRequest } from '@/types/request/ByteCollectionRequests';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';

export type EditByteCollection = Omit<ByteCollectionSummary, 'id' | 'items'> & { id?: string };

interface HelperFunctions {
  updateByteCollectionName: (name: string) => void;
  updateByteCollectionDescription: (description: string) => void;
  updateByteCollectionVideoUrl: (videoUrl: string) => void;
  updateByteCollectionOrder: (order: number) => void;
  upsertByteCollection: () => void;
}

interface UseEditByteCollectionType {
  isPrestine: boolean;
  loading: boolean;
  byteCollection: EditByteCollection;
  helperFunctions: HelperFunctions;
}

export interface UseEditByteCollectionArgs {
  space: SpaceWithIntegrationsDto;
  byteCollection?: ByteCollectionSummary;
}

export function useEditByteCollection({ space, byteCollection: byteCollectionProp }: UseEditByteCollectionArgs): UseEditByteCollectionType {
  const redirectPath = space.type === SpaceTypes.AcademySite ? '/tidbit-collections' : '/';
  const { updateData: putData } = useUpdateData<ByteCollectionDto, CreateByteCollectionRequest>(
    {},
    {
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
      successMessage: 'Tidbit collection updated successfully',
      errorMessage: 'Failed to create updated collection',
    },
    'PUT'
  );

  const { postData } = usePostData<ByteCollectionDto, CreateByteCollectionRequest>(
    {
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
      successMessage: 'Tidbit collection created successfully',
      errorMessage: 'Failed to create tidbit collection',
    },
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isPrestine, setIsPrestine] = useState<boolean>(true);

  const [byteCollection, setByteCollection] = useState<EditByteCollection>({
    id: byteCollectionProp?.id,
    bytes: byteCollectionProp?.bytes || [],
    demos: byteCollectionProp?.demos || [],
    shorts: byteCollectionProp?.shorts || [],
    name: byteCollectionProp?.name || '',
    description: byteCollectionProp?.description || '',
    byteIds: byteCollectionProp?.bytes?.map((byte) => byte.byteId) || [],
    archive: byteCollectionProp?.archive,
    order: byteCollectionProp?.order || 100,
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
      archive: byteCollectionProp?.archive,
      order: byteCollectionProp?.order || 100,
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

  const updateByteCollectionOrder = (order: number) => {
    setByteCollection((prevByte) => ({ ...prevByte, order }));
  };
  const upsertByteCollection = async () => {
    setIsPrestine(false);

    if (!byteCollection.name.trim() || !byteCollection.description.trim()) {
      return;
    }
    try {
      setLoading(true);
      if (byteCollectionProp?.id) {
        await putData(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollectionProp?.id}`, {
          name: byteCollection.name,
          description: byteCollection.description,
          order: byteCollection.order,
          videoUrl: byteCollection.videoUrl,
        });
      } else {
        await postData(`${getBaseUrl()}/api/${space.id}/byte-collections`, {
          name: byteCollection.name,
          description: byteCollection.description,
          order: byteCollection.order,
          videoUrl: byteCollection.videoUrl,
        });
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    isPrestine,
    loading,
    byteCollection,
    helperFunctions: {
      updateByteCollectionName,
      updateByteCollectionDescription,
      updateByteCollectionVideoUrl,
      updateByteCollectionOrder,
      upsertByteCollection,
    },
  };
}
