'use client';

import Block from '@/components/app/Block';
import { CreateByteUsingAIModal } from '@/components/bytes/Create/CreateByteUsingAIModal';
import { EditByteType } from '@/components/bytes/Edit/editByteHelper';
import EditByteStepper from '@/components/bytes/Edit/EditByteStepper';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import PageLoading from '@/components/core/loaders/PageLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import TextareaArray from '@/components/core/textarea/TextareaArray';
import { useEditProjectByte } from '@/components/projects/projectByte/Edit/useEditProjectByte';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { ByteErrors } from '@/types/errors/byteErrors';
import StatusBadge from '@/utils/byte/StatusBadge';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function EditProjectByte(props: { space: SpaceWithIntegrationsFragment; project: ProjectFragment; params: { byteId?: string[] } }) {
  const { space, project, params } = props;
  const byteId = params.byteId ? params.byteId[0] : null;

  const {
    byteUpserting,

    byteLoaded,
    byteRef: byte,
    byteErrors,
    handleSubmit,

    initialize,
    updateByteFunctions,
  } = useEditProjectByte(space, project.id, byteId || null);

  const inputError = (field: keyof ByteErrors): string => {
    const error = byteErrors?.[field];
    return error ? error.toString() : '';
  };

  useEffect(() => {
    initialize();
  }, [byteId]);

  const [showAIGenerateModel, setShowAIGenerateModel] = useState(false);

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="px-4 mb-4 md:px-0 overflow-hidden flex justify-between">
          <Link href={byteId ? `/tidbits/view/${byteId}/0` : `/tidbits`} className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {byteId ? byte.name : 'Back to Bytes'}
          </Link>
          <div>
            {byteId && <StatusBadge status={byte.publishStatus} className="mr-4" />}
            {!byteId && <Button onClick={() => setShowAIGenerateModel(true)}>Create with AI</Button>}
          </div>
        </div>

        {byteLoaded ? (
          <div className="pb-10">
            <Block title="Basic Info" className="mt-4">
              <div className="mb-2">
                <Input modelValue={byte.name} error={inputError('name')} maxLength={32} onUpdate={(e) => updateByteFunctions.updateByteField('name', e)}>
                  Name *
                </Input>
                <Input
                  modelValue={byte.content}
                  error={inputError('content') ? 'Excerpt is required and should be less than 64 characters long' : ''}
                  placeholder="byte.create.excerpt"
                  maxLength={64}
                  onUpdate={(e) => updateByteFunctions.updateByteField('content', e)}
                >
                  Excerpt *
                </Input>

                <TextareaArray
                  label="Admins"
                  id="admins"
                  modelValue={byte.admins}
                  placeholder={`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`}
                  className="input w-full text-left"
                  onUpdate={(e) => updateByteFunctions.updateByteField('admins', e)}
                />

                <TextareaArray
                  label="Tags"
                  id="tags"
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
              <Button onClick={handleSubmit} loading={byteUpserting} disabled={!byteLoaded || byteUpserting} className="block w-full mr-2" primary>
                Upsert
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
