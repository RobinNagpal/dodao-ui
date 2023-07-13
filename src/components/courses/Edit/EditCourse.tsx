import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import StyledSelect from '@/components/core/select/StyledSelect';
import TextareaArray from '@/components/core/textarea/TextareaArray';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { CourseBasicInfoInput, CourseFragment, SpaceWithIntegrationsFragment, TopicConfigInput } from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { publishStatusesSelect } from '@/utils/ui/statuses';
import React, { useState } from 'react';

export interface EditCourseProps {
  space: SpaceWithIntegrationsFragment;
  course: CourseFragment;
  updateCourse: (courseInfo: CourseBasicInfoInput) => void;
  cancel: () => void;
  updating: boolean;
}

export default function EditCourse(props: EditCourseProps) {
  const { course, space } = props;
  const [courseBasicInfo, setCourseBasicInfo] = useState<CourseBasicInfoInput>({
    courseAdmins: course.courseAdmins || [],
    courseFailContent: course.courseFailContent,
    coursePassContent: course.coursePassContent,
    coursePassCount: course.coursePassCount,
    details: course.details,
    duration: course.duration,
    highlights: course.highlights,
    key: course.key,
    priority: course.priority,
    publishStatus: course.publishStatus,
    summary: course.summary,
    thumbnail: course.thumbnail,
    title: course.title,
    topicConfig: {
      showExplanations: true,
      showHints: true,
    },
  });

  const courseErrors: Record<string, any> = {};
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);
  const updateCourseBasicInfoField = (field: keyof CourseBasicInfoInput, value: any) => {
    setCourseBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const updateTopicConfigField = (field: keyof TopicConfigInput, value: boolean) => {
    setCourseBasicInfo((prev: CourseBasicInfoInput) => ({ ...prev, topicConfig: { ...(prev.topicConfig as TopicConfigInput), [field]: value } }));
  };
  return (
    <div className="p-4">
      <Input label="Title" modelValue={courseBasicInfo.title} onUpdate={(e) => updateCourseBasicInfoField('title', e?.toString() || '')} />
      <UploadInput
        error={courseErrors['thumbnail']}
        onUpdate={(v) => updateCourseBasicInfoField('thumbnail', v?.toString() || '')}
        imageType="Course"
        spaceId={space.id}
        modelValue={courseBasicInfo.thumbnail}
        objectId={course.key + '-thumbnail'}
        onInput={(value) => updateCourseBasicInfoField('thumbnail', value?.toString() || '')}
        onLoading={setUploadThumbnailLoading}
      />
      <Input label="Duration" modelValue={courseBasicInfo.duration} onUpdate={(e) => updateCourseBasicInfoField('duration', e?.toString() || '')} />
      <Input label="Priority" modelValue={courseBasicInfo.priority} onUpdate={(e) => updateCourseBasicInfoField('priority', e?.toString() || '')} />
      <StyledSelect
        label="Publish Status *"
        selectedItemId={courseBasicInfo.publishStatus || 'Live'}
        items={publishStatusesSelect}
        setSelectedItemId={(value) => updateCourseBasicInfoField('publishStatus', value as PublishStatus)}
      />
      <TextareaAutosize label={'Summary'} modelValue={courseBasicInfo.summary} onUpdate={(e) => updateCourseBasicInfoField('summary', e?.toString() || '')} />
      <TextareaArray label={'Highlights'} modelValue={courseBasicInfo.highlights} onUpdate={(e) => updateCourseBasicInfoField('highlights', e || [])} />
      <MarkdownEditor
        label={'Details'}
        id={course.key + '-details'}
        modelValue={courseBasicInfo.details}
        placeholder={'Details'}
        onUpdate={(e) => updateCourseBasicInfoField('details', e || '')}
        spaceId={space.id}
        objectId={course.key}
        imageType="Course"
      />

      <MarkdownEditor
        label={'Course Pass Content'}
        id={course.key + '-coursePassContent'}
        modelValue={courseBasicInfo.coursePassContent || ''}
        placeholder={'Course Pass Content'}
        onUpdate={(e) => updateCourseBasicInfoField('coursePassContent', e || '')}
        spaceId={space.id}
        objectId={course.key}
        maxHeight={200}
        imageType="Course"
      />
      <MarkdownEditor
        label={'Course Fail Content'}
        id={course.key + '-courseFailContent'}
        modelValue={courseBasicInfo.courseFailContent || ''}
        placeholder={'Course Fail Content'}
        onUpdate={(e) => updateCourseBasicInfoField('courseFailContent', e || '')}
        spaceId={space.id}
        objectId={course.key}
        maxHeight={200}
        imageType="Course"
      />
      <TextareaArray
        label={'Course Admin Usernames'}
        modelValue={courseBasicInfo.courseAdmins}
        onUpdate={(e) => updateCourseBasicInfoField('courseAdmins', e || [])}
      />

      <ToggleWithIcon
        label={'Show Hints'}
        enabled={!!courseBasicInfo.topicConfig?.showHints}
        setEnabled={(value) => updateTopicConfigField('showHints', value)}
      />

      <ToggleWithIcon
        label={'Show Explanations'}
        enabled={!!courseBasicInfo.topicConfig?.showExplanations}
        setEnabled={(value) => updateTopicConfigField('showExplanations', value)}
      />

      <div className="flex mt-8 justify-end">
        <Button className="btn btn-secondary mr-2" onClick={props.cancel}>
          Cancel
        </Button>
        <Button
          className="btn btn-primary mr-2"
          onClick={() => props.updateCourse(courseBasicInfo)}
          variant="contained"
          primary
          loading={props.updating}
          disabled={props.updating}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
