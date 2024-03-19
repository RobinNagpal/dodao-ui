import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ByteCollectionFragment,
  SpaceWithIntegrationsFragment,
  CategoryWithByteCollection,
  useUpsertByteCollectionCategoryMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteCollectionCategoryError } from '@/types/errors/error';
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
  validateCategory: () => boolean;
}

interface UseEditByteCollectionCategoryType {
  byteCategory: CategoryWithByteCollection;
  categoryErrors: ByteCollectionCategoryError;
  helperFunctions: HelperFunctions;
}

export interface UseEditByteCollectionCategoryArgs {
  space: SpaceWithIntegrationsFragment;
  viewByteCollectionsUrl: string;
  byteCategory?: CategoryWithByteCollection;
}

export function useEditByteCollectionCategory({
  space,
  viewByteCollectionsUrl,
  byteCategory: byteCategoryProp,
}: UseEditByteCollectionCategoryArgs): UseEditByteCollectionCategoryType {
  const router = useRouter();
  const [upsertByteCollectionCategoryMutation] = useUpsertByteCollectionCategoryMutation();
  const [byteCategory, setByteCategory] = useState<CategoryWithByteCollection>({
    id: byteCategoryProp?.id || '',
    byteCollections: byteCategoryProp?.byteCollections || [],
    name: byteCategoryProp?.name || 'Byte Name',
    excerpt: byteCategoryProp?.excerpt || 'Byte Excerpt',
    imageUrl: byteCategoryProp?.imageUrl || '',
    creator: space.creator,
  });
  const [categoryErrors, setCategoryErrors] = useState<ByteCollectionCategoryError>({});
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();

  function validateCategory() {
    const errors: ByteCollectionCategoryError = { ...categoryErrors };

    errors.name = undefined;
    if (!byteCategory.name) {
      errors.name = true;
    }
    errors.excerpt = undefined;
    if (!byteCategory.excerpt) {
      errors.excerpt = true;
    }

    setCategoryErrors(errors);
    return Object.values(errors).filter((v) => !!v).length === 0;
  }

  const removeByteCollection = useCallback((byteCollectionId: string) => {
    setByteCategory((prevByteCategory) => {
      const updatedByteCollectionArr = prevByteCategory.byteCollections!.filter((byteCollection) => byteCollection!.id !== byteCollectionId);

      return { ...prevByteCategory, byteCollections: updatedByteCollectionArr };
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

      return { ...prevByteCategory, byteCollections: newByteCollection };
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
    const valid = validateCategory();
    if (!valid) {
      console.log('Byte Collection Category invalid', categoryErrors);
      showNotification({ type: 'error', message: $t('notify.validationFailed') });
      return;
    }
    await upsertByteCategoryFn(byteCategory);
    router.push(viewByteCollectionsUrl);
    router.refresh();
  };

  return {
    byteCategory,
    categoryErrors,
    helperFunctions: {
      updateByteCategoryName,
      updateByteCategoryExcerpt,
      updateByteCategoryImageUrl,
      addByteCollection,
      removeByteCollection,
      upsertByteCollectionCategory,
      validateCategory,
    },
  };
}
