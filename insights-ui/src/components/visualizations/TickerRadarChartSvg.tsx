import RadarChartFrame from '@/components/ui/containers/RadarChartFrame';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { getGraphColor } from '@/util/radar-chart-utils';
import React from 'react';

/**
 * Server-rendered SVG version of the ticker spider/radar chart.
 *
 * The chart.js `RadarChart` is canvas-only, so it renders `ssr: false` on the
 * client: ~260 KB of chart.js is downloaded + ~1.1s is spent evaluating it
 * before anything is painted, and crawlers see an empty box. This component
 * draws the exact same radar as plain SVG on the server instead. That means:
 *   - the drawn chart is part of the initial HTML (indexable, cacheable by
 *     CloudFront + the page cache — no per-visitor render cost),
 *   - zero client JavaScript ships for the chart, and
 *   - hover tooltips + slice highlight are pure CSS (see the <style> block),
 *     so they work before/without hydration.
 *
 * It intentionally mirrors the chart.js look: alternating concentric rings
 * (`AlternateRingBackgroundPlugin`), radial spokes, a smoothed data polygon
 * (`tension: 0.45`), score-banded fill colour (`getGraphColor`), wrapped point
 * labels, and the pizza-slice hover highlight (`HighlightPlugin`). Small visual
 * differences from the canvas version are expected and acceptable.
 */

// Geometry, in viewBox units. The square viewBox scales to fill RadarChartFrame.
const SIZE = 384;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 112; // radius at the outermost ring (axis max)
const LABEL_RADIUS = 128; // where category labels sit, just outside the rings
const LABEL_FONT = 12;
const LABEL_MAX_WIDTH = 66; // ~chart.js "20% of chart width" wrap budget
const SCORE_OFFSET = 0.5; // matches chart.js: give zero-score categories a little reach
const TENSION = 0.45; // matches chart.js lineTension on the data polygon

// Colours copied from radar-chart-utils' AlternateRingBackgroundPlugin.
const RING_LIGHT = 'rgba(100, 100, 100, 1)';
const RING_DARK = 'rgba(33, 48, 74, 1)';
const SPOKE_COLOR = 'rgba(33, 48, 74, 1)';
const LABEL_COLOR = '#d5d5d5';
const HIGHLIGHT_FILL = 'rgba(200, 200, 200, 0.4)';

