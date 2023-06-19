'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import Input from '@/components/core/input/Input';
import PageLoading from '@/components/core/loaders/PageLoading';
import Button from '@/components/core/buttons/Button';
import TextareaArray from '@/components/core/textarea/TextareaArray';
import { CreateByteUsingAIModal } from '@/components/bytes/Create/CreateByteUsingAIModal';
import EditByteStepper from '@/components/bytes/Edit/EditByteStepper';
import { EditByteType, useEditByte } from '@/components/bytes/Edit/useEditByte';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { PublishStatus, VisibilityEnum } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import { StatusBadge } from '@/utils/byte/StatusBadge';
import { publishStatuses, visibilityOptions } from '@/utils/ui/statuses';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function EditByte(props: { space: SpaceWithIntegrationsFragment; params: { byteId?: string[] } }) {
  const { space, params } = props;
  const byteId = params.byteId ? params.byteId[0] : null;

  const {
    byteCreating,
    byteLoaded,
    byteRef: byte,
    byteErrors,
    handleSubmit,
    handleSave,
    handlePublish,
    initialize,
    updateByteFunctions,
  } = useEditByte(space, byteId || null);
  const { data: session } = useSession();
  const inputError = (field: keyof ByteErrors): string => {
    const error = byteErrors?.[field];
    return error ? error.toString() : '';
  };

  useEffect(() => {
    initialize();
  }, [byteId]);

  const [showAIGenerateModel, setShowAIGenerateModel] = useState(false);

  const selectVisibilityValue = (status: VisibilityEnum) => {
    updateByteFunctions.updateByteField('visibility', status);
  };

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="px-4 mb-4 md:px-0 overflow-hidden flex justify-between">
          <Link href={byteId ? `/tidbits/view/${byteId}/0` : `/tidbits`} className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {byteId ? byte.name : 'Back to Bytes'}
          </Link>
          <div>
            <StatusBadge status={byte.publishStatus} />
            {!byteId && <Button onClick={() => setShowAIGenerateModel(true)}>Create with AI</Button>}
          </div>
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
                  <div>Visibility * </div>
                  <div className="flex justify-start ">
                    <div className="pr-1 select-none">{byte.visibility === VisibilityEnum.Hidden ? 'Hidden' : 'Public'}</div>
                    <div className="ml-2">
                      <EllipsisDropdown items={visibilityOptions} onSelect={(value) => selectVisibilityValue(value as VisibilityEnum)} />
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
              <Button onClick={handleSave} loading={!byteLoaded || byteCreating} className="block w-full mr-2" primary>
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
      <CreateByteUsingAIModal
        open={showAIGenerateModel}
        onClose={() => setShowAIGenerateModel(false)}
        onGenerateByte={(generated: EditByteType) => {
          updateByteFunctions.setByte(generated);
        }}
      />
    </PageWrapper>
  );
}

export default withSpace(EditByte);
