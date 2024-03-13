import { ByteCollectionFragment, SpaceWithIntegrationsFragment, CategoryWithByteCollection } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

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
  upsertByteCollectionCategoryFn: (byteCollectionCategory: CategoryWithByteCollection) => Promise<void>;
}

export function useEditByteCategory({
  space,
  viewByteCollectionsUrl,
  byteCategory: byteCategoryProp,
  upsertByteCollectionCategoryFn,
}: UseEditByteCollectionArgs): UseEditByteCategoryType {
  const router = useRouter();

  const [byteCategory, setByteCategory] = useState<CategoryWithByteCollection>({
    id: byteCategoryProp?.id || '',
    byteCollectionArr: byteCategoryProp?.byteCollectionArr || [],
    name: byteCategoryProp?.name || '',
    excerpt: byteCategoryProp?.excerpt || '',
    imageUrl: byteCategoryProp?.imageUrl || '',
    creator: space.creator,
  });

  const removeByteCollection = useCallback((byteCollectionId: string) => {
    setByteCategory((prevByteCategory) => {
      const updatedByteCollectionArr = prevByteCategory.byteCollectionArr!.filter((byteCollection) => byteCollection!.id !== byteCollectionId);

      return { ...prevByteCategory, byteCollectionArr: updatedByteCollectionArr };
    });
  }, []);

  const addByteCollection = (byteCollection: ByteCollectionFragment) => {
    setByteCategory((prevByteCategory) => {
      const newByte = prevByteCategory.byteCollectionArr!.find(
        (byteCollectionFromArr: ByteCollectionFragment | any) => byteCollectionFromArr.id === byteCollection.id
      );
      if (newByte) {
        return prevByteCategory;
      }
      const newByteCollection = [
        ...prevByteCategory.byteCollectionArr,
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
  const upsertByteCollectionCategory = async () => {
    await upsertByteCollectionCategoryFn(byteCategory);
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
