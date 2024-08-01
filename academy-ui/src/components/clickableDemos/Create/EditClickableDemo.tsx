'use client';

import withSpace from '@/contexts/withSpace';
import Block from '@dodao/web-core/components/app/Block';
import Input from '@dodao/web-core/components/core/input/Input';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Stepper from '@/components/clickableDemos/Edit/ClickableDemoStepper';
import { useEditClickableDemo } from '@/components/clickableDemos/Edit/useEditClickableDemo';
import { useDeleteClickableDemo } from '@/components/clickableDemos/Edit/useDeleteClickableDemo';
import { SpaceWithIntegrationsFragment, ByteCollectionFragment, ProjectByteCollectionFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { ClickableDemoErrors } from '@dodao/web-core/types/errors/clickableDemoErrors';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';

interface EditClickableDemoProps {
  space: SpaceWithIntegrationsFragment;
  demoId?: string | null;
  byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
}

function EditClickableDemo({ space, demoId, byteCollection }: EditClickableDemoProps) {
  const spaceId = space.id;

  const { clickableDemoCreating, clickableDemoLoaded, clickableDemo, clickableDemoErrors, handleSubmit, updateClickableDemoFunctions } = useEditClickableDemo(
    space,
    demoId!
  );
  const { handleDeletion } = useDeleteClickableDemo(space, demoId!);
  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const errors = clickableDemoErrors;

  const inputError = (field: keyof ClickableDemoErrors): string => {
    const error = errors?.[field];
    return error ? error.toString() : '';
  };

  const { $t } = useI18();

  useEffect(() => {
    updateClickableDemoFunctions.initialize();
  }, [demoId]);

  function clickSubmit(byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment) {
    handleSubmit(byteCollection);
  }

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div>
          <div className="py-4 my-4">
            <div className="px-4 mb-4 md:px-0 overflow-hidden float-left">
              <Link href={demoId ? `/clickable-demos/view/${demoId}/0` : `/clickable-demos`} className="text-color">
                <span className="mr-1 font-bold">&#8592;</span>
                {demoId ? clickableDemo.title : 'Back to Clickable Demos'}
              </Link>
            </div>
            <div className="px-4 mb-4 md:px-0 float-right">
              {demoId && (
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    if (key === 'delete') {
                      setShowDeleteModal(true);
                    }
                  }}
                  className="ml-4"
                />
              )}
            </div>
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
                    maxLength={64}
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

              <Button
                onClick={() => clickSubmit(byteCollection)}
                loading={!clickableDemoLoaded || clickableDemoCreating}
                className="block w-full"
                variant="contained"
                primary
              >
                Publish
              </Button>
            </>
          ) : (
            <PageLoading />
          )}
        </div>
      </SingleCardLayout>
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Demo'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            handleDeletion();
            setShowDeleteModal(false);
          }}
        />
      )}
    </PageWrapper>
  );
}

export default withSpace(EditClickableDemo);
