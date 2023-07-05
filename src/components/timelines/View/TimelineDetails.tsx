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
    <TimelineList>
      {timeline.events.map((event, i) => (
        <TimelineItem key={i}>
          <TimelineDateIcon>
            <CircleCSS>
              <div className="circle" />
            </CircleCSS>
          </TimelineDateIcon>
          <TimelineContent>
            <div className={event.moreLink ? 'mb-4' : ''}>
              <div className="flex justify-between">
                <h1 className="mb-1 text-lg font-semibold">{event.name}</h1>
                <h3 className="block mb-2 text-sm font-normal leading-none">{new Date(event.date).toISOString().split('T')[0]}</h3>
              </div>
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
