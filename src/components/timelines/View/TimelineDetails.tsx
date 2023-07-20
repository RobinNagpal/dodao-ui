import TimelineDetailsModal from './TimelineDetailsModal'; // Assuming the correct file location for TimelineDetailsModal
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/solid/ArrowTopRightOnSquareIcon';
import React, { useState } from 'react';
import { Space, TimelineDetailsFragment, TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import moment from 'moment';
import styled from 'styled-components';

interface TimelineProps {
  space: Space;
  timeline: TimelineDetailsFragment;
  inProgress?: boolean;
}

const StyledLink = styled.a`
  color: var(--primary-color);
  cursor: pointer;
`;

const Timeline = ({ timeline }: TimelineProps) => {
  const renderer = getMarkedRenderer();
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventFragment | null>(null); // State to track the selected event

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
    <>
      <ul role="list" className="space-y-6">
        {timeline.events.map((event, i) => {
          const eventSummary = marked.parse(event.summary, { renderer });
          const eventDetails = event.fullDetails ? marked.parse(event.fullDetails, { renderer }) : '';
          const timeAgo = moment(event.date).local().startOf('seconds').fromNow();

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
                    <span className="font-medium text-lg text-[var(--text-color)]">{event.title}</span>
                  </div>
                  <time dateTime={event.date} className="flex-none  p-4  pb-0 text-xs leading-5">
                    {timeAgo}
                  </time>
                </div>

                <p className="p-4 pt-2 text-sm leading-6 markdown-body" dangerouslySetInnerHTML={{ __html: eventSummary }} />

                <div className="flex">
                  {event.fullDetails && (
                    <>
                      <StyledLink className="p-4 flex" onClick={() => handleShowFullDetailsModal(event)}>
                        <ArrowTopRightOnSquareIcon width={20} height={20} className="mt-1 mr-1" /> Show Full Details
                      </StyledLink>
                      <StyledLink
                        className="p-4 flex "
                        onClick={() => {
                          if (event.moreLink) window.open(event.moreLink);
                        }}
                      >
                        <ArrowRightIcon width={20} height={20} className="mt-1 mr-1" /> Get More Details
                      </StyledLink>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {selectedEvent && <TimelineDetailsModal open={showFullDetailsModal} onClose={handleCloseFullDetailsModal} event={selectedEvent} />}
    </>
  );
};

export default Timeline;
