// Composition for concatenating multiple videos
import { Sequence, Video, staticFile } from "remotion";
import { useMemo } from "react";

export interface ConcatenatedVideoProps {
  videos: Array<{
    url: string;
    durationInFrames: number;
  }>;
}

export const ConcatenatedVideo: React.FC<ConcatenatedVideoProps> = ({ videos }) => {
  const sequences = useMemo(() => {
    let currentFrame = 0;
    return videos.map((video, index) => {
      const sequenceStart = currentFrame;
      currentFrame += video.durationInFrames;

      return {
        from: sequenceStart,
        durationInFrames: video.durationInFrames,
        url: video.url,
        key: index,
      };
    });
  }, [videos]);

  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: "#000" }}>
      {sequences.map((seq) => (
        <Sequence key={seq.key} from={seq.from} durationInFrames={seq.durationInFrames}>
          <Video src={seq.url} style={{ width: "100%", height: "100%" }} startFrom={0} />
        </Sequence>
      ))}
    </div>
  );
};
