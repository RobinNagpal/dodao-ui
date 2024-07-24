import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { Space, Timeline, UpsertTimelineEventInput, UpsertTimelineInput } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';

import { TimelineErrors, TimelineEventsError } from '@dodao/web-core/types/errors/timelineErrors';
import { TimelineStyles } from '@/utils/timeline/timelineStyles';
import { isValidURL } from '@dodao/web-core/utils/validator';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { slugify } from '@dodao/web-core/utils/auth/slugify';

interface EditTimelineEventType extends Omit<UpsertTimelineEventInput, 'date'> {
  order: number;
  date: string;
}

export interface EditTimelineType extends Omit<UpsertTimelineInput, 'date' | 'events' | 'created'> {
  isPristine: boolean;
  events: EditTimelineEventType[];
  created: string;
}

export interface EditTimelineHelper {
  editTimelineRef: EditTimelineType;
  loadingTimeline: boolean;
  timelineCreating: boolean;
  timelineErrors: TimelineErrors;

  addNewEvent(): void;
  handleSubmit(): Promise<void>;
  initialize(): Promise<void>;
  moveEventDown(eventUuid: string): void;
  moveEventUp(eventUuid: string): void;
  removeEvent(eventUuid: string): void;
  updateTimelineField(fieldName: keyof UpsertTimelineInput, value: any): void;
  updateTimelineEventField(uuid: string, fieldName: keyof UpsertTimelineEventInput, value: any): void;
  updateTimelineEventDate(uuid: string, value: string): void;
}

