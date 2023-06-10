import FullScreenIcon from '@/components/app/Icons/FullScreenIcon';
import React, { useState, useEffect, useCallback } from 'react';
import Slider from 'react-slider';
import styled from 'styled-components';

interface VideoPlayerProps {
  elemId: string;
  videoId?: string;
  marks?: Array<number>;
  onMarkReach?: (time: number) => void;
  fullScreen?: (isFullScreen: boolean) => void;
  onPlayerReady?: (player: any) => void;
}

// Styled Components
const VideoContainer = styled.div`
  &:hover .custom-control {
    display: block;
  }
`;

const FullScreenButton = styled.button`
  position: absolute;
  width: 40px;
  height: 40px;
  bottom: 0px;
  right: 12px;
  svg {
    fill: white;
  }
`;

const ProgressBarContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 33px;
`;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ elemId, videoId, marks = [], onMarkReach, fullScreen, onPlayerReady }) => {
  const [player, setPlayer] = useState<any>(null);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerState, setPlayerState] = useState({
    duration: 0,
    state: null,
  });
  const [markObject, setMarkObject] = useState<any>({});
  const [lastTimeUpdate, setLastTimeUpdate] = useState(0);

  // Convert Vue.js method to React.js function
  const formatValue = useCallback((seconds: number) => {
    const date = new Date(0);
    date.setSeconds(Math.round(seconds));
    return seconds >= 3600 ? date.toISOString().substr(11, 8) : date.toISOString().substr(14, 5);
  }, []);

  const closeFullscreen = useCallback(() => {
    const elem = document as any;
    if (elem.exitFullscreen) {
      elem.exitFullscreen();
    } else if (elem.mozCancelFullScreen) {
      /* Firefox */
      elem.mozCancelFullScreen();
    } else if (elem.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      elem.webkitExitFullscreen();
    } else if (elem.msExitFullscreen) {
      /* IE/Edge */
      elem.msExitFullscreen();
    }
  }, []);

  let iframeWindow: any = null;

  const initPlayer = useCallback((videoId: string) => {
    setPlayer(
      new (window as any).YT.Player(elemId, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          controls: 0,
          fs: 0,
        },
        events: {
          onReady: onPlayerReadyEvent,
          onStateChange: onPlayerStateChangeEvent,
        },
      })
    );
    iframeWindow = player.getIframe().contentWindow;
  }, []);

  const onYouTubeIframeAPIReady = useCallback(() => {
    initPlayer(videoId!);
  }, [initPlayer, videoId]);

  const onPlayerStateChangeEvent = useCallback(
    (event: any) => {
      setPlayerState((prevState) => ({
        ...prevState,
        state: event.data,
      }));
      if (event.data === (window as any).YT.PlayerState.PLAYING && !done) {
        setDone(true);
      }
    },
    [done]
  );

  const onPlayerReadyEvent = useCallback(
    (event: any) => {
      if (onPlayerReady) {
        onPlayerReady(player);
      }
      setPlayerState((prevState) => ({
        ...prevState,
        duration: player.getDuration(),
      }));
    },
    [onPlayerReady, player]
  );

  const isFullScreen = useCallback(() => {
    const ele = document as any;
    return !(ele.fullscreen === false || ele.mozFullScreen === false || ele.webkitIsFullScreen === false || ele.msFullscreenElement === false);
  }, []);

  const handleFullScreen = useCallback(
    (event: any) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isFullScreen()) {
        closeFullscreen();
        if (fullScreen) {
          fullScreen(true);
        }
      }
    },
    [closeFullscreen, fullScreen, isFullScreen]
  );

  const handleMessageEvent = useCallback(
    (event: any) => {
      // Check that the event was sent from the YouTube IFrame.
      if (event.source === iframeWindow) {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info && data.info.currentTime) {
          const time = Math.round(data.info.currentTime * 2) / 2;

          if (time !== lastTimeUpdate) {
            setLastTimeUpdate(time);
            setProgress(time);
            if (markObject[time]) {
              if (onMarkReach) {
                onMarkReach(time);
              }
            }
          }
        }
      }
    },
    [iframeWindow, lastTimeUpdate, markObject, onMarkReach]
  );

  const handleProgressChange = useCallback(
    (value: any) => {
      player.seekTo(value);
    },
    [player]
  );

  useEffect(() => {
    const markObject = marks.reduce((acc: any, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
    setMarkObject(markObject);

    if (!(window as any).YT?.Player) {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      const tag = document.createElement('script');
      tag.type = 'text/javascript';
      tag.async = true;
      tag.defer = true;
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    } else {
      initPlayer(videoId!);
    }

    window.addEventListener('message', handleMessageEvent);
    ['fullscreenchange', 'mozfullscreenchange', 'msfullscreenchange', 'webkitfullscreenchange'].forEach((event) => {
      document.addEventListener(event, handleFullScreen, false);
    });

    return () => {
      window.removeEventListener('message', handleMessageEvent);
      ['fullscreenchange', 'mozfullscreenchange', 'msfullscreenchange', 'webkitfullscreenchange'].forEach((event) => {
        document.removeEventListener(event, handleFullScreen, false);
      });
      player?.destroy();
    };
  }, []);

  return (
    <VideoContainer className="h-full w-full relative">
      <div className="absolute inset-0" id={elemId}></div>
      <ProgressBarContainer className="absolute left-0 right-0 mb-8 px-3">
        {playerState.duration && (
          <Slider
            min={0}
            max={playerState.duration}
            value={progress}
            onChange={(value) => setProgress(value)}
            // Other Slider properties as needed, replace with your custom Slider component if needed
          />
        )}
      </ProgressBarContainer>
      <FullScreenButton
        onClick={() => {
          if (fullScreen) {
            fullScreen(isFullScreen());
          }
        }}
      >
        <FullScreenIcon />
      </FullScreenButton>
    </VideoContainer>
  );
};

export default VideoPlayer;
