'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import Input from '@/components/core/input/Input';
import PageLoading from '@/components/core/loaders/PageLoading';
import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import Stepper from '@/components/clickableDemos/Edit/ClickableDemoStepper';
import { useEditClickableDemo } from '@/components/clickableDemos/Edit/useEditClickableDemo';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { ClickableDemoErrors } from '@/types/errors/clickableDemoErrors';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  .wrapper {
    min-height: 484px;
  }

  .gear-icon {
    svg {
      fill: var(--link-color);
      width: 24px;
      height: 24px;
    }
  }

  .status-wrapper {
    border-bottom: 1px solid var(--border-color);
  }

  .forceFloat {
    transform: translatey(-44px);
    @apply text-xs;
    transition: transform 0.1s linear, font-size 0.1s linear;
  }

  .status-drop-down {
    color: var(--link-color);
  }
`;

function EditClickableDemo(props: { space: SpaceWithIntegrationsFragment; params: { demoId?: string[] } }) {
  const router = useRouter();

  const { space, params } = props;
  const demoId = params.demoId ? params.demoId[0] : null;

  const { clickableDemoCreating, clickableDemoLoaded, clickableDemo, clickableDemoErrors, handleSubmit, updateClickableDemoFunctions } = useEditClickableDemo(
    space,
    demoId
  );

  const errors = clickableDemoErrors;

  const inputError = (field: keyof ClickableDemoErrors): string => {
    const error = errors?.[field];
    return error ? error.toString() : '';
  };

  const { $t } = useI18();

  useEffect(() => {
    updateClickableDemoFunctions.initialize();
  }, [demoId]);

  function clickSubmit() {
    handleSubmit();
  }

  return (
    <PageWrapper>
      <SingleCardLayout>
        <Wrapper>
          <div className="px-4 mb-4 md:px-0 overflow-hidden">
            <Link href={demoId ? `/simulations/view/${demoId}/0` : `/tidbits`} className="text-color">
              <span className="mr-1 font-bold">&#8592;</span>
              {demoId ? clickableDemo.title : 'Back to Bytes'}
            </Link>
          </div>
          {clickableDemoLoaded ? (
            <>
              <Block title="Basic Info" className="mt-4">
                <div className="mb-2">
                  <Input
                    modelValue={clickableDemo.title}
                    error={inputError('title') ? 'Title is required' : ''}
                    maxLength={32}
                    onUpdate={(newValue) => updateClickableDemoFunctions.updateClickableDemoField('title', newValue)}
                  >
                    <div>Title*</div>
                  </Input>
                </div>
                <div className="mb-2">
                  <Input
                    modelValue={clickableDemo.excerpt}
                    error={inputError('excerpt') ? 'Excerpt is required' : ''}
                    maxLength={32}
                    onUpdate={(newValue) => updateClickableDemoFunctions.updateClickableDemoField('excerpt', newValue)}
                  >
                    <div>Excerpt*</div>
                  </Input>
                </div>
              </Block>

              {clickableDemo ? (
                <Block title="Clickable Demo Steps" slim={true}>
                  <div className="mt-4">
                    <Stepper
                      space={space}
                      clickableDemo={clickableDemo}
                      clickableDemoErrors={clickableDemoErrors}
                      updateClickableDemoFunctions={updateClickableDemoFunctions}
                    />
                  </div>
                </Block>
              ) : null}

              <Button onClick={clickSubmit} loading={!clickableDemoLoaded || clickableDemoCreating} className="block w-full" variant="contained" primary>
                Publish
              </Button>
            </>
          ) : (
            <PageLoading />
          )}
        </Wrapper>
      </SingleCardLayout>
    </PageWrapper>
  );
}

export default withSpace(EditClickableDemo);
