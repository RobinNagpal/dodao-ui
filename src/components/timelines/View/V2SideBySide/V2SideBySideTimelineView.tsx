import TimelineDetailsModal from '@/components/timelines/View/TimelineDetailsModal'; // Assuming the correct file location for TimelineDetailsModal
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/solid/ArrowTopRightOnSquareIcon';
import React, { useState } from 'react';
import { Space, TimelineDetailsFragment, TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import moment from 'moment';
import styles from './V2SideBySideTimelineView.module.scss';

interface V3AlternatingTimelineViewProps {
  space: Space;
  timeline: TimelineDetailsFragment;
}

export default function V2SideBySideTimelineView({ timeline }: V3AlternatingTimelineViewProps) {
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
            <h1 className="text-2xl mt-3 font-bold leading-tight"> {timeline.name}</h1>
          </div>
          <p className="mt-4 text-base text-center">{timeline.excerpt}</p>
          <p className="text-sm text-center" dangerouslySetInnerHTML={{ __html: contents || '' }}></p>
        </div>
      </div>
      <div>
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col justify-center divide-y divide-slate-200 [&>*]:py-16">
            <div className="w-full mx-auto">
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {timeline.events.map((event) => {
                  const eventSummary = marked.parse(event.summary, { renderer });
                  const currentDate = moment().local();
                  const elevenMonthsAgo = currentDate.clone().subtract(11, 'months');
                  const timeAgo = moment(event.date).isBefore(elevenMonthsAgo)
                    ? moment(event.date).local().format('YYYY/MM/DD')
                    : moment(event.date).local().startOf('seconds').fromNow();
                  return (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active" key={event.uuid}>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="12" height="10">
                          <path
                            fill-rule="nonzero"
                            d="M10.422 1.257 4.655 7.025 2.553 4.923A.916.916 0 0 0 1.257 6.22l2.75 2.75a.916.916 0 0 0 1.296 0l6.415-6.416a.916.916 0 0 0-1.296-1.296Z"
                          />
                        </svg>
                      </div>
                      <div className={'w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow ' + styles.timelineCard}>
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold">{event.title}</div>
                        </div>
                        <time className={'font-medium ' + styles.timeColor}>{timeAgo}</time>
                        <div className={'mt-3 text-sm overflow-x-auto pb-3 ' + styles.normalfont} dangerouslySetInnerHTML={{ __html: eventSummary }}></div>
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedEvent && <TimelineDetailsModal open={showFullDetailsModal} onClose={handleCloseFullDetailsModal} event={selectedEvent} />}
    </div>
  );
}
