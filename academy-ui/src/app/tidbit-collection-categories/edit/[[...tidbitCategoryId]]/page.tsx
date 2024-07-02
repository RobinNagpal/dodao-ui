'use client';

import withSpace from '@/contexts/withSpace';
import ByteCategoryEditor from '@/components/byteCollectionCategory/ByteCollectionCategoryEditor';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import {
  SpaceWithIntegrationsFragment,
  useByteCollectionCategoryWithByteCollectionsQuery,
  useDeleteByteCollectionCategoryMutation,
} from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';

function EditTidbitCategorySpace(props: { space: SpaceWithIntegrationsFragment; params: { tidbitCategoryId?: string[] } }) {
  const { data, loading } = useByteCollectionCategoryWithByteCollectionsQuery({
    variables: {
      spaceId: props.space.id,
      categoryId: props.params.tidbitCategoryId?.[0] ?? '',
    },
    skip: !props.params.tidbitCategoryId,
  });

  const categoryCollectionId = props.params.tidbitCategoryId?.[0] || null;

  const router = useRouter();
  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteByteCollectionCategory] = useDeleteByteCollectionCategoryMutation();

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div tw="px-4 md:px-0 overflow-hidden">
          <Link href="/tidbit-collections" className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {'Back to Tidbit Collection Category'}
          </Link>

          {categoryCollectionId && (
            <PrivateEllipsisDropdown
              items={threeDotItems}
              onSelect={(key) => {
                if (key === 'delete') {
                  setShowDeleteModal(true);
                }
              }}
              className="float-right mr-0 z-5"
            />
          )}

          {showDeleteModal && (
            <DeleteConfirmationModal
              title={'Delete Collection Category'}
              open={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onDelete={async () => {
                await deleteByteCollectionCategory({ variables: { spaceId: props.space.id, categoryId: categoryCollectionId! } });
                setShowDeleteModal(false);
                router.push(`/tidbit-collection-categories`);
                router.refresh();
              }}
            />
          )}
        </div>
        {loading ? <PageLoading /> : <ByteCategoryEditor space={props.space} byteCategorySummary={data?.byteCollectionCategoryWithByteCollections} />}
      </SingleCardLayout>
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCategorySpace);
