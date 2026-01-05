import type { CalculateMetadataFunction } from "remotion";
import { staticFile } from "remotion";
import { parseMedia } from "@remotion/media-parser";
import type { Slide } from "./slides";

export const calculateDeckMetadata: CalculateMetadataFunction<{
  slides: Slide[];
  durationsInFrames: number[];
}> = async ({ props }) => {
  const fps = 30;
  const paddingFrames = 5; // tiny buffer at the end of each slide

  const durationsInFrames = await Promise.all(
    props.slides.map(async (s) => {
      const audioSrc = staticFile(`audio/${s.id}.mp3`);
      const { durationInSeconds } = await parseMedia({
        src: audioSrc,
        fields: { durationInSeconds: true },
      });

      const secs = durationInSeconds ?? 0;
      return Math.max(1, Math.ceil(secs * fps) + paddingFrames);
    }),
  );

  const durationInFrames = durationsInFrames.reduce((a, b) => a + b, 0);

  return {
    fps,
    width: 1920,
    height: 1080,
    durationInFrames,
    props: { ...props, durationsInFrames },
  };
};
