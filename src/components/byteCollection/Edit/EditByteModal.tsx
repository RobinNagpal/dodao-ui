'use client';

import Block from '@/components/app/Block';
import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import AddByteQuestionsUsingAIButton from '@/components/bytes/Create/AddByteQuestionsUsingAIButton';
import { CreateByteUsingAIModal } from '@/components/bytes/Create/CreateByteUsingAIModal';
import { EditByteType } from '@/components/bytes/Edit/editByteHelper';
import EditByteStepper from '@/components/bytes/Edit/EditByteStepper';
import { useEditByte } from '@/components/bytes/Edit/useEditByte';
import Button from '@/components/core/buttons/Button';
import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import Input from '@/components/core/input/Input';
import PageLoading from '@/components/core/loaders/PageLoading';
import FullPageModal from '@/components/core/modals/FullPageModal';
import PageWrapper from '@/components/core/page/PageWrapper';
import TextareaArray from '@/components/core/textarea/TextareaArray';
import { SpaceWithIntegrationsFragment, useDeleteByteMutation } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { TidbitShareSteps } from '@/types/deprecated/models/enums';
import { ByteErrors } from '@/types/errors/byteErrors';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface EditByteProps {
  space: SpaceWithIntegrationsFragment;
  byteId?: string;
  open: boolean;
  onClose: () => void;
}

export default function EditByte({ space, byteId, open, onClose }: EditByteProps) {
  const { byteUpserting, byteLoaded, byteRef: byte, byteErrors, handleByteUpsert, initialize, updateByteFunctions } = useEditByte(space, byteId || null);
  const { data: session } = useSession();
  const inputError = (field: keyof ByteErrors): string => {
    const error = byteErrors?.[field];
    return error ? error.toString() : '';
  };

  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [byteId]);

  const [showAIGenerateModel, setShowAIGenerateModel] = useState(false);
  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteByteMutation] = useDeleteByteMutation();

  return (
    <FullPageModal open={open} onClose={onClose} title={'Edit Byte'}>
      <PageWrapper>
        <SingleCardLayout>
          <div className="px-4 mb-4 md:px-0 flex justify-between">
            <Link href={byteId ? `/tidbits/view/${byteId}/0` : `/tidbits`} className="text-color">
              <span className="mr-1 font-bold">&#8592;</span>
              {byteId ? byte.name : 'Back to Bytes'}
            </Link>
            <div>
              {!byteId && <Button onClick={() => setShowAIGenerateModel(true)}>Create with AI</Button>}
              <AddByteQuestionsUsingAIButton
                byte={byte}
                onNewStepsWithQuestions={(newSteps) => {
                  updateByteFunctions.includeSteps(newSteps);
                }}
              />
              {byteId && (
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    if (key === 'delete') {
                      setShowDeleteModal(true);
                    }
                  }}
                  className="ml-4 z-50"
                />
              )}
            </div>
          </div>

          {byteLoaded ? (
            <div className="pb-10 text-left">
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

                  <Input
                    modelValue={byte.videoUrl}
                    placeholder="byte.create.videoURL"
                    maxLength={1024}
                    onUpdate={(e) => updateByteFunctions.updateByteField('videoUrl', e)}
                  >
                    Video URL
                  </Input>

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
                <Button
                  onClick={async () => {
                    await handleByteUpsert();
                    onClose();
                  }}
                  loading={byteUpserting}
                  disabled={!byteLoaded || byteUpserting}
                  className="ml-2 block w-full"
                  variant="contained"
                  primary
                >
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
        {showDeleteModal && (
          <DeleteConfirmationModal
            title={'Delete Byte'}
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(true)}
            onDelete={async () => {
              await deleteByteMutation({ variables: { spaceId: space.id, byteId: byteId! } });
              setShowDeleteModal(false);
              router.push(`/tidbits`);
            }}
          />
        )}
      </PageWrapper>
    </FullPageModal>
  );
}
