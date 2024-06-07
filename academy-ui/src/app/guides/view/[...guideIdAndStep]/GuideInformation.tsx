'use client';

import withSpace from '@/app/withSpace';
import Block from '@dodao/web-core/components/app/Block';
import DeleteGuideModal from '@/components/app/Modal/Guide/DeleteGuideModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import GuideStepper from '@/components/guides/View/GuideStepper';
import { useViewGuide } from '@/components/guides/View/useViewGuide';
import { GuideFragment, SpaceWithIntegrationsFragment, useDeleteGuideMutation, useGuidesQueryQuery } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';

type GuideInformationProps = {
  guideIdAndStep: string[];
  space: SpaceWithIntegrationsFragment;
  guide: GuideFragment;
};

const GuideInformation = ({ guideIdAndStep, space, guide: guideFragment }: GuideInformationProps) => {
  const [deleteGuideMutation] = useDeleteGuideMutation();
  const { refetch: refetchGuides } = useGuidesQueryQuery({ skip: true, fetchPolicy: 'no-cache' });
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deletingGuide, setDeletingGuide] = React.useState(false);

  const guideId = Array.isArray(guideIdAndStep) ? guideIdAndStep[0] : (guideIdAndStep as string);
  let stepOrder = 0;
  if (Array.isArray(guideIdAndStep)) {
    stepOrder = parseInt(guideIdAndStep[1]);
  }

  const viewGuideHelper = useViewGuide(space, guideFragment, stepOrder);
  const { guide, guideLoaded, guideSubmission, initialize } = viewGuideHelper;
  const threeDotItems = [
    { label: 'Edit', key: 'edit' },
    { label: 'Submissions', key: 'submissions' },
    { label: 'Ratings', key: 'ratings' },
    { label: 'Delete', key: 'delete' },
  ];
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [guideId]);

  const renderer = getMarkedRenderer();
  const guideContents = useMemo((): string => {
    return guide ? marked.parse(guide.content, { renderer }) : '';
  }, [guide]);

  // JSX starts here
  return (
    <>
      <SingleCardLayout>
        {viewGuideHelper.guideLoaded ? (
          <>
            {guide && (
              <div className="px-4 md:px-0 mb-3 flex justify-between">
                <Link href="/guides" className="text-color">
                  <span className="mr-1 font-bold">&#8592;</span>
                  All Guides
                </Link>
                <div className="ml-3">
                  <PrivateEllipsisDropdown
                    items={threeDotItems}
                    onSelect={async (key) => {
                      if (key === 'submissions') {
                        router.push(`/guides/submissions/${guideId}`);
                      } else if (key === 'ratings') {
                        router.push(`/guides/ratings/${guideId}`);
                      } else if (key === 'delete') {
                        setShowDeleteModal(true);
                      } else {
                        router.push(`/guides/edit/${guideId}`);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="mt-5 ml-3 lg:ml-12">
                <h1 className="mb-2 text-3xl">{guide?.name}</h1>
                <div className="mb-4 text-xl">
                  <div className="flex justify-between">
                    <div dangerouslySetInnerHTML={{ __html: guideContents }} className="markdown-body mb-6 lg:w-[80%]" />
                  </div>
                </div>
              </div>
              {guideLoaded && guide && (
                <Block className="mt-4 slim">
                  <div className="mt-4 py-2">
                    <GuideStepper viewGuideHelper={viewGuideHelper} guide={guide} space={space} />
                  </div>
                </Block>
              )}
            </div>
          </>
        ) : (
          <PageLoading />
        )}
      </SingleCardLayout>
      {showDeleteModal && (
        <DeleteGuideModal
          open={showDeleteModal}
          guideName={guide?.name || ''}
          onClose={() => setShowDeleteModal(false)}
          deleting={deletingGuide}
          onDelete={async () => {
            setDeletingGuide(true);
            await deleteGuideMutation({
              variables: {
                spaceId: space.id,
                uuid: guideId,
              },
            });
            await refetchGuides({ space: space.id });
            setDeletingGuide(false);
            setShowDeleteModal(false);
            router.push(`/guides`);
            return;
          }}
        />
      )}
    </>
  );
};

export default withSpace(GuideInformation);
