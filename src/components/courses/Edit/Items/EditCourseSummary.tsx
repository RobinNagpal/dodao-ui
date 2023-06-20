import Input from '@/components/core/input/Input';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@/components/core/buttons/Button';
import { minMaxValidation, minValidation } from '@/components/courses/Edit/courseValidations';
import { CourseDetailsFragment, CourseSummaryFragment, Space, UpdateTopicSummaryInput } from '@/graphql/generated/generated-types';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

export interface UpdateTopicSummaryForm {
  courseKey: string;
  topicKey: string;
  summaryKey?: string;
  title?: string;
  shortTitle?: string;
  details?: string;
  isPristine: boolean;
}

interface EditCourseSummaryProps {
  course: CourseDetailsFragment;
  space: Space;
  topicKey: string;
  currentSummary?: CourseSummaryFragment;
  saveSummary: (updatedSummary: UpdateTopicSummaryInput) => Promise<void>;
  cancel: () => void;
}

export default function EditCourseSummary({ course, space, topicKey, currentSummary, saveSummary, cancel }: EditCourseSummaryProps) {
  const [form, setForm] = useState<UpdateTopicSummaryForm>({
    courseKey: course.key,
    topicKey,
    summaryKey: currentSummary?.key,
    title: currentSummary?.title,
    shortTitle: currentSummary?.shortTitle,
    details: currentSummary?.details,
    isPristine: true,
  });
  const [upserting, setUpserting] = useState(false);

  const updateField = useCallback((field: keyof UpdateTopicSummaryForm, content: string) => {
    setForm((prev) => ({ ...prev, [field]: content }));
  }, []);

  const titleError = useMemo(() => minMaxValidation(form, 'title', 2, 100), [form]);
  const shortTitleError = useMemo(() => minMaxValidation(form, 'shortTitle', 1, 20), [form]);
  const detailsError = useMemo(() => minValidation(form, 'details', 20), [form]);
  const hasErrors = useMemo(() => !!titleError || !!shortTitleError || !!detailsError, [titleError, shortTitleError, detailsError]);

  const save = useCallback(async () => {
    if (hasErrors) return;
    setUpserting(true);
    const updatedSummary: UpdateTopicSummaryInput = {
      courseKey: form.courseKey,
      topicKey: form.topicKey,
      summaryKey: form.summaryKey || '',
      title: form.title || '',
      shortTitle: form.shortTitle || '',
      details: form.details || '',
    };
    await saveSummary(updatedSummary);
    setUpserting(false);
  }, [form, hasErrors, saveSummary]);

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
        <div className="mt-4">Details</div>
        <StyledDiv>
          <MarkdownEditor
            id={`${course.key}_details`}
            modelValue={form.details}
            placeholder="Summary (at least 2-3 lines)"
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
        <Button primary variant="contained" onClick={save} disabled={!form.isPristine && hasErrors} loading={upserting}>
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
