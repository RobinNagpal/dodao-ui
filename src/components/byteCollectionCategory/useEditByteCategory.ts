import {
  ByteCollectionFragment,
  SpaceWithIntegrationsFragment,
  CategoryWithByteCollection,
  useUpsertByteCollectionCategoryMutation,
} from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { v4 } from 'uuid';

interface HelperFunctions {
  updateByteCategoryName: (name: string) => void;
  updateByteCategoryExcerpt: (excerpt: string) => void;
  updateByteCategoryImageUrl: (imageUrl: string) => void;
  addByteCollection: (byteCollection: ByteCollectionFragment) => void;
  removeByteCollection: (byteCollectionId: string) => void;
  upsertByteCollectionCategory: () => void;
}

interface UseEditByteCategoryType {
  byteCategory: CategoryWithByteCollection;
  helperFunctions: HelperFunctions;
}

export interface UseEditByteCollectionArgs {
  space: SpaceWithIntegrationsFragment;
  viewByteCollectionsUrl: string;
  byteCategory?: CategoryWithByteCollection;
}

export function useEditByteCategory({ space, viewByteCollectionsUrl, byteCategory: byteCategoryProp }: UseEditByteCollectionArgs): UseEditByteCategoryType {
  const router = useRouter();
  const [upsertByteCollectionCategoryMutation] = useUpsertByteCollectionCategoryMutation();
  const [byteCategory, setByteCategory] = useState<CategoryWithByteCollection>({
    id: byteCategoryProp?.id || '',
    byteCollections: byteCategoryProp?.byteCollections || [],
    name: byteCategoryProp?.name || '',
    excerpt: byteCategoryProp?.excerpt || '',
    imageUrl: byteCategoryProp?.imageUrl || '',
    creator: space.creator,
  });

  const removeByteCollection = useCallback((byteCollectionId: string) => {
    setByteCategory((prevByteCategory) => {
      const updatedByteCollectionArr = prevByteCategory.byteCollections!.filter((byteCollection) => byteCollection!.id !== byteCollectionId);

      return { ...prevByteCategory, byteCollectionArr: updatedByteCollectionArr };
    });
  }, []);

  const addByteCollection = (byteCollection: ByteCollectionFragment) => {
    setByteCategory((prevByteCategory) => {
      const newByte = prevByteCategory.byteCollections!.find(
        (byteCollectionFromArr: ByteCollectionFragment | any) => byteCollectionFromArr.id === byteCollection.id
      );
      if (newByte) {
        return prevByteCategory;
      }
      const newByteCollection = [
        ...prevByteCategory.byteCollections,
        {
          id: byteCollection.id,
          name: byteCollection.name,
          description: byteCollection.description,
          priority: byteCollection.priority,
          status: byteCollection.status,
          byteIds: byteCollection.byteIds,
          bytes: byteCollection.bytes,
        },
      ];

      return { ...prevByteCategory, byteCollectionArr: newByteCollection };
    });
  };

  const updateByteCategoryName = (name: string) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, name }));
  };

  const updateByteCategoryExcerpt = (excerpt: string) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, excerpt }));
  };
  const updateByteCategoryImageUrl = (imageUrl: string) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, imageUrl }));
  };

  async function upsertByteCategoryFn(byteCollectionCategory: CategoryWithByteCollection) {
    await upsertByteCollectionCategoryMutation({
      variables: {
        spaceId: space.id,
        input: {
          id: byteCollectionCategory.id || slugify(byteCollectionCategory.name) + '-' + v4().toString().substring(0, 4),
          spaceId: space.id,
          name: byteCollectionCategory.name,
          excerpt: byteCollectionCategory.excerpt || '',
          imageUrl: byteCollectionCategory.imageUrl,
          byteCollectionIds:
            byteCollectionCategory.byteCollections?.map((byteCollection) => byteCollection?.id).filter((id): id is string => id !== undefined) ?? [],
        },
      },
    });
  }

  const upsertByteCollectionCategory = async () => {
    await upsertByteCategoryFn(byteCategory);
    router.push(viewByteCollectionsUrl);
    router.refresh();
  };

  return {
    byteCategory,
    helperFunctions: {
      updateByteCategoryName,
      updateByteCategoryExcerpt,
      updateByteCategoryImageUrl,
      addByteCollection,
      removeByteCollection,
      upsertByteCollectionCategory,
    },
  };
}
