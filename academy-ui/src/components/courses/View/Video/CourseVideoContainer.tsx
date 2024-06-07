import parseYouTubeUrl from '@/components/courses/View/Video/parseYouTubeUrl';
import { VideoState } from '@/components/courses/View/Video/VideoState';
import YouTubeVideoContainer from '@/components/courses/View/Video/YouTubeVideoContainer';
import { useState } from 'react';

export type CourseVideoContainerProps = {
  uuid: string;
  url: string;
};

export default function CourseVideoContainer(props: CourseVideoContainerProps) {
  const [activeMark, setActiveMark] = useState<number | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);
  const [videoState, setVideoState] = useState<VideoState>(VideoState.unstarted);
  const yt = parseYouTubeUrl(props.url);
  return (
    <YouTubeVideoContainer
      markers={new Map()}
      setActiveMark={setActiveMark}
      setCurrentTimestamp={setCurrentTimestamp}
      setMaxDuration={setMaxDuration}
      setVideoState={setVideoState}
      videoState={videoState}
      currentTimestamp={0}
      id={props.uuid}
      videoId={yt?.id!}
    />
  );
}
