'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import PageLoading from '@/components/core/loaders/PageLoading';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import PageWrapper from '@/components/core/page/PageWrapper';
import GuideStepper from '@/components/guides/View/GuideStepper';
import { useViewGuide } from '@/components/guides/View/useViewGuide';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import React, { useState, useEffect, useMemo } from 'react';

const InProgress = styled.div`
  font-size: 12px;
  padding-top: 2px;
  padding-bottom: 2px;
`;

const InfoBar = styled.div`
  box-shadow: var(--box-shadow);
  border-color: var(--border-color);
`;

const GuideInformation = styled.div`
  @media screen and (max-width: 991px) {
    display: none;
  }
`;

// ... component-specific logic (like 'isAdmin', 'isSuperAdmin', 'deleteGuide', etc.)

// Component starts here

const GuideView = ({ params, space }: { params: { guideIdAndStep: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { guideIdAndStep } = params;

  const guideId = Array.isArray(guideIdAndStep) ? guideIdAndStep[0] : (guideIdAndStep as string);
  let stepOrder = 0;
  if (Array.isArray(guideIdAndStep)) {
    stepOrder = parseInt(guideIdAndStep[1]);
  }

  const { isAdmin } = { isAdmin: true };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalGuideExportOpen, setModalGuideExportOpen] = useState(false);

  const viewGuideHelper = useViewGuide(space, guideId, stepOrder);
  const { guide: guide, guideLoaded, guideSubmission, initialize } = viewGuideHelper;
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
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
    <PageWrapper className="pt-12">
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
                  <EllipsisDropdown
                    items={threeDotItems}
                    onSelect={(key) => {
                      router.push(`/guides/edit/${guideId}`);
                    }}
                  />
                </div>
              </div>
            )}

            <div className="px-4 md:px-0">
              <div className="ml-12 mt-4">
                <h1 className="mb-2 text-3xl">{guide?.name}</h1>
                <div className="mb-4 text-xl">
                  <div className="flex justify-between">
                    <div dangerouslySetInnerHTML={{ __html: guideContents }} className="markdown-body mb-6 w-[80%]" />
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
    </PageWrapper>
  );
};

export default withSpace(GuideView);
