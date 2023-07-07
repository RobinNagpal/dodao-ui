import useReviewByteSocialShareContent from '@/components/bytes/Share/Review/useReviewByteSocialShareContent';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
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
  const { initializeByteSocialShare, byteSocialShare, updateLinkedInPdfContentField, updateLinkedInPdfContentStep } = useReviewByteSocialShareContent(
    props.space.id,
    props.byteId
  );
  useEffect(() => {
    initializeByteSocialShare();
  }, []);

  function isLongTitle(str: string): boolean {
    return str.length > 24;
  }

  function hasMoreThanAllowedWords(str: string): boolean {
    const words = str.split(' ');
    return words.length > 22;
  }

  return (
    <div className="mt-16">
      <h1>Review Share Content</h1>
      <div className="border-b border-gray-500 py-8 px-4">
        <Input
          label={'Tidbit Name'}
          modelValue={byteSocialShare?.linkedinPdfContent?.title || ''}
          onUpdate={(v) => updateLinkedInPdfContentField('title', v?.toString() || '')}
        />
        <Input
          label={'Tidbit Excerpt'}
          modelValue={byteSocialShare?.linkedinPdfContent?.excerpt || ''}
          onUpdate={(v) => updateLinkedInPdfContentField('excerpt', v?.toString() || '')}
        />
      </div>
      <ul role="list" className="divide-y divide-gray-500">
        {(byteSocialShare?.linkedinPdfContent?.steps || []).map((step, index) => (
          <li key={index} className="flex flex-col gap-y-4 py-4 my-4">
            <StepWrapper error={hasMoreThanAllowedWords(step.content)} className="p-4">
              <Input
                label={`Step ${index + 1}`}
                modelValue={step.name}
                onUpdate={(v) => updateLinkedInPdfContentStep(index, 'name', v?.toString() || '')}
                error={isLongTitle(step.name) ? 'Name should be less than 24 characters' : undefined}
              />
              <TextareaAutosize
                label={`Step ${index + 1} Content`}
                modelValue={step.content}
                minHeight={60}
                maxHeight={60}
                onUpdate={(v) => updateLinkedInPdfContentStep(index, 'content', v?.toString() || '')}
                error={hasMoreThanAllowedWords(step.content) ? 'Step content has more than 22 words' : undefined}
                className="mt-4"
              />
            </StepWrapper>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between gap-x-6">
        <Button variant="outlined">Previous</Button>
        <Button variant="contained" primary onClick={() => {}}>
          Save & Generate PDF
        </Button>
      </div>
    </div>
  );
}
