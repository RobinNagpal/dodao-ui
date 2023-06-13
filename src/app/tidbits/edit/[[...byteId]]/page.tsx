'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import Button from '@/components/app/Button';
import Input from '@/components/app/Input';
import PageLoading from '@/components/app/PageLoading';
import TextareaArray from '@/components/app/TextArea/TextareaArray';
import EditByteStepper from '@/components/bytes/Edit/EditByteStepper';
import { useEditByte } from '@/components/bytes/Edit/useEditByte';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import { statuses } from '@/utils/ui/statuses';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';

function EditByte(props: { space: SpaceWithIntegrationsFragment; params: { byteId?: string[] } }) {
  const { space, params } = props;
  const byteId = params.byteId ? params.byteId[0] : null;

  const { byteCreating, byteLoaded, byteRef: byte, byteErrors, handleSubmit, handleSave,handlePublish, initialize, updateByteFunctions } = useEditByte(space, byteId || null);
  const { data: session } = useSession();
  const inputError = (field: keyof ByteErrors): string => {
    const error = byteErrors?.[field];
    return error ? error.toString() : '';
  };

  useEffect(() => {
    initialize();
  }, [byteId]);

  const selectPublishStatus = (status: PublishStatus) => {
    updateByteFunctions.updateByteField('publishStatus', status);
  };

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="px-4 mb-4 md:px-0 overflow-hidden">
          <Link href={byteId ? `/tidbits/view/${byteId}/0` : `/tidbits`} className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {byteId ? byte.name : 'Back to Bytes'}
          </Link>
        </div>
        {byteLoaded ? (
          <div className="pb-10">
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

                <div className="mt-4">
                  <div>Publish Status * </div>
                  <div className="flex justify-start ">
                    <div className="pr-1 select-none">{byte.publishStatus === 'Live' ? 'Live' : 'Draft'}</div>
                    <div className="ml-2">
                      <EllipsisDropdown items={statuses} onSelect={(value) => selectPublishStatus(value as PublishStatus)} />
                    </div>
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

            <div className="flex">
              <Button onClick={handleSubmit} loading={!byteLoaded || byteCreating} className="block w-full mr-2" primary>
                Submit
              </Button>
              <Button onClick={handleSave} loading={!byteLoaded || byteCreating} className="ml-2 block w-full" variant="contained" primary>
                Save
              </Button>
              <Button onClick={handlePublish} loading={!byteLoaded || byteCreating} className="ml-2 block w-full" variant="contained" primary>
                Publish
              </Button>
            </div>
          </div>
        ) : (
          <PageLoading />
        )}
      </SingleCardLayout>
    </PageWrapper>
  );
}

export default withSpace(EditByte);
