import Input from '@/components/core/input/Input';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@/components/core/buttons/Button';
import { minMaxValidation, minValidation } from '@/components/courses/Edit/courseValidations';
import { CourseDetailsFragment, GitCourseReading, Space, UpdateTopicVideoInput } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import styled from 'styled-components';

export interface UpdateTopicReadingForm {
  courseKey: string;
  topicKey: string;
  videoUuid?: string;
  title?: string;
  shortTitle?: string;
  details?: string;
  url?: string;
  isPristine: boolean;
}

interface TopicReadingFormProps {
  course: CourseDetailsFragment;
  space: Space;
  topicKey: string;
  currentReading?: GitCourseReading;
  saveReading: (updatedReading: UpdateTopicVideoInput) => Promise<void>;
  cancel: () => void;
}

export default function EditCourseReading({ course, space, topicKey, currentReading, saveReading, cancel }: TopicReadingFormProps) {
  const [form, setForm] = useState<UpdateTopicReadingForm>({
    courseKey: course.key,
    topicKey,
    videoUuid: currentReading?.uuid,
    title: currentReading?.title,
    shortTitle: currentReading?.shortTitle,
    details: currentReading?.details,
    url: currentReading?.url,
    isPristine: true,
  });
  const [upserting, setUpserting] = useState(false);

  const updateField = (field: keyof UpdateTopicReadingForm, content: string) => {
    setForm({ ...form, [field]: content });
  };

  const titleError = minMaxValidation(form, 'title', 2, 100);
  const shortTitleError = minMaxValidation(form, 'shortTitle', 1, 20);
  const urlError = minMaxValidation(form, 'url', 1, 300);
  const urlFormatError = form.url?.startsWith('https://www.youtube.com/watch?v=') ? null : 'Url should be of the format https://www.youtube.com/watch?v=xxxxxx';
  const detailsError = minValidation(form, 'details', 50);

  const save = async () => {
    if (titleError || shortTitleError || urlError || urlFormatError || detailsError) {
      return;
    }
    setUpserting(true);

    const updatedReading: UpdateTopicVideoInput = {
      courseKey: form.courseKey,
      topicKey: form.topicKey,
      videoUuid: form.videoUuid || '',
      title: form.title || '',
      shortTitle: form.shortTitle || '',
      details: form.details || '',
      url: form.url || '',
    };

    await saveReading(updatedReading);
    setUpserting(false);
  };

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="h-full w-full">
        <Input
          modelValue={form.title}
          error={!form.isPristine && titleError}
          onUpdate={(content) => updateField('title', content?.toString() || '')}
          label="Summary Title*"
        />
        <Input
          modelValue={form.shortTitle}
          error={!form.isPristine && shortTitleError}
          onUpdate={(content) => updateField('shortTitle', content?.toString() || '')}
          label="Short Title(Shown in left nav)*"
        />
        <Input
          modelValue={form.url}
          error={!form.isPristine && !!(urlError || urlFormatError)}
          onUpdate={(content) => updateField('url', content?.toString() || '')}
          label="Youtube Video URL(https://www.youtube.com/watch?v=xxxxx)"
        />
        <div className="mt-4">Details</div>
        <StyledDiv>
          <MarkdownEditor
            id={course.key + '_details'}
            modelValue={form.details}
            placeholder="Details (at least 2-3 lines)"
            error={!form.isPristine && detailsError}
            onUpdate={(content) => updateField('details', content)}
            spaceId={space.id}
            objectId={`${course.key}/${topicKey}`}
            imageType="Course"
          />
        </StyledDiv>
      </div>
      <div className="flex justify-between mt-4">
        <Button primary onClick={cancel}>
          Cancel
        </Button>
        <Button
          primary
          variant="contained"
          onClick={save}
          disabled={!form.isPristine && !!(titleError || shortTitleError || urlError || urlFormatError || detailsError)}
          loading={upserting}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

const StyledDiv = styled.div`
  border: 1px solid var(--skin-border);
  border-radius: 0.375rem;
  padding: 0.5rem;
`;
