import React, { ReactElement, useEffect, useState } from 'react';
import Script from 'react-load-script';

interface YouTubePlayerProps {
  allowFullScreen?: boolean;
  autoplay?: string;
  className?: string;
  controls?: string;
  height?: string;
  id: string;
  onEnd?: (player: YT.Player) => void;
  onPause?: (player: YT.Player) => void;
  onPlay?: (player: YT.Player) => void;
  onReady?: (player: YT.Player) => void;
  videoId: string;
  width?: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Light wrapper component to utilize YouTube's Player API for iframe embeds.
 * Reference: https://developers.google.com/youtube/iframe_api_reference
 */
function YouTubePlayer(props: YouTubePlayerProps): ReactElement {
  const [isYouTubeApiLoaded, setIsYouTubeApiLoaded] = useState(
    !!window.YT?.Player,
  );
  const [isIFrameLoaded, setIsIFrameLoaded] = useState(false);

  useEffect(() => {
    const onLoaded = () => {
      delete window.onYouTubeIframeAPIReady;
    };

    const oldHandler = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeApiLoaded(true);
      oldHandler?.();
      onLoaded();
    };

    return () => {
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  useEffect(() => {
    if (isYouTubeApiLoaded && isIFrameLoaded) initializeYouTubePlayer();
  }, [isYouTubeApiLoaded, isIFrameLoaded]);

  const onIFrameLoaded = () => {
    setIsIFrameLoaded(true);
  };

  const initializeYouTubePlayer = () => {
    new YT.Player(props.id, {
      playerVars: {
        autoplay: props.autoplay ? +props.autoplay : 0,
        controls: props.controls ? +props.controls : 1,
      },
      events: {
        onReady: event => {
          props.onReady?.(event.target);
        },
        onStateChange: event => {
          switch (event.data) {
            case YT.PlayerState.PLAYING:
              props.onPlay?.(event.target);
              break;
            case YT.PlayerState.PAUSED:
              props.onPause?.(event.target);
              break;
            case YT.PlayerState.ENDED:
              props.onEnd?.(event.target);
              break;
          }
        },
      },
    });
  };

  const windowUrl = new URL(window.location.href);
  const youtubeUrl = new URL(`https://www.youtube.com/embed/${props.videoId}`);
  youtubeUrl.searchParams.set('enablejsapi', '1');
  youtubeUrl.searchParams.set('rel', '0');
  youtubeUrl.searchParams.set('origin', windowUrl.origin);
  youtubeUrl.searchParams.set('controls', props.controls ?? '1');
  youtubeUrl.searchParams.set('autoplay', props.autoplay ?? '0');

  return (
    <>
      <Script url="https://www.youtube.com/iframe_api" />
      <iframe
        allowFullScreen={props.allowFullScreen !== false}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        className={props.className}
        height={props.height}
        id={props.id}
        frameBorder="0"
        onLoad={onIFrameLoaded}
        src={youtubeUrl.toString()}
        width={props.width}
      />
    </>
  );
}

export default function (props: YouTubePlayerProps): ReactElement | null {
  if (!process.browser) return null;
  return <YouTubePlayer {...props} />;
}
