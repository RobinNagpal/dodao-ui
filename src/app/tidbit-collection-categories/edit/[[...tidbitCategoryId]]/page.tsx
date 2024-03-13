'use client';

import withSpace from '@/app/withSpace';
import ByteCategoryEditor from '@/components/byteCategory/ByteCategoryEditor';
import PageLoading from '@/components/core/loaders/PageLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import {
  SpaceWithIntegrationsFragment,
  useUpsertByteCollectionCategoryMutation,
  useByteCollectionCategoryWithByteCollectionsQuery,
  CategoryWithByteCollection,
} from '@/graphql/generated/generated-types';

import SingleCardLayout from '@/layouts/SingleCardLayout';
import { slugify } from '@/utils/auth/slugify';
import Link from 'next/link';
import { v4 } from 'uuid';

function EditTidbitCategorySpace(props: { space: SpaceWithIntegrationsFragment; params: { tidbitCategoryId?: string[] } }) {
  const { data } = useByteCollectionCategoryWithByteCollectionsQuery({
    variables: {
      spaceId: props.space.id,
      categoryId: props.params.tidbitCategoryId?.[0] || '',
    },
  });

  const [upsertByteCollectionCategoryMutation] = useUpsertByteCollectionCategoryMutation();

  async function upsertByteCategoryFn(byteCollectionCategory: CategoryWithByteCollection) {
    await upsertByteCollectionCategoryMutation({
      variables: {
        input: {
          id: byteCollectionCategory.id || slugify(byteCollectionCategory.name) + '-' + v4().toString().substring(0, 4),
          spaceId: props.space.id,
          name: byteCollectionCategory.name,
          excerpt: byteCollectionCategory.excerpt || '',
          creator: props.space.creator,
          imageUrl: byteCollectionCategory.imageUrl,
          byteCollectionIds:
            byteCollectionCategory.byteCollectionArr?.map((byteCollection) => byteCollection?.id).filter((id): id is string => id !== undefined) ?? [],
        },
      },
    });
  }

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div tw="px-4 md:px-0 overflow-hidden">
          <Link href="/tidbit-collections" className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {'Back to Tidbit collections'}
          </Link>
        </div>
        {data?.byteCollectionCategoryWithByteCollections ? (
          <ByteCategoryEditor
            space={props.space}
            viewByteCollectionsUrl={'/tidbit-collections'}
            byteCategorySummary={data?.byteCollectionCategoryWithByteCollections}
            upsertByteCategoryFn={upsertByteCategoryFn}
          />
        ) : (
          <PageLoading />
        )}
      </SingleCardLayout>
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCategorySpace);
