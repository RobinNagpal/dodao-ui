import React from "react";
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import type { Slide } from "./slides";
import { SlideView } from "./SlideView";

export const Deck: React.FC<{
  slides: Slide[];
  durationsInFrames: number[];
}> = ({ slides, durationsInFrames }) => {
  return (
    <AbsoluteFill>
      <Series>
        {slides.map((slide, i) => (
          <Series.Sequence
            key={slide.id}
            durationInFrames={durationsInFrames[i] ?? 30}
          >
            <SlideView slide={slide} index={i} total={slides.length} />
            <Audio src={staticFile(`audio/${slide.id}.mp3`)} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
