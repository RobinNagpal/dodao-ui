import TimelineDetailsModal from './../TimelineDetailsModal'; // Assuming the correct file location for TimelineDetailsModal
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/solid/ArrowTopRightOnSquareIcon';
import React, { useState } from 'react';
import { Space, TimelineDetailsFragment, TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import moment from 'moment';
import styles from './V2OneSideTimelineView.module.scss';

interface V2OneSideTimelineViewProps {
  space: Space;
  timeline: TimelineDetailsFragment;
}

export default function V2OneSideTimelineView({ timeline }: V2OneSideTimelineViewProps) {
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
      <div className="max-w-xl mx-auto">
        <div className="text-center ">
          <div className="relative flex flex-col items-center">
            <h1 className="text-6xl font-bold leading-tight"> {timeline.name}</h1>
            <div className="flex w-24 mt-1 mb-10 overflow-hidden rounded">
              <div className="flex-1 h-2 bg-blue-200"></div>
              <div className="flex-1 h-2 bg-blue-400"></div>
              <div className="flex-1 h-2 bg-blue-600"></div>
            </div>
          </div>
          <p className="text-base text-center">{timeline.excerpt}</p>
          <p className="text-sm text-center" dangerouslySetInnerHTML={{ __html: contents || '' }}></p>
        </div>
      </div>
      <div>
        <section className="items-center py-24 font-poppins">
          <div className="justify-center max-w-6xl px-4 py-4 mx-auto lg:py-8 md:px-6">
            {timeline.events.map((event, i) => {
              const eventSummary = marked.parse(event.summary, { renderer });
              const currentDate = moment().local();
              const elevenMonthsAgo = currentDate.clone().subtract(11, 'months');
              const timeAgo = moment(event.date).isBefore(elevenMonthsAgo)
                ? moment(event.date).local().format('YYYY/MM/DD')
                : moment(event.date).local().startOf('seconds').fromNow();
              return (
                <div className="w-full lg:max-w-3xl" key={event.uuid}>
                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center w-10 mr-4 md:w-24">
                      <div>
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-200 rounded-full dark:bg-gray-600">
                          <div className="w-4 h-4 bg-blue-600 rounded-full dark:bg-blue-400"></div>
                        </div>
                      </div>
                      <div className="w-px h-full bg-blue-300 dark:bg-gray-600"></div>
                    </div>
                    <div>
                      <h2 className="inline-block px-4 py-2 mb-4 text-xs font-medium text-gray-100 bg-gradient-to-r from-blue-500 to-blue-900 dark:from-blue-400 dark:to-blue-500 rounded-3xl dark:text-gray-100">
                        {timeAgo}
                      </h2>
                      <div className={'relative w-[70vw] flex-1 mb-10 border-b-4 border-blue-200 shadow rounded-3xl ' + styles.timelineCard}>
                        <div className="relative p-6">
                          <p className="mb-2 text-xl font-bold">{event.title}</p>
                          <p dangerouslySetInnerHTML={{ __html: eventSummary }} />
                          <div className="flex">
                            {event.fullDetails && (
                              <a className={`p-4 flex ${styles.styledLink}`} onClick={() => handleShowFullDetailsModal(event)}>
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
        </section>
      </div>
      {selectedEvent && <TimelineDetailsModal open={showFullDetailsModal} onClose={handleCloseFullDetailsModal} event={selectedEvent} />}
    </div>
  );
}
