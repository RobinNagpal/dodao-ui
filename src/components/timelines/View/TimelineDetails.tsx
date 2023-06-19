'use client';

import CalendarIcon from '@/components/core/icons/CalendarIcon';
import Button from '@/components/core/buttons/Button';
import { Space, TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import styled from 'styled-components';

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
  width: 30px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-left: -33px;
  min-width: 40px;
`;

const TimelineContent = styled.div`
  padding: 0 20px 20px 20px;
  margin-left: 20px;
  width: max-content;
  margin-bottom: 10px;

  h1 {
    margin-bottom: 1px;
  }
`;
const Timeline = ({ timeline }: TimelineProps) => {
  return (
    <TimelineList>
      {timeline.events.map((event, i) => (
        <TimelineItem key={i}>
          <TimelineDateIcon>
            <CalendarIcon />
          </TimelineDateIcon>
          <TimelineContent>
            <div className={event.moreLink ? 'mb-4' : ''}>
              <h1 className="mb-1 text-lg font-semibold">{event.name}</h1>
              <h3 className="block mb-2 text-sm font-normal leading-none">{new Date(event.date).toISOString().split('T')[0]}</h3>
              <p className="text-base font-normal">{event.content}</p>
            </div>
            {event.moreLink && (
              <a href={event.moreLink} target="_blank" rel="noopener noreferrer">
                <Button primary>Learn More</Button>
              </a>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </TimelineList>
  );
};

export default Timeline;
