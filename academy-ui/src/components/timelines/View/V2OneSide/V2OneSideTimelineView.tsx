import TimelineDetailsModal from './../TimelineDetailsModal'; // Assuming the correct file location for TimelineDetailsModal
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/solid/ArrowTopRightOnSquareIcon';
import React, { useState } from 'react';
import { Space, TimelineDetailsFragment, TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
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
            <h1 className="text-2xl font-bold leading-tight"> {timeline.name}</h1>
            <div className="flex w-24 mt-1 mb-10 overflow-hidden rounded">
              <div className={'flex-1 h-2 ' + styles.dynamicUnderline}></div>
            </div>
          </div>
          <p className="text-base text-center">{timeline.excerpt}</p>
          <p className="text-sm text-center mt-6" dangerouslySetInnerHTML={{ __html: contents || '' }}></p>
        </div>
      </div>
      <div>
        <section className="items-center py-16 font-poppins sm:pr-0 pr-5">
          <div className="justify-center max-w-6xl py-4 mx-auto lg:py-8">
            {timeline.events.map((event, i) => {
              const eventSummary = marked.parse(event.summary, { renderer });
              const currentDate = moment().local();
              const elevenMonthsAgo = currentDate.clone().subtract(11, 'months');
              const timeAgo = moment(event.date).isBefore(elevenMonthsAgo)
                ? moment(event.date).local().format('YYYY/MM/DD')
                : moment(event.date).local().startOf('seconds').fromNow();
              return (
                <div className="w-full" key={event.uuid}>
                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center w-8 md:w-24">
                      <div>
                        <div className={'flex items-center justify-center w-8 h-8 rounded-full ' + styles.timelineSecondaryColor}>
                          <div className={'w-4 h-4 rounded-full ' + styles.timelinePrimaryColor}></div>
                        </div>
                      </div>
                      <div className={'w-px h-full ' + styles.timelineSecondaryColor}></div>
                    </div>
                    <div className="w-full">
                      <h2 className={'inline-block px-4 py-2 mb-4 text-xs font-medium text-gray-100 rounded-3xl ' + styles.timeColor}>{timeAgo}</h2>
                      <div className={`relative w-full flex-1 mb-10 rounded-3xl ${styles.timelineCardBorderColor} ${styles.timelineCard}`}>
                        <div className="relative p-6 w-full">
                          <p className="mb-2 text-xl font-bold">{event.title}</p>
                          <p className="w-full p-4 pt-2 text-sm markdown-body text-left" dangerouslySetInnerHTML={{ __html: eventSummary }} />
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
