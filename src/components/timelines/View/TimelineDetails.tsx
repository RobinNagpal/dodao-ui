import CalendarIcon from '@/components/core/icons/CalendarIcon';
import Button from '@/components/core/buttons/Button';
import { Space, TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import styled from 'styled-components';
import { Fragment, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { FaceFrownIcon, FaceSmileIcon, FireIcon, HandThumbUpIcon, HeartIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Listbox, Transition } from '@headlessui/react';
import moment from 'moment';

interface TimelineProps {
  space: Space;
  timeline: TimelineDetailsFragment;
  inProgress?: boolean;
}
const TimelineList = styled.ol`
  border-left: 2px solid var(--primary-color);
`;
const TimelineItem = styled.li`
  margin-left: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
`;
const TimelineDateIcon = styled.div`
  background-color: var(--primary-color);
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-left: -18px;
  min-width: 15px;
  box-shadow: 0 0 0 4px var(--bg-color);
`;
const TimelineContent = styled.div`
  padding: 20px 20px 20px 20px;
  margin-left: 20px;
  width: max-content;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  h1 {
    margin-bottom: 1px;
  }
`;
const CircleCSS = styled.div`
  .circle {
    background-color: #f3f4f6;
    border: 4px solid #d6d7db;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
const Timeline = ({ timeline }: TimelineProps) => {
  return (
    <>
      <ul role="list" className="space-y-6">
        {timeline.events.map((event, i) => {
          const timeAgo = moment(event.date).local().startOf('seconds').fromNow();

          return (
            <li key={i} className="relative flex gap-x-4">
              <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
                <div className="w-px bg-gray-200"></div>
              </div>
              <li className="relative flex gap-x-4">
                <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
                  <div className="w-px bg-gray-200"></div>
                </div>
                <div className="rounded-full bg-gray-120 ring-1 ring-gray-300 mt-3 h-6 w-6 flex-none rounded-full"></div>
                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-gray-500">
                      <span className="font-medium text-gray-900">{event.name}</span>
                    </div>
                    <time dateTime={event.date} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                      {timeAgo}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-gray-500">{event.content}</p>
                </div>
              </li>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Timeline;
