import TimelineDetailsModal from './../TimelineDetailsModal'; // Assuming the correct file location for TimelineDetailsModal
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/solid/ArrowTopRightOnSquareIcon';
import React, { useState } from 'react';
import { Space, TimelineDetailsFragment, TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import moment from 'moment';
import styles from './V1DefaultTimelineView.module.scss';

interface V1DefaultTimelineViewProps {
  space: Space;
  timeline: TimelineDetailsFragment;
}

export default function V1DefaultTimelineView({ timeline }: V1DefaultTimelineViewProps) {
  const renderer = getMarkedRenderer();
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventFragment | null>(null); // State to track the selected event
  const contents = timeline?.content && marked.parse(timeline?.content, { renderer });

  // Function to open the modal for the selected event
  const handleShowFullDetailsModal = (event: TimelineEventFragment) => {
    setSelectedEvent(event);
    setShowFullDetailsModal(true);
  };

  // Function to close the modal
  const handleCloseFullDetailsModal = () => {
    setSelectedEvent(null);
    setShowFullDetailsModal(false);
  };

  return (
    <div>
      <div className="mb-8 px-2 text-2xl">
        <div className="mt-2">
          <h1 className="mb-2 px-2 text-3xl font-semibold ">{timeline?.name}</h1>
        </div>
        <div className="px-2 text-base">{timeline?.excerpt}</div>
        <div className="px-2 mt-2 text-sm " dangerouslySetInnerHTML={{ __html: contents || '' }}></div>
      </div>
      <div className="px-2">
        <ul role="list" className="space-y-6">
          {timeline.events.map((event, i) => {
            const eventSummary = marked.parse(event.summary, { renderer });
            const currentDate = moment().local();
            const elevenMonthsAgo = currentDate.clone().subtract(11, 'months');

            const timeAgo = moment(event.date).isBefore(elevenMonthsAgo)
              ? moment(event.date).local().format('YYYY/MM/DD')
              : moment(event.date).local().startOf('seconds').fromNow();

            return (
              <li key={i} className="relative flex gap-x-4 items-center">
                <div className="absolute left-0 top-0 flex w-5 justify-center -bottom-6 mr-4 ">
                  <div className="w-px bg-gray-200"></div>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full bg-[var(--bg-color)] h-8 w-5 flex items-center justify-center relative z-10">
                    <div className="rounded-full bg-gray-200 ring-1 ring-gray-400 h-3 w-3"></div>
                  </div>
                </div>
                <div className="flex-auto rounded-md ring-1 ring-inset ring-gray-200">
                  <div className="flex justify-between gap-x-4">
                    <div className="text-xs leading-5 text-gray-500 p-4 pb-0">
                      <span className="font-medium text-xl text-[var(--text-color)]">{event.title}</span>
                    </div>
                    <time dateTime={event.date} className="flex-none  p-4  pb-0 text-xs leading-5">
                      {timeAgo}
                    </time>
                  </div>

                  <p className="p-4 pt-2 text-sm leading-6 markdown-body text-left" dangerouslySetInnerHTML={{ __html: eventSummary }} />

                  <div className="flex">
                    {event.fullDetails && (
                      <a className={`p-4 flex ${styles.styledLink}`} onClick={() => handleShowFullDetailsModal(event)}>
                        Full Details <ArrowTopRightOnSquareIcon width={16} height={16} className="ml-1 mt-1 mr-1" />
                      </a>
                    )}
                    {event.moreLink && (
                      <a
                        className={`p-4 flex ${styles.styledLink}`}
                        onClick={() => {
                          if (event.moreLink) window.open(event.moreLink);
                        }}
                      >
                        More Details <ArrowRightIcon width={16} height={16} className="ml-1 mt-1 mr-1" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {selectedEvent && <TimelineDetailsModal open={showFullDetailsModal} onClose={handleCloseFullDetailsModal} event={selectedEvent} />}
    </div>
  );
}
