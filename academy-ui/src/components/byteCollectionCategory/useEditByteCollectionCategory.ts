import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  ByteCollectionFragment,
  CategoryWithByteCollection,
  SpaceWithIntegrationsFragment,
  useUpsertByteCollectionCategoryMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { ByteCollectionCategoryError } from '@dodao/web-core/types/errors/error';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { v4 } from 'uuid';

interface HelperFunctions {
  updateByteCategoryName: (name: string) => void;
  updateByteCategoryExcerpt: (excerpt: string) => void;
  updateByteCategoryImageUrl: (imageUrl: string) => void;
  updateByteCollectionPriority: (priority: number) => void;
  updateByteCategoryStatus: (status: string) => void;
  addByteCollection: (byteCollection: ByteCollectionFragment) => void;
  removeByteCollection: (byteCollectionId: string) => void;
  moveCategoryUp: (byteCollectionId: string) => void;
  moveCategoryDown: (byteCollectionId: string) => void;
  upsertByteCollectionCategory: () => void;
  validateCategory: () => boolean;
}

interface UseEditByteCollectionCategoryType {
  byteCategory: CategoryWithByteCollection;
  categoryErrors: ByteCollectionCategoryError;
  upserting: boolean;
  helperFunctions: HelperFunctions;
}

export interface UseEditByteCollectionCategoryArgs {
  space: SpaceWithIntegrationsFragment;
  byteCategory?: CategoryWithByteCollection;
}

export function useEditByteCollectionCategory({ space, byteCategory: byteCategoryProp }: UseEditByteCollectionCategoryArgs): UseEditByteCollectionCategoryType {
  const router = useRouter();
  const [upsertByteCollectionCategoryMutation] = useUpsertByteCollectionCategoryMutation();
  const [byteCategory, setByteCategory] = useState<CategoryWithByteCollection>({
    id: byteCategoryProp?.id || '',
    byteCollections: byteCategoryProp?.byteCollections || [],
    name: byteCategoryProp?.name || 'Category Name',
    excerpt: byteCategoryProp?.excerpt || 'Category Excerpt',
    imageUrl: byteCategoryProp?.imageUrl || '',
    creator: space.creator,
    status: byteCategoryProp?.status || 'Active',
    priority: byteCategoryProp?.priority || 50,
    archive: byteCategoryProp?.archive ?? false,
  });
  const [categoryErrors, setCategoryErrors] = useState<ByteCollectionCategoryError>({});
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();

  const [upserting, setUpserting] = useState(false);

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
    errors.priority = undefined;
    if (!byteCategory.priority) {
      errors.priority = true;
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
          demos: byteCollection.demos,
        },
      ];

      return { ...prevByteCategory, byteCollections: newByteCollection };
    });
  };

  //-------------------------------------------------------
  const moveCategoryUp = useCallback(
    (byteCollectionId: string) => {
      setByteCategory((prevCategory) => {
        const categories = [...prevCategory.byteCollections];
        const index = categories.findIndex((category) => category.id === byteCollectionId);
        if (index > 0) {
          const temp = categories[index - 1];
          categories[index - 1] = categories[index];
          categories[index] = temp;
        }
        return { ...prevCategory, byteCollections: categories };
      });
    },
    [setByteCategory]
  );

  const moveCategoryDown = useCallback((byteCollectionId: string) => {
    setByteCategory((prevCategory) => {
      console.log('moveCategoryDown function called');
      const newCategories = [...prevCategory.byteCollections];
      const index = newCategories.findIndex((category) => category.id === byteCollectionId);
      if (index >= 0 && index < newCategories.length - 1) {
        [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
      }

      return { ...prevCategory, byteCollections: newCategories };
    });
  }, []);

  const updateByteCategoryName = (name: string) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, name }));
  };

  const updateByteCategoryExcerpt = (excerpt: string) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, excerpt }));
  };
  const updateByteCategoryImageUrl = (imageUrl: string) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, imageUrl }));
  };
  const updateByteCollectionPriority = (priority: number) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, priority }));
  };
  const updateByteCategoryStatus = (status: string) => {
    setByteCategory((prevByteCategory) => ({ ...prevByteCategory, status }));
  };

  const upsertByteCollectionCategory = async () => {
    const valid = validateCategory();
    if (!valid) {
      console.log('Byte Collection Category invalid', categoryErrors);
      showNotification({ type: 'error', message: $t('notify.validationFailed') });
      return;
    }
    setUpserting(true);
    const response = await upsertByteCollectionCategoryMutation({
      variables: {
        spaceId: space.id,
        input: {
          id: byteCategory.id || slugify(byteCategory.name) + '-' + v4().toString().substring(0, 4),
          spaceId: space.id,
          name: byteCategory.name,
          excerpt: byteCategory.excerpt || '',
          imageUrl: byteCategory.imageUrl,
          status: byteCategory.status,
          byteCollectionIds: byteCategory.byteCollections?.map((byteCollection) => byteCollection?.id).filter((id): id is string => id !== undefined) ?? [],
          priority: byteCategory.priority,
          archive: byteCategory.archive,
        },
      },
    });
    router.push(`/tidbit-collection-categories/view/${response.data?.payload?.id}/tidbit-collections`);
  };

  return {
    byteCategory,
    categoryErrors,
    upserting,
    helperFunctions: {
      updateByteCategoryName,
      updateByteCategoryExcerpt,
      updateByteCategoryImageUrl,
      updateByteCategoryStatus,
      updateByteCollectionPriority,
      addByteCollection,
      removeByteCollection,
      moveCategoryUp,
      moveCategoryDown,
      upsertByteCollectionCategory,
      validateCategory,
    },
  };
}
