import React, { useMemo } from "react";
import { Img, staticFile } from "remotion";
import type {
  Slide,
  TitleSlide,
  BulletSlide,
  ParagraphSlide,
  ImageSlide,
} from "./slides";

// Theme colors
const COLORS = {
  background: "#202938",
  text: "#ffffff",
  accent: "#93a1ff",
};

// Dot pattern decoration component - memoized for performance
const DotPattern: React.FC = React.memo(() => {
  const dots = useMemo(() => {
    const dotsArray: React.ReactNode[] = [];
    const rows = 6;
    const cols = 8;
    const spacing = 14;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Create a diagonal pattern (more dots toward top-right)
        if (col >= rows - row - 1) {
          dotsArray.push(
            <circle
              key={`${row}-${col}`}
              cx={col * spacing}
              cy={row * spacing}
              r={3}
              fill={COLORS.accent}
              opacity={0.8}
            />
          );
        }
      }
    }
    return dotsArray;
  }, []);

  return (
    <svg
      style={{
        position: "absolute",
        top: 50,
        right: 80,
        width: 8 * 14, // cols * spacing
        height: 6 * 14, // rows * spacing
      }}
    >
      {dots}
    </svg>
  );
});

// Helper to render text with accent highlighting - optimized with useMemo
const renderTextWithAccent = (
  text: string,
  accent?: string,
  isUnderline?: boolean
): React.ReactNode => {
  return useMemo(() => {
    if (!accent || !text.includes(accent)) {
      return text;
    }

    const parts = text.split(accent);
    return (
      <>
        {parts[0]}
        <span
          style={{
            color: COLORS.accent,
            textDecoration: isUnderline ? "underline" : "none",
            textUnderlineOffset: isUnderline ? "4px" : undefined,
          }}
        >
          {accent}
        </span>
        {parts.slice(1).join(accent)}
      </>
    );
  }, [text, accent, isUnderline]);
};

// Title Slide Component - memoized for performance
const TitleSlideView: React.FC<{ slide: TitleSlide }> = React.memo(({ slide }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Background image */}
      <Img
        src={staticFile("bg-first.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {/* Main title with accent "G" */}
        <h1
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
            fontStyle: "bold",
          }}
        >
          {slide.title.includes("Gains") ? (
            <>
              Koala<span style={{ color: COLORS.accent }}>G</span>ains
            </>
          ) : (
            slide.title
          )}
        </h1>

        {/* Subtitle */}
        {slide.subtitle && (
          <p
            style={{
              fontSize: 42,
              fontWeight: 500,
              color: COLORS.text,
              marginTop: 30,
              opacity: 0.95,
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
});

// Bullet Slide Component - memoized for performance
const BulletSlideView: React.FC<{ slide: BulletSlide }> = React.memo(({ slide }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "60px 80px",
        boxSizing: "border-box",
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily: "Poppins, sans-serif",
        position: "relative",
      }}
    >
      <DotPattern />

      {/* Title */}
      <h1
        style={{
          fontSize: 48,
          fontWeight: 700,
          margin: 0,
          marginBottom: 40,
        }}
      >
        {renderTextWithAccent(slide.title, slide.titleAccent)}
      </h1>

      {/* Bullets */}
      <ul
        style={{
          margin: 0,
          paddingLeft: 30,
          fontSize: 30,
          lineHeight: 1.6,
          maxWidth: "95%",
        }}
      >
        {slide.bullets.map((bullet, i) => (
          <li
            key={i}
            style={{
              marginBottom: 28,
              paddingLeft: 10,
            }}
          >
            {renderTextWithAccent(
              bullet,
              slide.bulletAccents?.[i],
              false
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});

// Paragraph Slide Component - memoized for performance
const ParagraphSlideView: React.FC<{ slide: ParagraphSlide }> = React.memo(({ slide }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "60px 80px",
        boxSizing: "border-box",
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily: "Poppins, sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DotPattern />

      {/* Title */}
      <h1
        style={{
          fontSize: 48,
          fontWeight: 700,
          margin: 0,
          marginBottom: 50,
        }}
      >
        {slide.titleAccent ? (
          <>
            {slide.title.split(slide.titleAccent)[0]}
            <span style={{ color: COLORS.accent }}> {slide.titleAccent}</span>
          </>
        ) : (
          slide.title
        )}
      </h1>

      {/* Paragraphs */}
      <div style={{ flex: 1 }}>
        {slide.paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              fontSize: 38,
              lineHeight: 1.5,
              marginBottom: 50,
              maxWidth: "90%",
            }}
          >
            {renderTextWithAccent(
              para,
              slide.paragraphAccents?.[i],
              true // underline for paragraph accents
            )}
          </p>
        ))}
      </div>

      {/* Footer */}
      {slide.footer && (
        <p
          style={{
            fontSize: 24,
            opacity: 0.8,
            marginTop: "auto",
          }}
        >
          {slide.footer}
        </p>
      )}
    </div>
  );
});

// Image Slide Component - memoized for performance
const ImageSlideView: React.FC<{ slide: ImageSlide }> = React.memo(({ slide }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "60px 80px",
        boxSizing: "border-box",
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily: "Poppins, sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <DotPattern />

      {/* Left content */}
      <div style={{ flex: 1, paddingRight: 60 }}>
        {/* Title */}
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            margin: 0,
            marginBottom: 40,
          }}
        >
          {renderTextWithAccent(slide.title, slide.titleAccent)}
        </h1>

        {/* Bullets */}
        <ul
          style={{
            margin: 0,
            paddingLeft: 30,
            fontSize: 28,
            lineHeight: 1.6,
          }}
        >
          {slide.bullets.map((bullet, i) => (
            <li
              key={i}
              style={{
                marginBottom: 24,
                paddingLeft: 10,
              }}
            >
              {renderTextWithAccent(
                bullet,
                slide.bulletAccents?.[i],
                false
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Right image */}
      <div
        style={{
          width: "45%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={slide.imageUrl}
          style={{
            maxWidth: "100%",
            maxHeight: "80%",
            objectFit: "contain",
            borderRadius: 12,
          }}
        />
      </div>
    </div>
  );
});

// Main SlideView component - memoized for performance
export const SlideView: React.FC<{
  slide: Slide;
  index: number;
  total: number;
}> = React.memo(({ slide, index, total }) => {
  switch (slide.type) {
    case "title":
      return <TitleSlideView slide={slide} />;
    case "bullets":
      return <BulletSlideView slide={slide} />;
    case "paragraphs":
      return <ParagraphSlideView slide={slide} />;
    case "image":
      return <ImageSlideView slide={slide} />;
    default:
      return null;
  }
});
