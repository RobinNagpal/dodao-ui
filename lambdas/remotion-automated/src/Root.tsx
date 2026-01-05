import React from "react";
import { Composition } from "remotion";
import { Deck } from "./Deck";
import { SingleSlide } from "./SingleSlide";
import { SLIDES } from "./slides";
import { calculateDeckMetadata } from "./deck-metadata";
import type { Slide } from "./slides";

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
      <Composition<{ slide: Slide; audioUrl?: string }>
        id="SingleSlide"
        component={SingleSlide}
        durationInFrames={30} // Will be overridden based on audio duration
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          slide: SLIDES[0], // Default slide
          audioUrl: undefined,
        }}
      />
    </>
  );
};
