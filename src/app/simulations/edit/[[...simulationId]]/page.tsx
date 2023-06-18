'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import Input from '@/components/core/input/Input';
import PageLoading from '@/components/core/loaders/PageLoading';
import Button from '@/components/core/buttons/Button';
import TextareaArray from '@/components/core/textarea/TextareaArray';
import EllipsisDropdown, { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import PageWrapper from '@/components/core/page/PageWrapper';
import Stepper from '@/components/simulations/Edit/SimulationStepper';
import { useEditSimulation } from '@/components/simulations/Edit/useEditSimulation';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { SimulationErrors } from '@/types/errors/simulationErrors';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

function EditSimulation(props: { space: SpaceWithIntegrationsFragment; params: { simulationId?: string[] } }) {
  const router = useRouter();

  const { space, params } = props;
  const simulationId = params.simulationId ? params.simulationId[0] : null;

  const { simulationCreating, simulationLoaded, simulation, simulationErrors, handleSubmit, updateSimulationFunctions } = useEditSimulation(
    space,
    simulationId
  );

  const errors = simulationErrors;

  const inputError = (field: keyof SimulationErrors): string => {
    const error = errors?.[field];
    return error ? error.toString() : '';
  };

  function selectPublishStatus(status: string | PublishStatus) {
    updateSimulationFunctions.updateSimulationField('publishStatus', status);
  }

  const { $t } = useI18();

  useEffect(() => {
    updateSimulationFunctions.initialize();
  }, [simulationId]);

  const simulationStatuses: EllipsisDropdownItem[] = [
    {
      label: 'Live',
      key: PublishStatus.Live,
    },
    {
      label: 'Draft',
      key: PublishStatus.Draft,
    },
  ];

  function clickSubmit() {
    handleSubmit();
  }

  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  function setThumbnailUrl(url: any) {
    if (typeof url === 'string') {
      updateSimulationFunctions.updateSimulationField('thumbnail', url);
    }
  }

  return (
    <PageWrapper>
      <SingleCardLayout>
        <Wrapper>
          <div className="px-4 mb-4 md:px-0 overflow-hidden">
            <Link href={simulationId ? `/simulations/view/${simulationId}/0` : `/tidbits`} className="text-color">
              <span className="mr-1 font-bold">&#8592;</span>
              {simulationId ? simulation.name : 'Back to Bytes'}
            </Link>
          </div>
          {simulationLoaded ? (
            <>
              <Block title="Basic Info" className="mt-4">
                <div className="mb-2">
                  <Input
                    modelValue={simulation.name}
                    error={inputError('name')}
                    maxLength={32}
                    onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('name', newValue)}
                  >
                    <div>Name*</div>
                  </Input>
                  <Input
                    modelValue={simulation.content}
                    error={inputError('excerpt')}
                    placeholder="Excerpt of the simulation."
                    maxLength={64}
                    onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('content', newValue)}
                  >
                    <div>Excerpt*</div>
                  </Input>

                  <div className="mt-4">
                    <div>Publish Status * </div>
                    <div className="flex justify-start ">
                      <div className="pr-1 select-none">{simulation.publishStatus === 'Live' ? 'Live' : 'Draft'}</div>
                      <div className="ml-2">
                        <EllipsisDropdown items={simulationStatuses} onSelect={(value) => selectPublishStatus(value as PublishStatus)} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">Admins</div>
                  <TextareaArray
                    modelValue={simulation.admins}
                    placeholder="0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c&#10;0xeF8305E140ac520225DAf050e2f71d5fBcC543e7"
                    className="input w-full text-left"
                    onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('admins', newValue)}
                  />
                  <div className="mt-4">Tags</div>
                  <TextareaArray
                    modelValue={simulation.tags}
                    placeholder="tag1
tag2"
                    className="input w-full text-left"
                    onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('tags', newValue)}
                  />
                  <div className="mt-4">
                    <Input
                      modelValue={simulation.priority}
                      maxLength={500}
                      onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('priority', newValue)}
                      className="edit-timeline-inputs"
                      number
                    >
                      <div>Priority</div>
                    </Input>
                  </div>
                </div>
              </Block>

              {simulation ? (
                <Block title="simulation.create.stepByStep" slim={true}>
                  <div className="mt-4">
                    <Stepper space={space} simulation={simulation} simulationErrors={simulationErrors} updateSimulationFunctions={updateSimulationFunctions} />
                  </div>
                </Block>
              ) : null}

              <Button onClick={clickSubmit} loading={!simulationLoaded || simulationCreating} className="block w-full" variant="contained" primary>
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

export default withSpace(EditSimulation);