export function useEditTimeline(timelineId: string | null, space: Space): EditTimelineHelper {
  const [editTimelineRef, setEditTimelineRef] = useState<EditTimelineType>({
    id: '',
    name: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    publishStatus: '',
    events: [] as EditTimelineEventType[],
    isPristine: true,
    admins: [],
    priority: 50,
    tags: [],
    created: new Date().toISOString(),
    timelineStyle: TimelineStyles.V1_Default,
  });

  const { $t } = useI18();

  const timelineContentLimit = 14400;
  const excerptLimit = 256;
  const nameLimit = 64;

  const [timelineCreating, setTimelineCreating] = useState(false);
  const [timelineErrors, setTimelineErrors] = useState<TimelineErrors>({});
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const { showNotification } = useNotificationContext();
  const router = useRouter();

  const addNewEvent = (): void => {
    setEditTimelineRef((prevTimeline) => ({
      ...prevTimeline,
      events: [
        ...prevTimeline.events,
        {
          id: '',
          uuid: uuidv4(),
          title: '',
          date: new Date().toISOString(),
          summary: '',
          fullDetails: '',
          order: prevTimeline.events.length,
        },
      ],
    }));
  };

  const removeEvent = (eventUuid: string): void => {
    setEditTimelineRef((prevTimeline) => ({
      ...prevTimeline,
      events: prevTimeline.events.filter((event) => event.uuid !== eventUuid),
    }));
  };

  const moveEventUp = (eventUuid: string) => {
    setEditTimelineRef((prevTimeline) => {
      const eventIndex = prevTimeline.events.findIndex((e) => e.uuid === eventUuid);
      if (eventIndex > 0) {
        const newEvents = [...prevTimeline.events];
        newEvents[eventIndex - 1].order = eventIndex;
        newEvents[eventIndex].order = eventIndex - 1;
        newEvents.sort((a, b) => a.order - b.order);
        return { ...prevTimeline, events: newEvents };
      }
      return prevTimeline;
    });
  };

  const moveEventDown = (eventUuid: string) => {
    setEditTimelineRef((prevTimeline) => {
      const eventIndex = prevTimeline.events.findIndex((e) => e.uuid === eventUuid);
      if (eventIndex < prevTimeline.events.length - 1) {
        const newEvents = [...prevTimeline.events];
        newEvents[eventIndex + 1].order = eventIndex;
        newEvents[eventIndex].order = eventIndex + 1;
        newEvents.sort((a, b) => a.order - b.order);
        return { ...prevTimeline, events: newEvents };
      }
      return prevTimeline;
    });
  };

  const updateTimelineEventField = (uuid: string, fieldName: keyof UpsertTimelineEventInput, value: any) => {
    setEditTimelineRef((prevTimeline) => ({
      ...prevTimeline,
      events: prevTimeline.events.map((event) => (event.uuid === uuid ? { ...event, [fieldName]: value } : event)),
    }));
  };

  const updateTimelineEventDate = (uuid: string, value: string) => {
    setEditTimelineRef((prevTimeline) => ({
      ...prevTimeline,
      events: prevTimeline.events.map((event) => (event.uuid === uuid ? { ...event, date: value } : event)),
    }));
  };

  function validateTimeline(editTimelineRef: EditTimelineType): boolean {
    const errors: TimelineErrors = {};

    if (!editTimelineRef.name) {
      errors.name = $t('validations.timeline.upsert.name.required');
    } else if (editTimelineRef.name.length < 3 || editTimelineRef.name.length > nameLimit) {
      errors.name = $t('validations.timeline.upsert.name.length');
    }
    if (!editTimelineRef.excerpt) {
      errors.excerpt = $t('validations.timeline.upsert.excerpt.required');
    } else if (editTimelineRef.excerpt.length < 5 || editTimelineRef.excerpt.length > excerptLimit) {
      errors.excerpt = $t('validations.timeline.upsert.excerpt.length');
    }

    if (!editTimelineRef.content) {
      errors.content = $t('validations.timeline.upsert.content.required');
    } else if (editTimelineRef.content.length < 5 || editTimelineRef.content.length > timelineContentLimit) {
      errors.content = $t('validations.timeline.upsert.content.length');
    }

    editTimelineRef.events.forEach((event) => {
      const eventError: TimelineEventsError = {};

      if (!event.title) {
        eventError.name = $t('validations.timeline.upsert.eventName.required');
      } else if (event.title.length < 3 || event.title.length > nameLimit) {
        eventError.name = $t('validations.timeline.upsert.eventName.length');
      }

      if (!event.summary) {
        eventError.content = $t('validations.timeline.upsert.eventContent.required');
      } else if (event.summary.length < 5 || event.summary.length > timelineContentLimit) {
        eventError.content = $t('validations.timeline.upsert.eventContent.length');
      }

      if (event.moreLink?.trim()) {
        if (!isValidURL(event.moreLink)) {
          eventError.moreLink = $t('validations.timeline.upsert.moreLink.valid');
        } else if (event.moreLink.length < 5 || event.moreLink.length > 2048) {
          eventError.moreLink = $t('validations.timeline.upsert.moreLink.length');
        }
      }
      if (Object.values(eventError || {}).length) {
        if (errors.events) {
          errors.events[event.uuid] = eventError;
        } else {
          errors.events = {};
          errors.events[event.uuid] = eventError;
        }
      }
    });

    setTimelineErrors(errors);
    console.log('validateTimeline', errors);

    return Object.values(errors).length === 0 && Object.values(errors.events || {}).length === 0;
  }

  const handleSubmit = async () => {
    setTimelineCreating(true);
    setTimelineErrors({});
    if (validateTimeline(editTimelineRef)) {
      try {
        const timelineId = editTimelineRef.id?.trim() ? editTimelineRef.id : slugify(editTimelineRef.name);

        const response = await fetch(`/api/timelines/${timelineId}`, {
          method: 'POST',
          body: JSON.stringify({
            spaceId: space.id,
            input: {
              id: editTimelineRef.id,
              name: editTimelineRef.name,
              excerpt: editTimelineRef.excerpt,
              content: editTimelineRef.content,
              thumbnail: editTimelineRef.thumbnail,
              publishStatus: editTimelineRef.publishStatus,
              admins: editTimelineRef.admins || [],
              priority: editTimelineRef.priority || 50,
              events: editTimelineRef.events.map((event) => ({
                title: event.title,
                uuid: event.uuid,
                summary: event.summary,
                fullDetails: event.fullDetails,
                moreLink: event.moreLink,
                date: new Date(event.date).toISOString(),
              })),
              tags: editTimelineRef.tags || [],
              created: new Date(editTimelineRef.created).toISOString(),
              timelineStyle: editTimelineRef.timelineStyle,
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const payload = (await response.json()).timeline;
        if (payload) {
          showNotification({
            type: 'success',
            message: 'Timeline Saved',
            heading: 'Success 🎉',
          });

          router.push(`/timelines/view/${payload.id}`);
        } else {
          console.error(response.body);
          showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
        }
      } catch (e) {
        console.error(e);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      } finally {
        setTimelineCreating(false);
      }
    } else {
      setTimelineCreating(false);
    }
  };

  const initialize = async () => {
    setLoadingTimeline(true);
    try {
      if (!timelineId) return;
      const response = await axios.get(`/api/timelines/${timelineId}`);

      const payload = response?.data?.timeline as Timeline;
      if (payload) {
        const timelineResponse: EditTimelineType = {
          ...payload,
          isPristine: true,
          events: payload.events.map((event, order): EditTimelineEventType => ({ ...event, order })),
        };
        setEditTimelineRef(timelineResponse);
      } else {
        console.error(response.data);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    } finally {
      setLoadingTimeline(false);
    }
  };
  const updateTimelineField = (fieldName: keyof UpsertTimelineInput, value: any): void => {
    setEditTimelineRef((prevTimeline) => ({ ...prevTimeline, [fieldName]: value }));
  };

  return {
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
  };
}
