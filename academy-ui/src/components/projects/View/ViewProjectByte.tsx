'use client';

import withSpace from '@/app/withSpace';
import ByteStepper from '@/components/bytes/View/ByteStepper';
import { useGenericViewByte } from '@/components/bytes/View/useGenericViewByte';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ProjectFragment, SpaceWithIntegrationsFragment, useProjectByteQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './ViewProjectByte.module.scss';

const ViewProjectByte = ({
  tidbitIdAndStep,
  space,
  project,
}: {
  tidbitIdAndStep: string[];
  space: SpaceWithIntegrationsFragment;
  project: ProjectFragment;
}) => {
  const { data, refetch, loading } = useProjectByteQuery({
    variables: {
      id: tidbitIdAndStep[0],
      projectId: project.id,
    },
    skip: true,
  });

  const byteId = Array.isArray(tidbitIdAndStep) ? tidbitIdAndStep[0] : (tidbitIdAndStep as string);

  let stepOrder = 0;
  if (Array.isArray(tidbitIdAndStep)) {
    stepOrder = parseInt(tidbitIdAndStep[1]);
  }

  const viewByteHelper = useGenericViewByte({
    space,
    fetchByte: async () => {
      const result = await refetch();
      return result.data.projectByte;
    },
    byteDetailsUrl: `/projects/view/${project.id}/tidbits`,
    byteId,
    stepOrder,
  });

  useEffect(() => {
    viewByteHelper.initialize();
  }, [byteId]);

  const threeDotItems: EllipsisDropdownItem[] = [
    { label: 'Edit', key: 'edit' },
    { label: 'Generate Pdf', key: 'generate-pdf' },
  ];

  const byte = viewByteHelper.byteRef;
  const router = useRouter();

  return (
    <PageWrapper>
      <div className={`pt-4 flex flex-col justify-center items-center byte-container w-full ${styles.byteContainer}`}>
        <div className={`sm:border sm:border-gray-200 rounded-xl sm:shadow-md p-2 lg:p-8 ${styles.styledByteCard}`}>
          <div className="split-content integration-card-content">
            {byte && (
              <div className="px-4 md:px-0 mb-3 flex justify-between">
                <Link href={`/projects/view/${project.id}/tidbits`} className="text-color">
                  <span className="mr-1 font-bold">&#8592;</span>
                  All Tidbits
                </Link>
                <div className="ml-3">
                  <PrivateEllipsisDropdown
                    items={threeDotItems}
                    onSelect={(key) => {
                      if (key === 'edit') {
                        router.push(`/projects/edit/${project.id}/tidbits/${byteId}`);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {byte && byte && (
              <div className="px-2 lg:px-4 md:px-0 h-max">
                <div className="mt-4">
                  <ByteStepper viewByteHelper={viewByteHelper} byte={byte} space={space} />
                </div>
              </div>
            )}

            {!byte && <PageLoading />}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default withSpace(ViewProjectByte);
