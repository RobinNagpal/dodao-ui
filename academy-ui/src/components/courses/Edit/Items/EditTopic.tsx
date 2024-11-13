import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import { minMaxValidation, minValidation } from '@/components/courses/Edit/courseValidations';
import { CourseDetailsFragment, CourseTopicFragment, ImageType, UpdateTopicBasicInfoInput } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

export interface UpdateTopicForm {
  courseKey: string;
  topicKey: string;
  title: string;
  details: string;
  isPristine: boolean;
}

interface EditTopicProps {
  course: CourseDetailsFragment;
  space: SpaceWithIntegrationsDto;
  topicKey?: string;
  currentTopic?: CourseTopicFragment;
  saveTopic: (updatedTopic: UpdateTopicBasicInfoInput) => Promise<void>;
  cancel: () => void;
}

export default function EditTopic({ course, space, topicKey, currentTopic, saveTopic, cancel }: EditTopicProps) {
  const [form, setForm] = useState<UpdateTopicForm>({
    courseKey: course.key,
    topicKey: topicKey || '',
    title: currentTopic?.title || '',
    details: currentTopic?.details || '',
    isPristine: true,
  });
  const [upserting, setUpserting] = useState(false);

  const updateField = useCallback((field: keyof UpdateTopicForm, content: string) => {
    setForm((prev) => ({ ...prev, [field]: content }));
  }, []);

  const titleError = useMemo(() => minMaxValidation(form, 'title', 2, 100), [form]);
  const detailsError = useMemo(() => minValidation(form, 'details', 20), [form]);
  const hasErrors = useMemo(() => !!titleError || !!detailsError, [titleError, detailsError]);

  const save = useCallback(async () => {
    if (hasErrors) return;
    setUpserting(true);
    const updatedTopic: UpdateTopicBasicInfoInput = {
      courseKey: form.courseKey,
      topicKey: form.topicKey,
      title: form.title,
      details: form.details,
    };

    await saveTopic(updatedTopic);
    setUpserting(false);
  }, [form, hasErrors, saveTopic]);

  return (
    <div className="flex flex-col justify-between h-full w-full text-left">
      <div className="w-full">
        <Input
          modelValue={form.title}
          error={!form.isPristine && titleError}
          onUpdate={(content) => updateField('title', content?.toString() || '')}
          label="Chapter Title*"
        />
        <div className="mt-4">Details</div>
        <StyledDiv>
          <MarkdownEditor
            id={`${course.key}_details`}
            modelValue={form.details}
            placeholder="Explanation(2-3 paragraphs)"
            error={!form.isPristine && detailsError}
            onUpdate={(content) => updateField('details', content)}
            spaceId={space.id}
            objectId={`${course.key}/${topicKey}`}
            imageType={ImageType.Course}
          />
        </StyledDiv>
      </div>
      <div className="flex justify-between mt-4 w-full">
        <Button primary onClick={cancel}>
          Cancel
        </Button>
        <Button primary variant="contained" onClick={save} disabled={!!titleError || !!detailsError} loading={upserting}>
          Save
        </Button>
      </div>
    </div>
  );
}

const StyledDiv = styled.div`
  border: 1px solid;
  border-radius: 0.375rem;
  padding: 0.5rem;
`;
