'use client';

import withSpace from '@/contexts/withSpace';
import ByteCategoryEditor from '@/components/byteCollectionCategory/ByteCollectionCategoryEditor';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment, useByteCollectionCategoryWithByteCollectionsQuery } from '@/graphql/generated/generated-types';

import SingleCardLayout from '@/layouts/SingleCardLayout';
import Link from 'next/link';

function EditTidbitCategorySpace(props: { space: SpaceWithIntegrationsFragment; params: { tidbitCategoryId?: string[] } }) {
  const { data, loading } = useByteCollectionCategoryWithByteCollectionsQuery({
    variables: {
      spaceId: props.space.id,
      categoryId: props.params.tidbitCategoryId?.[0] ?? '',
    },
    skip: !props.params.tidbitCategoryId,
  });

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div tw="px-4 md:px-0 overflow-hidden">
          <Link href="/tidbit-collections" className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {'Back to Tidbit collections'}
          </Link>
        </div>
        {loading ? <PageLoading /> : <ByteCategoryEditor space={props.space} byteCategorySummary={data?.byteCollectionCategoryWithByteCollections} />}
      </SingleCardLayout>
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCategorySpace);
