// Extend the Chart.js RadialLinearScale to include properties that are used but not part of the default type
export interface ExtendedRadialLinearScale extends RadialLinearScale {
  xCenter: number;
  yCenter: number;
  drawingArea: number;
}

import { SpiderGraph } from '@/types/project/project';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { Chart, Plugin, RadialLinearScale } from 'chart.js';

export const AlternateRingBackgroundPlugin: Plugin = {
  id: 'alternateRingBackground',
  // Use beforeDatasetsDraw so the filled rings appear behind the data
  beforeDatasetsDraw: (chart: Chart, _args, pluginOptions) => {
    const ctx = chart.ctx;
    // Get the radial scale ("r"). Use our extended interface and check if it exists.
    const radialScale = chart.scales.r as ExtendedRadialLinearScale | undefined;
    if (!radialScale) {
      return;
    }

    // Destructure values from the radial scale
    const { xCenter, yCenter, drawingArea, ticks } = radialScale;
    if (!ticks || ticks.length < 2) return;

    // Two colors for alternating background rings + the spoke lines. The dark
    // defaults are the historical hardcoded values; the themed pages pass light
    // equivalents via plugin options when the app is in light mode (canvas
    // can't read the themed CSS variables).
    const color2 = (pluginOptions?.ringEven as string) || 'rgba(33, 48, 74, 1)'; // darker grey
    const color1 = (pluginOptions?.ringOdd as string) || 'rgba(100, 100, 100, 1)'; // lighter grey
    const spokeColor = (pluginOptions?.spoke as string) || color2;

    // Draw concentric rings between each tick
    for (let i = 1; i < ticks.length; i++) {
      const outerRadius = radialScale.getDistanceFromCenterForValue(ticks[i].value);
      const innerRadius = radialScale.getDistanceFromCenterForValue(ticks[i - 1].value);

      ctx.save();
      ctx.beginPath();
      // Draw outer circle (clockwise)
      ctx.arc(xCenter, yCenter, outerRadius, 0, Math.PI * 2);
      // Draw inner circle (counter-clockwise) to "cut out" the center part
      ctx.arc(xCenter, yCenter, innerRadius, 0, Math.PI * 2, true);
      ctx.closePath();

      // Alternate fill colors between the rings
      ctx.fillStyle = i % 2 === 1 ? color1 : color2;
      ctx.fill();
      ctx.restore();
    }

    // Draw radial lines (spokes) if labels exist
    const labels = chart.data.labels || [];
    const totalLabels = labels.length;
    if (!totalLabels || typeof drawingArea !== 'number') return;
    for (let i = 0; i < totalLabels; i++) {
      const angle = (2 * Math.PI * i) / totalLabels - Math.PI / 2; // Compute angle from the vertical
      const endX = xCenter + drawingArea * Math.cos(angle);
      const endY = yCenter + drawingArea * Math.sin(angle);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xCenter, yCenter);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = spokeColor;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }
  },
};

interface GraphColor {
  lighterBackground: string;
  background: string;
  border: string;
}

const THRESHOLDS = [
  { min: 0, max: 20, color: { lighterBackground: 'rgba(255, 0, 0, 0.3)', background: 'rgba(255, 0, 0, 0.7)', border: 'rgba(255, 0, 0, 1)' } }, // red
  { min: 20, max: 50, color: { lighterBackground: 'rgba(255, 165, 0, 0.3)', background: 'rgba(255, 165, 0, 0.7)', border: 'rgba(255, 165, 0, 1)' } }, // orange
  { min: 50, max: 80, color: { lighterBackground: 'rgba(255, 240, 0, 0.3)', background: 'rgba(255, 240, 0, 0.7)', border: 'rgba(255, 240, 0, 1)' } }, // yellow
  { min: 80, max: 100, color: { lighterBackground: 'rgba(0, 255, 0, 0.3)', background: 'rgba(0, 255, 0, 0.7)', border: 'rgba(0, 255, 0, 1)' } }, // green
] as const;

export const getSpiderGraphScorePercentage = (data: SpiderGraph | SpiderGraphForTicker): number => {
  const itemKeys = Object.keys(data);

  // Calculate the total possible score (each item's scores array length)
  const totalPossibleScore = itemKeys.reduce((acc: number, category: string) => acc + (data[category].scores?.length || 0), 0);

  // Calculate the sum of obtained scores
  const totalObtainedScore = itemKeys.reduce(
    (acc: number, category: string) => acc + data[category].scores.reduce((sum: number, item) => sum + item.score, 0),
    0
  );

  // Compute overall percentage score
  return (totalObtainedScore / totalPossibleScore) * 100;
};

export function getGraphColor(percentage: number): GraphColor {
  const band = THRESHOLDS.find((t) => percentage >= t.min && percentage < t.max) ?? THRESHOLDS[THRESHOLDS.length - 1];
  return band.color;
}

export function getLegendItems() {
  return THRESHOLDS.map(({ min, max, color }) => ({
    label: `${min}% – ${max}%`,
    style: {
      backgroundColor: color.background,
      border: `2px solid ${color.border}`,
    },
  }));
}

export const HighlightPlugin: Plugin = {
  id: 'highlightSlice',
  afterDatasetsDraw: (chart: Chart<'radar'>, _args, pluginOptions) => {
    const { ctx, scales, tooltip } = chart;
    if (!tooltip || tooltip.opacity === 0) return;
    const activeElement = tooltip.dataPoints?.[0];
    if (!activeElement) return;

    const index = activeElement.dataIndex;
    const radialScale = scales.r as ExtendedRadialLinearScale | undefined;
    if (!radialScale) return;

    const { xCenter, yCenter, drawingArea } = radialScale;
    if (typeof drawingArea !== 'number') return;

    const dataCount = chart.data.labels?.length || 0;
    if (dataCount === 0) return;
    const prevAngle = (2 * Math.PI * (index - 0.5)) / dataCount - Math.PI / 2;
    const nextAngle = (2 * Math.PI * (index + 0.5)) / dataCount - Math.PI / 2;

    // Draw the highlighted (pizza-slice) area for the hovered data point
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xCenter, yCenter);
    ctx.arc(xCenter, yCenter, drawingArea, prevAngle, nextAngle);
    ctx.lineTo(xCenter, yCenter);
    ctx.closePath();
    // Light-grey default (dark theme); light mode passes a dark tint instead
    // since a light-grey highlight vanishes on the light rings.
    ctx.fillStyle = (pluginOptions?.color as string) || 'rgba(200, 200, 200, 0.4)';
    ctx.fill();
    ctx.restore();
  },
};
