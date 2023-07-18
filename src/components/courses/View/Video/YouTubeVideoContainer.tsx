import { VideoState } from '@/components/courses/View/Video/VideoState';
import YouTubePlayer from '@/components/courses/View/Video/YouTubePlayer';
import useInterval from '@use-it/interval';
import isNumber from 'lodash/isNumber';
import React, { useEffect, useState, useRef } from 'react';

export interface YouTubeVideoRenderedContainerProps {
  currentTimestamp: number;
  id: string;
  markers: Map<number, string>;
  pauseOnSeek?: boolean;
  setActiveMark: (mark: number | null) => void;
  setCurrentTimestamp: (currentTimestamp: number) => void;
  setMaxDuration: (maxDuration: number) => void;
  setVideoState: (videoState: VideoState) => void;
  videoId: string;
  videoState: VideoState;
}

export default function YouTubeVideoContainer({
  currentTimestamp,
  id,
  pauseOnSeek,
  setCurrentTimestamp,
  setMaxDuration,
  setVideoState,
  videoId,
  videoState,
}: YouTubeVideoRenderedContainerProps) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const videoStateRef = useRef<VideoState>(videoState);

  const onPlayOrPause = () => {
    if (player) {
      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        setVideoState(VideoState.paused);
      } else {
        player.playVideo();
        setVideoState(VideoState.playing);
      }
    }
  };

  const onPlayerReady = (p: YT.Player) => {
    setPlayer(p);
    setMaxDuration(p.getDuration() * 1000);
  };

  const onSetCurrentTimestamp = (ms: number) => {
    if (player) {
      if (pauseOnSeek) {
        player.pauseVideo();
        setVideoState(VideoState.paused);
      }

      setCurrentTimestamp(ms);
      player.seekTo(ms / 1000, true);
    }
  };

  useInterval(
    async () => {
      if (player) {
        // The Youtube API offers no callback like the native html5 onTimeUpdate
        const oldTime = currentTimestamp;
        const currentTime = (await player.getCurrentTime()) * 1000;
        if (isNumber(currentTime) && currentTime !== oldTime) {
          setCurrentTimestamp(currentTime);
        }
      }
    },
    // The interval needs to be cleared when the video is paused
    videoState === VideoState.playing ? 250 : null,
  );

  // The video state may change from a component above
  useEffect(() => {
    if (player) {
      videoStateRef.current = videoState;
      const playerState = player.getPlayerState();
      if (
        (videoState === VideoState.paused && playerState !== YT.PlayerState.PAUSED) ||
        (videoState === VideoState.playing && playerState !== YT.PlayerState.PLAYING)
      ) {
        onPlayOrPause();
      }
    }
  }, [videoState]);

  return (
    <>
      <YouTubePlayer
        allowFullScreen={false}
        controls="0"
        height="315"
        id={id}
        onReady={onPlayerReady}
        onEnd={(p) => {
          // If dragging the slider to the end of the video, prevent restarting
          if (videoStateRef.current === VideoState.playing) {
            setVideoState(VideoState.unstarted);
            setCurrentTimestamp(0);
            p.stopVideo();
          }
        }}
        onPause={(p) => {
          p.pauseVideo();
          setVideoState(VideoState.paused);
        }}
        onPlay={(p) => {
          p.playVideo();
          setVideoState(VideoState.playing);
        }}
        videoId={videoId}
        width="100%"
      />
    </>
  );
}
