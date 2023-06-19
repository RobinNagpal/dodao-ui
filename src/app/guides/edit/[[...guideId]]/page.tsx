'use client';

import BasicGuideSettings from '@/app/guides/edit/[[...guideId]]/BasicGuideSettings';
import withSpace from '@/app/withSpace';
import PageLoading from '@/components/core/loaders/PageLoading';
import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useEditGuide } from '@/components/guides/Edit/useEditGuide';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import Link from 'next/link';
import React, { useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  min-height: 484px;
`;

const EditGuide = (props: { space: SpaceWithIntegrationsFragment; params: { guideId?: string[] } }) => {
  const { space, params } = props;
  const guideId = params.guideId ? params.guideId[0] : null;

  const editGuideHelper = useEditGuide(space, guideId);
  const { activeStepId, guideCreating, guideLoaded, guide: guide, guideErrors, initialize, updateGuideFunctions, handleSubmit } = editGuideHelper;

  useEffect(() => {
    initialize().then(() => {
      console.log('Initialized', guide);
      console.log('activeStepId', activeStepId);
    });
  }, [guideId]);

  const clickSubmit = () => {
    handleSubmit();
  };

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div tw="px-4 md:px-0 overflow-hidden">
          <Link href={guideId ? `/guides/view/${guideId}/0` : `/guides`} className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {guideId ? guide.name : 'Back to Guides'}
          </Link>
        </div>

        {guideLoaded ? (
          <div>
            <Wrapper>
              <BasicGuideSettings guide={guide} guideErrors={guideErrors} space={space} editGuideHelper={editGuideHelper} />
            </Wrapper>

            <Button onClick={clickSubmit} loading={!guideLoaded || guideCreating} className="block w-full" variant="contained" primary>
              Publish
            </Button>
          </div>
        ) : (
          <PageLoading />
        )}
      </SingleCardLayout>
    </PageWrapper>
  );
};

export default withSpace(EditGuide);
