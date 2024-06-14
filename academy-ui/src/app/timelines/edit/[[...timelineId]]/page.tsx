'use client';

import { useEditTimeline } from '@/app/timelines/edit/[[...timelineId]]/useEditTimeline';

import withSpace from '@/contexts/withSpace';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import Datepicker from '@dodao/web-core/components/core/datepicker/Datepicker';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { ImageType, SpaceWithIntegrationsFragment, UpsertTimelineEventInput } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { TimelineStyles, timelineStyleSelect } from '@/utils/timeline/timelineStyles';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import Link from 'next/link';
import React, { useEffect } from 'react';
import styled from 'styled-components';

interface EventContainerProps {
  hasError: boolean;
}

const EventContainer = styled.div<EventContainerProps>`
  border: ${(props) => (props.hasError ? 'red solid 1px' : 'none')} !important;
`;

const AddEventButton = styled.button`
  color: var(--primary-color);
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
        <div className="px-4">
          <Input
            label="Timeline name"
            modelValue={editTimelineRef.name}
            placeholder="Timeline name"
            onUpdate={(e) => updateTimelineField('name', e || '')}
            error={timelineErrors.name}
          />
          <TextareaAutosize
            label="Timeline Excerpt"
            id="timeline-excerpt"
            modelValue={editTimelineRef.excerpt || ''}
            placeholder="Timeline Excerpt"
            onUpdate={(e) => updateTimelineField('excerpt', e || '')}
            error={timelineErrors.excerpt}
            className="mt-4"
          />
          <StyledSelect
            label="TimelineStyle *"
            selectedItemId={editTimelineRef.timelineStyle || TimelineStyles.V1_Default}
            items={timelineStyleSelect}
            setSelectedItemId={(value) => updateTimelineField('timelineStyle', value)}
          />
          <MarkdownEditor
            label={`Timeline Details *`}
            modelValue={editTimelineRef.content}
            placeholder="Timeline content"
            onUpdate={(e) => updateTimelineField('content', e?.toString() || '')}
            error={timelineErrors.content}
            imageType={ImageType.Space}
            objectId={timelineId || 'new-timeline'}
            spaceId={props.space.id}
            maxHeight={200}
            className="mt-4"
          />
          {(editTimelineRef.events || []).map((event: UpsertTimelineEventInput, index: number) => (
            <div className="border-dashed border-t-2 mt-10 px-4" key={event.uuid}>
              <EventContainer hasError={!!timelineErrors.events?.[event.uuid]}>
                <div className="flex flex-row-reverse mt-2">
                  <IconButton iconName={IconTypes.Trash} size="large" onClick={() => removeEvent(event.uuid)} />
                  <IconButton iconName={IconTypes.MoveDown} size="large" onClick={() => moveEventDown(event.uuid)} />
                  <IconButton iconName={IconTypes.MoveUp} size="large" onClick={() => moveEventUp(event.uuid)} />
                </div>
                <Input
                  modelValue={event.title}
                  label={`Event Title *`}
                  placeholder="Event name"
                  onUpdate={(e) => updateTimelineEventField(event.uuid, 'title', e?.toString() || '')}
                  error={timelineErrors.events?.[event.uuid]?.name}
                />
                <Datepicker
                  date={new Date(event.date)}
                  label={`Event Date *`}
                  onChange={(date) => {
                    updateTimelineEventDate(event.uuid, date?.toISOString() || new Date().toISOString());
                  }}
                />
                <Input
                  label={`More link`}
                  modelValue={event.moreLink}
                  placeholder="More link"
                  onUpdate={(e) => updateTimelineEventField(event.uuid, 'moreLink', e?.toString() || '')}
                  error={timelineErrors.events?.[event.uuid]?.moreLink}
                />
                <MarkdownEditor
                  label={`Event summary *`}
                  modelValue={event.summary}
                  placeholder="Event content"
                  onUpdate={(e) => updateTimelineEventField(event.uuid, 'summary', e?.toString() || '')}
                  error={timelineErrors.events?.[event.uuid]?.content}
                  imageType={ImageType.Space}
                  objectId={timelineId || 'new-timeline'}
                  spaceId={props.space.id}
                  maxHeight={150}
                  className="mt-4"
                />
                <MarkdownEditor
                  label={`Event full details`}
                  modelValue={event.fullDetails || ''}
                  placeholder="Event content"
                  onUpdate={(e) => updateTimelineEventField(event.uuid, 'fullDetails', e?.toString() || '')}
                  error={timelineErrors.events?.[event.uuid]?.content}
                  imageType={ImageType.Space}
                  objectId={timelineId || 'new-timeline'}
                  spaceId={props.space.id}
                  maxHeight={200}
                  className="mt-4"
                />
              </EventContainer>
            </div>
          ))}
          <AddEventButton
            className="m-auto rounded-full text-2xl bg-primary w-[48px] text-white flex items-center font-bold justify-center h-[48px]"
            onClick={() => addNewEvent()}
          >
            <PlusCircle height={25} width={25} />
          </AddEventButton>

          <Button variant="contained" primary loading={timelineCreating} className="w-full" onClick={handleSubmit}>
            Publish
          </Button>
        </div>
      </SingleCardLayout>
    </PageWrapper>
  );
};

export default withSpace(EditTimeline);
