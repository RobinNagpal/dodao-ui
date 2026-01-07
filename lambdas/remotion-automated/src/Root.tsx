import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";
import { Deck } from "./Deck";
import { SingleSlide } from "./SingleSlide";
import { ConcatenatedVideo, ConcatenatedVideoProps } from "./ConcatenatedVideo";
import { SLIDES } from "./slides";
import { calculateDeckMetadata } from "./deck-metadata";
import type { Slide } from "./slides";

// Props type for SingleSlide composition
type SingleSlideProps = {
  slide: Slide;
  audioUrl?: string;
  durationInFrames?: number; // Dynamic duration passed from API
};

// Calculate metadata for SingleSlide - uses durationInFrames from props
const calculateSingleSlideMetadata: CalculateMetadataFunction<SingleSlideProps> = ({ props }) => {
  return {
    // Use the durationInFrames from props if provided, otherwise default to 30 (1 second)
    durationInFrames: props.durationInFrames ?? 30,
    props,
  };
};

// Calculate metadata for ConcatenatedVideo
const calculateConcatenatedMetadata: CalculateMetadataFunction<ConcatenatedVideoProps> = ({ props }) => {
  const totalDuration = props.videos.reduce((sum, v) => sum + v.durationInFrames, 0);
  return {
    durationInFrames: totalDuration,
    props,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Full deck composition (original) */}
      <Composition
        id="HtmlDeck"
        component={Deck}
        durationInFrames={1} // overridden by calculateMetadata
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          slides: SLIDES,
          durationsInFrames: SLIDES.map(() => 30),
        }}
        calculateMetadata={calculateDeckMetadata}
      />

      {/* Single slide composition (for API usage) */}
      <Composition<SingleSlideProps>
        id="SingleSlide"
        component={SingleSlide}
        durationInFrames={30} // Default, will be overridden by calculateMetadata
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          slide: SLIDES[0], // Default slide
          audioUrl: undefined,
          durationInFrames: 30, // Default duration
        }}
        calculateMetadata={calculateSingleSlideMetadata}
      />

      {/* Concatenated video composition */}
      <Composition<ConcatenatedVideoProps>
        id="ConcatenatedVideo"
        component={ConcatenatedVideo}
        durationInFrames={30} // Will be overridden by calculateMetadata
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videos: [],
        }}
        calculateMetadata={calculateConcatenatedMetadata}
      />
    </>
  );
};
