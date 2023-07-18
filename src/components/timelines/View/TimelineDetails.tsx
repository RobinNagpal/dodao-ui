import { Space, TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import moment from 'moment';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
interface TimelineProps {
  space: Space;
  timeline: TimelineDetailsFragment;
  inProgress?: boolean;
}
const Timeline = ({ timeline }: TimelineProps) => {
  const renderer = getMarkedRenderer();
  return (
    <>
      <ul role="list" className="space-y-6">
        {timeline.events.map((event, i) => {
          const eventSummary = marked.parse(event.summary, { renderer });

          const timeAgo = moment(event.date).local().startOf('seconds').fromNow();
          return (
            <li key={i} className="relative flex gap-x-4 items-center">
              <div className="absolute left-0 top-0 flex w-5 justify-center -bottom-6 mr-4 ">
                <div className="w-px bg-gray-200"></div>
              </div>
              <div className="flex items-center">
                <div className="rounded-full bg-[var(--bg-color)] h-8 w-5 flex items-center justify-center rounded-full relative z-10">
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
                <p className=" p-4 pt-2 text-sm leading-6" dangerouslySetInnerHTML={{ __html: eventSummary }} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
export default Timeline;
