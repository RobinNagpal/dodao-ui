import Block from '@/components/app/Block';
import Button from '@/components/app/Button';
import Dropdown from '@/components/app/Dropdown';
import Icon from '@/components/app/Icon';
import Input from '@/components/app/Input';
import PageLoading from '@/components/app/PageLoading';
import TextareaArray from '@/components/app/TextareaArray';
import EditByteStepper from '@/components/byte/Edit/EditByteStepper';
import { useEditByte } from '@/components/byte/Edit/useEditByte';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import { ReactVueRouter } from '@/types/ReactVueRouter';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';

const ForceFloat = styled.div`
  transform: translatey(-44px);
  transition: transform 0.1s linear, font-size 0.1s linear;
`;

export interface EditByteProps {
  space: SpaceWithIntegrationsFragment;
  spaceLoading: boolean;
  from: string;
  reactVueRouter: ReactVueRouter;
  byteId: string;
  setAccountModalOpen: (shouldOpen: boolean) => void;
}

export default function EditByte({ space, reactVueRouter, byteId, setAccountModalOpen }: EditByteProps) {
  const { byteCreating, byteLoaded, byteRef: byte, byteErrors, handleSubmit, initialize, updateByteFunctions } = useEditByte(space, byteId || null);
  const { data: sesstion } = useSession();
  const inputError = (field: keyof ByteErrors): string => {
    const error = byteErrors?.[field];
    return error ? error.toString() : '';
  };

  const selectPublishStatus = (status: PublishStatus) => {
    updateByteFunctions.updateByteField('publishStatus', status);
  };

  const byteStatuses = [
    {
      text: 'Live',
      action: PublishStatus.Live,
    },
    {
      text: 'Draft',
      action: PublishStatus.Draft,
    },
  ];

  const clickSubmit = () => {
    !sesstion?.username ? setAccountModalOpen(true) : handleSubmit();
  };

  const onClickBackButton = () => {
    reactVueRouter.push(
      byteId
        ? {
            name: 'viewByte',
            state: {
              key: space.id,
              byteId: byteId,
            },
          }
        : { name: 'bytes' }
    );
  };

  return (
    <SingleCardLayout>
      <div className="px-4 mb-4 md:px-0 overflow-hidden">
        <a onClick={onClickBackButton} className="text-color">
          <Icon name="back" size="22" className="!align-middle" />
          {byte.id ? byte.name : 'Back to Bytes'}
        </a>
      </div>
      {byteLoaded ? (
        <>
          <Block title="Basic Info" className="mt-4">
            <div className="mb-2">
              <Input modelValue={byte.name} error={inputError('name')} maxLength={32} onUpdate={(e) => updateByteFunctions.updateByteField('name', e)}>
                Name*
              </Input>
              <Input
                modelValue={byte.content}
                error={inputError('content')}
                placeholder="byte.create.excerpt"
                maxLength={64}
                onUpdate={(e) => updateByteFunctions.updateByteField('content', e)}
              >
                Excerpt*
              </Input>

              <div className="status-wrapper mt-6">
                <Dropdown
                  top="2.5rem"
                  right="2.5rem"
                  className="mr-2 w-[5rem] status-drop-down"
                  onSelect={(value) => selectPublishStatus(value as PublishStatus)}
                  items={byteStatuses}
                >
                  <div className="pr-1 select-none">{byte.publishStatus === 'Live' ? 'Live' : 'Draft'}</div>
                </Dropdown>
                <div className="input-label text-color mr-2 whitespace-nowrap absolute">
                  <ForceFloat>Publish Status*</ForceFloat>
                </div>
              </div>
              <div className="mt-4">Admins</div>

              <TextareaArray
                modelValue={byte.admins}
                placeholder={`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`}
                className="input w-full text-left"
                onUpdate={(e) => updateByteFunctions.updateByteField('admins', e)}
              />

              <div className="mt-4">Tags</div>

              <TextareaArray
                modelValue={byte.tags}
                placeholder={`tag1\ntag2`}
                className="input w-full text-left"
                onUpdate={(e) => updateByteFunctions.updateByteField('tags', e)}
              />

              <div className="mt-4">
                <Input
                  modelValue={byte.priority}
                  maxLength={500}
                  onUpdate={(e) => updateByteFunctions.updateByteField('priority', e)}
                  className="edit-timeline-inputs"
                  number
                >
                  Priority
                </Input>
              </div>
            </div>
          </Block>
          <Block title="Byte Steps" slim={true}>
            <div className="mt-4">
              <EditByteStepper space={space} byte={byte} byteErrors={byteErrors} updateByteFunctions={updateByteFunctions} />
            </div>
          </Block>

          <Button onClick={clickSubmit} loading={!byteLoaded || byteCreating} className="block w-full" variant="contained" primary>
            Publish
          </Button>
        </>
      ) : (
        <PageLoading />
      )}
    </SingleCardLayout>
  );
}
