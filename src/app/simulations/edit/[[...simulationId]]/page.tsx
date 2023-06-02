'use client';

import Block from '@/components/app/Block';
import Button from '@/components/app/Button';
import Dropdown from '@/components/app/Dropdown';
import Input from '@/components/app/Input';
import PageLoading from '@/components/app/PageLoading';
import TextareaArray from '@/components/app/TextareaArray';
import Stepper from '@/components/simulation/Edit/SimulationStepper';
import { useEditSimulation } from '@/components/simulation/Edit/useEditSimulation';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { SimulationErrors } from '@/types/errors/simulationErrors';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

export default function EditSimulation(props: { space: SpaceWithIntegrationsFragment; params: { simulationId?: string[] } }) {
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

  const simulationStatuses = [
    {
      text: 'Live',
      action: PublishStatus.Live,
    },
    {
      text: 'Draft',
      action: PublishStatus.Draft,
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

                <div className="status-wrapper pt-3">
                  <Dropdown top="2.5rem" right="2.5rem" className="mr-2 w-[5rem] status-drop-down" onSelect={selectPublishStatus} items={simulationStatuses}>
                    <div className="pr-1 select-none">{simulation.publishStatus === 'Live' ? 'Live' : 'Draft'}</div>
                  </Dropdown>
                  <div className="input-label text-color mr-2 whitespace-nowrap absolute forceFloat">Publish Status*</div>
                </div>
                <div className="mt-4">Admins</div>
                <Button className="block w-full" style={{ height: 'auto' }}>
                  <TextareaArray
                    modelValue={simulation.admins}
                    placeholder="0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c
0xeF8305E140ac520225DAf050e2f71d5fBcC543e7"
                    className="input w-full text-left"
                    onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('admins', newValue)}
                  />
                </Button>
                <div className="mt-4">Tags</div>
                <Button className="block w-full" style={{ height: 'auto' }}>
                  <TextareaArray
                    modelValue={simulation.tags}
                    placeholder="tag1
tag2"
                    className="input w-full text-left"
                    onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('tags', newValue)}
                  />
                </Button>
                <div className="mt-4">
                  <Input
                    modelValue={simulation.priority}
                    maxLength={500}
                    onUpdate={(newValue) => updateSimulationFunctions.updateSimulationField('priority', newValue)}
                    additionalInputClass="edit-timeline-inputs"
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
  );
}
