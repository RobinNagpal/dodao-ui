'use client';

import { useEditTimeline } from '@/app/timelines/edit/[[...timelineId]]/useEditTimeline';
// EditTimeline.tsx
import withSpace from '@/app/withSpace';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import Input from '@/components/core/input/Input';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import StyledTextareaAutosize from '@/components/core/textarea/StyledTextareaAutosize';
import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment, UpsertTimelineEventInput } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import Link from 'next/link';
import { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';

const EventContainer = styled.div`
  border: ${(props: { hasError: boolean }) => (props.hasError ? 'red solid 1px' : 'none')} !important;
`;

const EditTimeline = (props: { space: SpaceWithIntegrationsFragment; params: { timelineId?: string[] } }) => {
  const { space, params } = props;
  const timelineId = params.timelineId ? params.timelineId[0] : null;
  const {
    editTimelineRef,
    loadingTimeline,
    timelineCreating,
    timelineErrors,

    addNewEvent,
    handleSubmit,
    initialize,
    moveEventDown,
    moveEventUp,
    removeEvent,
    updateTimelineField,
    updateTimelineEventField,
    updateTimelineEventDate,
  } = useEditTimeline(timelineId || null, props.space);

  useEffect(() => {
    initialize();
  }, [timelineId]);

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="px-4 mb-4 md:px-0 overflow-hidden">
          <Link href={timelineId ? `/timelines/view/${timelineId}` : `/timelines`} className="text-color">
            <span className="mr-1 font-bold">&#8592;</span>
            {timelineId ? editTimelineRef.name : 'Back to Timelines'}
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <Input
            modelValue={editTimelineRef.name}
            placeholder="Timeline name"
            onUpdate={(e) => updateTimelineField('name', e || '')}
            error={timelineErrors.name}
          />
          <div className="mt-4">
            <div>Excerpt</div>
            <StyledTextareaAutosize
              modelValue={editTimelineRef.excerpt || ''}
              placeholder="Timeline description"
              onUpdate={(e) => updateTimelineField('excerpt', e || '')}
              error={timelineErrors.excerpt}
            />
          </div>
          {(editTimelineRef.events || []).map((event: UpsertTimelineEventInput, index: number) => (
            <div className="border-dashed border-t-2 mt-10" key={event.uuid}>
              <EventContainer hasError={!!timelineErrors.events?.[event.uuid]}>
                <div className="flex flex-row-reverse mt-2">
                  <IconButton iconName={IconTypes.Trash} size="large" onClick={() => removeEvent(event.uuid)} />
                  <IconButton iconName={IconTypes.MoveDown} size="large" onClick={() => moveEventDown(event.uuid)} />
                  <IconButton iconName={IconTypes.MoveUp} size="large" onClick={() => moveEventUp(event.uuid)} />
                </div>
                <Input
                  modelValue={event.name}
                  placeholder="Event name"
                  onUpdate={(e) => updateTimelineEventField(event.uuid, 'name', e?.toString() || '')}
                  error={timelineErrors.events?.[event.uuid]?.name}
                />
                <DatePicker selected={new Date(event.date)} onChange={(date: Date) => updateTimelineEventDate(event.uuid, date.toISOString())} />
                <Input
                  modelValue={event.moreLink}
                  placeholder="More link"
                  onUpdate={(e) => updateTimelineEventField(event.uuid, 'moreLink', e?.toString() || '')}
                  error={timelineErrors.events?.[event.uuid]?.moreLink}
                />
                <div className="mt-4">
                  <MarkdownEditor
                    modelValue={event.content}
                    placeholder="Event content"
                    onUpdate={(e) => updateTimelineEventField(event.uuid, 'content', e?.toString() || '')}
                    error={timelineErrors.events?.[event.uuid]?.content}
                    imageType={'Timeline'}
                    objectId={timelineId || 'new-timeline'}
                    spaceId={props.space.id}
                  />
                </div>
              </EventContainer>
            </div>
          ))}
          <Button onClick={addNewEvent}>Add Event</Button>
          <Button type="submit" loading={timelineCreating}>
            Publish
          </Button>
        </form>
      </SingleCardLayout>
    </PageWrapper>
  );
};

export default withSpace(EditTimeline);
