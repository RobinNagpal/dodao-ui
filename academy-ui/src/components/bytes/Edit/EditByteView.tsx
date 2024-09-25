'use client';

import UploadInput from '@/components/app/UploadInput';
import AddByteQuestionsUsingAIButton from '@/components/bytes/Create/AddByteQuestionsUsingAIButton';
import { CreateByteUsingAIModal } from '@/components/bytes/Create/CreateByteUsingAIModal';
import EditByteStepper from '@/components/bytes/Edit/EditByteStepper';
import { useEditByte } from '@/components/bytes/Edit/useEditByte';
import { ImageType, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { revalidateTidbitCollections } from '@/revalidateTags';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { EditByteType } from '@/types/request/ByteRequests';
import Block from '@dodao/web-core/components/app/Block';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TextareaArray from '@dodao/web-core/components/core/textarea/TextareaArray';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditByteView(props: {
  space: SpaceWithIntegrationsFragment;
  onUpsert: (byteId: string) => Promise<void>;
  closeEditByteModal?: () => void;
  byteId?: string | null;
  byteCollection: ByteCollectionSummary;
}) {
  const { space, byteId, byteCollection, closeEditByteModal } = props;

  const {
    byteUpserting,
    byteLoaded,
    byteRef: byte,
    byteErrors,
    handleByteUpsert,
    initialize,
    updateByteFunctions,
  } = useEditByte(space, props.onUpsert, byteId || null);

  const inputError = (field: keyof ByteErrors): string => {
    const error = byteErrors?.[field];
    return error ? error.toString() : '';
  };

  useEffect(() => {
    initialize();
  }, [byteId]);

  const [showAIGenerateModel, setShowAIGenerateModel] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const router = useRouter();

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="px-4 md:px-0 flex justify-end">
          <div>
            {!byteId && <Button onClick={() => setShowAIGenerateModel(true)}>Create with AI</Button>}
            <AddByteQuestionsUsingAIButton
              byte={byte}
              onNewStepsWithQuestions={(newSteps) => {
                updateByteFunctions.includeSteps(newSteps);
              }}
            />
          </div>
        </div>

        {byteLoaded ? (
          <div className="text-color pb-10">
            <Block title="Basic Info">
              <div className="mb-8">
                <Input
                  modelValue={byte.name}
                  error={inputError('name')}
                  placeholder="byte.create.name (only 64 characters)"
                  maxLength={32}
                  onUpdate={(e) => updateByteFunctions.updateByteField('name', e)}
                >
                  Name *
                </Input>
                <Input
                  modelValue={byte.content}
                  error={inputError('content') ? 'Summary is required and should be less than 64 characters long' : ''}
                  placeholder="byte.create.summary (only 64 characters)"
                  maxLength={64}
                  onUpdate={(e) => updateByteFunctions.updateByteField('content', e)}
                >
                  Summary *
                </Input>

                <TextareaArray
                  label="Admins"
                  id="admins"
                  modelValue={byte.admins}
                  placeholder={`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`}
                  className="input w-full text-left"
                  onUpdate={(e) => updateByteFunctions.updateByteField('admins', e)}
                />

                <UploadInput
                  error=""
                  spaceId={space?.id || 'new-space'}
                  imageType={ImageType.ShortVideo}
                  modelValue={byte.videoUrl}
                  objectId={'new-byte-video'}
                  allowedFileTypes={['video/mp4', 'video/x-m4v', 'video/*']}
                  label={'Video URL'}
                  onInput={(e) => updateByteFunctions.updateByteField('videoUrl', e)}
                  placeholder="e.g. https://example.com/video.mp4"
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
            <Block title="Byte Steps">
              <EditByteStepper space={space} byte={byte} byteErrors={byteErrors} updateByteFunctions={updateByteFunctions} />
            </Block>

            <div className="flex">
              <Button
                onClick={() => handleByteUpsert(byteCollection)}
                loading={byteUpserting}
                disabled={!byteLoaded || byteUpserting}
                className="ml-2 block w-full"
                variant="contained"
                primary
              >
                Upload
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
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Byte'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            await revalidateTidbitCollections();
            fetch(`${getBaseUrl()}/api/byte/byte`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                byteId: byteId,
                spaceId: space.id,
              }),
            });

            setShowDeleteModal(false);
            const timestamp = new Date().getTime();
            router.push(`/tidbit-collections?update=${timestamp}`);
            setTimeout(() => closeEditByteModal?.(), 3000);
          }}
        />
      )}
    </PageWrapper>
  );
}
