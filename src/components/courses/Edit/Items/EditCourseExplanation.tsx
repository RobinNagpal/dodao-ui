import Input from '@/components/core/input/Input';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@/components/core/buttons/Button';
import { CourseDetailsFragment, CourseExplanationFragment, Space, UpdateTopicExplanationInput } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import { minMaxValidation, minValidation } from './../courseValidations';

interface UpdateTopicExplanationForm extends UpdateTopicExplanationInput {
  courseKey: string;
  topicKey: string;
  isPristine: boolean;
}

interface EditCourseExplanationProps {
  course: CourseDetailsFragment;
  space: Space;
  topicKey: string;
  currentExplanation?: CourseExplanationFragment;
  saveExplanation: (form: UpdateTopicExplanationInput) => void;
  cancel: () => void;
}

export default function EditCourseExplanation({ course, space, topicKey, currentExplanation, saveExplanation, cancel }: EditCourseExplanationProps) {
  const [upserting, setUpserting] = useState(false);

  const [form, setForm] = useState<UpdateTopicExplanationForm>({
    courseKey: course.key,
    topicKey: topicKey,
    explanationKey: currentExplanation?.key || '',
    title: currentExplanation?.title || '',
    shortTitle: currentExplanation?.shortTitle || '',
    details: currentExplanation?.details || '',
    isPristine: true,
  });

  const titleError = minMaxValidation(form, 'title', 2, 100);
  const shortTitleError = minMaxValidation(form, 'shortTitle', 1, 20);
  const detailsError = minValidation(form, 'details', 20);

  const hasErrors = !!titleError || !!shortTitleError || !!detailsError;

  const updateField = (field: keyof UpdateTopicExplanationForm, content: string) => {
    setForm({
      ...form,
      [field]: content,
    });
  };

  const save = async () => {
    form.isPristine = false;
    if (hasErrors) {
      return;
    }
    setUpserting(true);
    await saveExplanation({
      courseKey: form.courseKey,
      topicKey: form.topicKey,
      explanationKey: form.explanationKey,
      title: form.title,
      shortTitle: form.shortTitle,
      details: form.details,
    });
    setUpserting(false);
  };

  return (
    <div className="flex flex-col justify-between h-full w-full text-left">
      <div className="w-full">
        <Input modelValue={form.title} error={!form.isPristine && titleError} onUpdate={(content) => updateField('title', content?.toString() || '')}>
          <span>Explanation Title*</span>
        </Input>
        <Input
          modelValue={form.shortTitle}
          error={!form.isPristine && shortTitleError}
          onUpdate={(content) => updateField('shortTitle', content?.toString() || '')}
        >
          <span>Short Title*(Shown in left nav. Max length: 20 chars)</span>
        </Input>

        <MarkdownEditor
          label={'Details'}
          id={course.key + '_details'}
          modelValue={form.details}
          placeholder="Explanation(2-3 paragraphs)"
          error={!form.isPristine && detailsError}
          onUpdate={(content) => updateField('details', content)}
          spaceId={space.id}
          objectId={`${course.key}/${topicKey}`}
          imageType="Course"
        />
      </div>
      <div className="flex justify-between mt-4 w-full">
        <Button primary onClick={cancel}>
          Cancel
        </Button>
        <Button primary variant="contained" onClick={save} disabled={hasErrors} loading={upserting}>
          Save
        </Button>
      </div>
    </div>
  );
}