interface Point {
  x: number;
  y: number;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function polar(radius: number, angle: number): Point {
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Build a closed, smoothed path through the vertices using the same spline
 * construction chart.js uses for `tension` (see Chart.js `splineCurve`): each
 * point's control handles are offset toward its neighbours, weighted by the
 * relative length of the two adjacent segments.
 */
function smoothClosedPath(points: Point[], tension: number): string {
  const n = points.length;
  if (n === 0) return '';
  if (n < 3) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${round(p.x)} ${round(p.y)}`).join(' ') + ' Z';
  }

  const incoming: Point[] = [];
  const outgoing: Point[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];
    const dPrev = distance(prev, curr);
    const dNext = distance(curr, next);
    const total = dPrev + dNext || 1;
    const fa = (tension * dPrev) / total;
    const fb = (tension * dNext) / total;
    incoming.push({ x: curr.x - fa * (next.x - prev.x), y: curr.y - fa * (next.y - prev.y) });
    outgoing.push({ x: curr.x + fb * (next.x - prev.x), y: curr.y + fb * (next.y - prev.y) });
  }

  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const c1 = outgoing[i];
    const c2 = incoming[next];
    const end = points[next];
    d += ` C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(end.x)} ${round(end.y)}`;
  }
  return d + ' Z';
}

/** Full-radius wedge for one category — used as both the hover hit-area and the highlight slice. */
function wedgePath(angle: number, step: number): string {
  const start = polar(OUTER_RADIUS, angle - step / 2);
  const end = polar(OUTER_RADIUS, angle + step / 2);
  return `M ${round(CENTER)} ${round(CENTER)} L ${round(start.x)} ${round(start.y)} A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${round(end.x)} ${round(end.y)} Z`;
}

/** Greedy word-wrap. No canvas to measure text server-side, so approximate char width. */
function wrapLabel(text: string, maxWidth: number, fontSize: number): string[] {
  const charWidth = fontSize * 0.55;
  const maxChars = Math.max(6, Math.floor(maxWidth / charWidth));
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface TickerRadarChartSvgProps {
  data: SpiderGraphForTicker;
  scorePercentage: number;
}

export default function TickerRadarChartSvg({ data, scorePercentage }: TickerRadarChartSvgProps): JSX.Element {
  const keys = Object.keys(data);
  const count = keys.length || 1;
  const step = (2 * Math.PI) / count;

  // Plotted value per category = sum of factor scores; zero → SCORE_OFFSET so
  // the polygon still reaches slightly off-centre, exactly like the canvas chart.
  const rawScores = keys.map((key) => data[key].scores.reduce((acc, s) => acc + s.score, 0));
  const plotted = rawScores.map((value) => (value === 0 ? SCORE_OFFSET : value));
  const axisMax = Math.max(5, Math.ceil(Math.max(0, ...plotted)));

  const color = getGraphColor(scorePercentage);

  const angleAt = (index: number): number => step * index - Math.PI / 2;

  // Alternating concentric bands, painted outer → inner so each smaller disc
  // overlays the larger one, leaving an annulus of each colour.
  const bands = [];
  for (let value = axisMax; value >= 1; value--) {
    bands.push({ r: (value / axisMax) * OUTER_RADIUS, fill: value % 2 === 1 ? RING_LIGHT : RING_DARK });
  }

  const vertices = keys.map((_, index) => polar((plotted[index] / axisMax) * OUTER_RADIUS, angleAt(index)));
  const dataPath = smoothClosedPath(vertices, TENSION);

  return (
    <RadarChartFrame>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%" role="img" aria-label={`Spider chart — overall score ${Math.round(scorePercentage)}%`}>
        {/* Pure-CSS hover: reveal the highlight slice + tooltip while its wedge group is hovered. */}
        <style>{`
          [data-radar-hl] { opacity: 0; transition: opacity 120ms ease; }
          [data-radar-slice]:hover [data-radar-hl] { opacity: 1; }
          [data-radar-tip] { opacity: 0; transition: opacity 120ms ease; }
          [data-radar-slice]:hover [data-radar-tip] { opacity: 1; }
        `}</style>

        {/* Alternating concentric rings */}
        {bands.map((band, index) => (
          <circle key={`band-${index}`} cx={CENTER} cy={CENTER} r={round(band.r)} fill={band.fill} />
        ))}

        {/* Radial spokes */}
        {keys.map((_, index) => {
          const end = polar(OUTER_RADIUS, angleAt(index));
          return <line key={`spoke-${index}`} x1={CENTER} y1={CENTER} x2={round(end.x)} y2={round(end.y)} stroke={SPOKE_COLOR} strokeWidth={3} />;
        })}

        {/* Data polygon */}
        <path d={dataPath} fill={color.background} stroke={color.border} strokeWidth={3} strokeLinejoin="round" />

        {/* Category labels */}
        {keys.map((key, index) => {
          const angle = angleAt(index);
          const pos = polar(LABEL_RADIUS, angle);
          const cos = Math.cos(angle);
          const anchor = Math.abs(cos) < 0.35 ? 'middle' : cos > 0 ? 'start' : 'end';
          const lines = wrapLabel(data[key].name, LABEL_MAX_WIDTH, LABEL_FONT);
          const lineHeight = LABEL_FONT + 1;
          const firstDy = -((lines.length - 1) / 2) * lineHeight;
          return (
            <text
              key={`label-${index}`}
              x={round(pos.x)}
              y={round(pos.y)}
              textAnchor={anchor}
              fontSize={LABEL_FONT}
              fill={LABEL_COLOR}
              dominantBaseline="middle"
            >
              {lines.map((line, lineIndex) => (
                <tspan key={lineIndex} x={round(pos.x)} dy={lineIndex === 0 ? firstDy : lineHeight}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}

        {/* Hover wedges: highlight slice + CSS-only tooltip, one group per category */}
        {keys.map((key, index) => {
          const angle = angleAt(index);
          const wedge = wedgePath(angle, step);
          const pie = data[key];
          const cos = Math.cos(angle);
          const tipW = 176;
          const tipH = 168;
          const anchorPoint = polar(OUTER_RADIUS + 4, angle);
          const tipX = clamp(anchorPoint.x - (cos < -0.35 ? tipW : cos > 0.35 ? 0 : tipW / 2), 4, SIZE - tipW - 4);
          const tipY = clamp(anchorPoint.y - tipH / 2, 4, SIZE - tipH - 4);
          return (
            <g key={`slice-${index}`} data-radar-slice="">
              {/* Highlight pizza-slice (revealed on hover via CSS) */}
              <path d={wedge} fill={HIGHLIGHT_FILL} data-radar-hl="" style={{ pointerEvents: 'none' }} />
              {/* Transparent hit-area that drives the group's :hover */}
              <path d={wedge} fill="transparent" style={{ pointerEvents: 'all' }} />
              {/* CSS-only tooltip */}
              <foreignObject
                x={round(tipX)}
                y={round(tipY)}
                width={tipW}
                height={tipH}
                data-radar-tip=""
                style={{ pointerEvents: 'none', overflow: 'visible' }}
              >
                <div
                  style={{
                    borderRadius: 6,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: '#ffffff',
                    padding: '8px 10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{pie.name}</div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {pie.scores.map((factor, factorIndex) => (
                      <li key={factorIndex} style={{ display: 'flex', gap: 4, fontSize: 11, lineHeight: 1.3, marginBottom: 1 }}>
                        <span>{factor.score === 1 ? '✅' : '❌'}</span>
                        <span>{factor.comment.split(':')[0]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </RadarChartFrame>
  );
}
