import TimelineDetailsModal from './TimelineDetailsModal'; // Assuming the correct file location for TimelineDetailsModal
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/solid/ArrowTopRightOnSquareIcon';
import React, { useState } from 'react';
import { Space, TimelineDetailsFragment, TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import moment from 'moment';
import styles from './TimelineDetails.module.scss';

interface TimelineProps {
  space: Space;
  timeline: TimelineDetailsFragment;
  inProgress?: boolean;
}

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

  function removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  return (
    <>
      <section className="items-center py-24 font-poppins">
        <div className="justify-center max-w-6xl px-4 py-4 mx-auto lg:py-8 md:px-6">
          {timeline.events.map((event, i) => {
            const eventSummary = marked.parse(event.summary, { renderer });
            const returnedEventSummary = removeHtmlTags(eventSummary);
            const currentDate = moment().local();
            const elevenMonthsAgo = currentDate.clone().subtract(11, 'months');
            const timeAgo = moment(event.date).isBefore(elevenMonthsAgo)
              ? moment(event.date).local().format('YYYY/MM/DD')
              : moment(event.date).local().startOf('seconds').fromNow();
            return (
              <div className="w-full mx-auto lg:max-w-3xl">
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center w-10 mr-4 md:w-24">
                    <div>
                      <div
                        className="flex items-center justify-center w-8 h-8 bg-blue-200 rounded-full dark:bg-gray-600">
                        <div className="w-4 h-4 bg-blue-600 rounded-full dark:bg-blue-400"></div>
                      </div>
                    </div>
                    <div className="w-px h-full bg-blue-300 dark:bg-gray-600"></div>
                  </div>
                  <div>
                    <h2
                      className="inline-block px-4 py-2 mb-4 text-xs font-medium text-gray-100 bg-gradient-to-r from-blue-500 to-blue-900 dark:from-blue-400 dark:to-blue-500 rounded-3xl dark:text-gray-100">
                      {timeAgo}</h2>
                    <div
                      className="relative flex-1 mb-10 border-b-4 border-blue-200 shadow rounded-3xl"
                      style={{ width: "800px" }}
                    >
                      <div className="relative z-20 p-6">
                        <p className="mb-2 text-xl font-bold">{event.title}</p>
                        <p  dangerouslySetInnerHTML={{__html: eventSummary}}/>
                        <div className="flex">
                          {event.fullDetails && (
                            <a
                              className={`p-4 flex ${styles.styledLink}`}
                              onClick={() => handleShowFullDetailsModal(event)}
                            >
                              Full Details <ArrowTopRightOnSquareIcon width={16} height={16} className="ml-1 mt-1 mr-1" />
                            </a>
                          )}
                          {event.moreLink && (
                            <a
                              className={`mt-4 flex ${styles.styledLink}`}
                              onClick={() => {
                                if (event.moreLink) window.open(event.moreLink);
                              }}
                            >
                              More Details <ArrowRightIcon width={16} height={16} className="ml-1 mt-1 mr-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section >

      {selectedEvent && <TimelineDetailsModal open={showFullDetailsModal} onClose={handleCloseFullDetailsModal} event={selectedEvent} />
      }
    </>
  );
};

export default Timeline;

