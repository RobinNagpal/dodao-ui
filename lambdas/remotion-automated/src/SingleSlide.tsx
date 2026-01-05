// Single Slide Composition for rendering individual slides
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import type { Slide } from "./slides";
import { SlideView } from "./SlideView";

export const SingleSlide: React.FC<{
  slide: Slide;
  audioUrl?: string; // Can be relative path like "audio/001.mp3" or URL
}> = ({ slide, audioUrl }) => {
  // If audioUrl is a relative path (from public folder), use staticFile
  // If it's a full URL (http:// or https://), use it directly
  const audioSrc = audioUrl
    ? audioUrl.startsWith("http://") || audioUrl.startsWith("https://")
      ? audioUrl
      : staticFile(audioUrl)
    : undefined;

  return (
    <AbsoluteFill>
      <SlideView slide={slide} index={0} total={1} />
      {audioSrc && <Audio src={audioSrc} />}
    </AbsoluteFill>
  );
};

