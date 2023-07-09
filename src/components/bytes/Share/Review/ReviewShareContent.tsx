import useReviewByteSocialShareContent from '@/components/bytes/Share/Review/useReviewByteSocialShareContent';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import SpinnerWithText from '@/components/core/loaders/SpinnerWithText';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useEffect } from 'react';
import styled from 'styled-components';

export interface ReviewShareContentProps {
  space: SpaceWithIntegrationsFragment;
  byteId: string;
}

const StepWrapper = styled.div<{ error: boolean }>`
  border: ${(props) => (props.error ? '1px solid red' : 'none')};
  border-radius: 1rem;
`;
export default function ReviewShareContent(props: ReviewShareContentProps) {
  const {
    initializeByteSocialShare,
    byteSocialShare,
    updateLinkedInPdfContentField,
    updateLinkedInPdfContentStep,
    generatePdf,
    generatingAiContent,
    isInvalidTitle,
    isInvalidExcerpt,
    isInvalidContent,
  } = useReviewByteSocialShareContent(props.space.id, props.byteId);
  useEffect(() => {
    initializeByteSocialShare();
  }, []);

  if (generatingAiContent) {
    return <SpinnerWithText message={'Generating Content Using AI'} />;
  }

  return (
    <div className="mt-16">
      <h1>Review Share Content</h1>
      <div className="border-b border-gray-500 py-8 px-4">
        <Input
          label={'Tidbit Name'}
          modelValue={byteSocialShare?.linkedinPdfContent?.title || ''}
          onUpdate={(v) => updateLinkedInPdfContentField('title', v?.toString() || '')}
          error={isInvalidTitle(byteSocialShare?.linkedinPdfContent?.title || '') ? 'Name should be less than 20 characters' : undefined}
        />
        <Input
          label={'Tidbit Excerpt'}
          modelValue={byteSocialShare?.linkedinPdfContent?.excerpt || ''}
          onUpdate={(v) => updateLinkedInPdfContentField('excerpt', v?.toString() || '')}
          error={isInvalidExcerpt(byteSocialShare?.linkedinPdfContent?.title || '') ? 'Excerpt should be less than 14 words' : undefined}
        />
      </div>
      <ul role="list" className="divide-y divide-gray-500">
        {(byteSocialShare?.linkedinPdfContent?.steps || []).map((step, index) => (
          <li key={index} className="flex flex-col gap-y-4 py-4 my-4">
            <StepWrapper error={isInvalidTitle(step.name) || isInvalidContent(step.content)} className="p-4">
              <Input
                label={`Step ${index + 1}`}
                modelValue={step.name}
                onUpdate={(v) => updateLinkedInPdfContentStep(index, 'name', v?.toString() || '')}
                error={isInvalidTitle(byteSocialShare?.linkedinPdfContent?.title || '') ? 'Name should be less than 20 characters' : undefined}
              />
              <TextareaAutosize
                label={`Step ${index + 1} Content`}
                modelValue={step.content}
                minHeight={60}
                maxHeight={60}
                onUpdate={(v) => updateLinkedInPdfContentStep(index, 'content', v?.toString() || '')}
                error={isInvalidContent(step.content) ? 'Step content has more than 40 words' : undefined}
                className="mt-4"
              />
            </StepWrapper>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between gap-x-6">
        <Button variant="outlined">Previous</Button>
        <Button variant="contained" primary onClick={() => generatePdf()}>
          Save & Generate PDF
        </Button>
      </div>
    </div>
  );
}
