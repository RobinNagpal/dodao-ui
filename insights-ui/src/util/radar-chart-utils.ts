import { SpiderGraph } from '@/types/project/project';
import {
  Chart as ChartJS,
  Chart,
  ChartData,
  ChartOptions,
  ChartType,
  Filler,
  Legend,
  LineElement,
  Plugin,
  PointElement,
  RadialLinearScale,
  Tooltip,
  TooltipItem,
  TooltipPositionerFunction,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

export const AlternateRingBackgroundPlugin: Plugin = {
  id: 'alternateRingBackground',
  // Use beforeDatasetsDraw so the filled rings appear behind the data
  beforeDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const radialScale = chart.scales.r as RadialLinearScale;

    const centerX = radialScale.xCenter; // Center X of the chart
    const centerY = radialScale.yCenter; // Center Y of the chart

    const ticks = radialScale.ticks;
    if (!ticks || ticks.length < 2) return;

    // Define two colors (adjust these to your needs)
    const color2 = 'rgba(33, 48, 74, 1)'; // darker grey
    const color1 = 'rgba(100, 100, 100, 1)'; // e.g. light grey

    // Loop through ticks starting at 1. Each ring is drawn between
    // ticks[i-1] and ticks[i].
    for (let i = 1; i < ticks.length; i++) {
      const outerRadius = radialScale.getDistanceFromCenterForValue(ticks[i].value);
      const innerRadius = radialScale.getDistanceFromCenterForValue(ticks[i - 1].value);

      ctx.save();
      ctx.beginPath();
      // Draw outer circle (clockwise)
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      // Draw inner circle (counter-clockwise) to "cut out" the center part
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
      ctx.closePath();

      // Alternate the fill color based on the ring index.
      ctx.fillStyle = i % 2 === 1 ? color1 : color2;
      ctx.fill();
      ctx.restore();
    }

    // Draw radial lines (spokes)
    const labels = chart.data.labels || [];
    const totalLabels = labels.length;

    for (let i = 0; i < totalLabels; i++) {
      const angle = (2 * Math.PI * i) / totalLabels - Math.PI / 2; // Compute angle

      // Calculate endpoint of the line at the outer edge of the chart
      const outerRadius = (radialScale as any).drawingArea;
      const endX = centerX + outerRadius * Math.cos(angle);
      const endY = centerY + outerRadius * Math.sin(angle);

      // Draw the line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color2;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }
  },
};

// Define the return type for the graph color
interface GraphColor {
  background: string;
  border: string;
}

export const getGraphColor = (data: SpiderGraph): GraphColor => {
  const itemKeys = Object.keys(data);

  // Calculate total possible score (total number of entries)
  const totalPossibleScore = itemKeys.reduce((acc, category) => acc + data[category].scores.length, 0);

  // Calculate total obtained score (sum of all 1s)
  const totalObtainedScore = itemKeys.reduce((acc, category) => acc + data[category].scores.reduce((sum, item) => sum + item.score, 0), 0);

  // Compute overall percentage score
  const overallPercentage = (totalObtainedScore / totalPossibleScore) * 100;

  // Determine the dynamic color based on the overall percentage
  if (overallPercentage < 20) {
    return { background: 'rgba(255, 0, 0, 0.7)', border: 'rgba(255, 0, 0, 1)' }; // Red
  } else if (overallPercentage < 50) {
    return { background: 'rgba(255, 165, 0, 0.7)', border: 'rgba(255, 165, 0, 1)' }; // Orange
  } else if (overallPercentage < 80) {
    return { background: 'rgba(255, 206, 0, 0.7)', border: 'rgba(255, 206, 0, 1)' }; // Yellow
  } else {
    return { background: 'rgba(0, 255, 0, 0.7)', border: 'rgba(0, 255, 0, 1)' }; // Green
  }
};

export const HighlightPlugin: Plugin = {
  id: 'highlightSlice',
  afterDatasetsDraw: (chart: Chart<'radar'>) => {
    const { ctx, scales, tooltip } = chart;
    const activeElement = tooltip?.dataPoints?.[0]; // Get the hovered data point

    if (tooltip && tooltip.opacity === 0) {
      return;
    }
    // Clear the chart if no tooltip is active
    if (!activeElement) {
      return;
    }
    const index = activeElement.dataIndex; // Index of the hovered point
    const radialScale = scales.r as RadialLinearScale;

    const centerX = radialScale.xCenter; // Center X of the chart
    const centerY = radialScale.yCenter; // Center Y of the chart
    const outerRadius = (radialScale as any).drawingArea; // Outer radius of the radar chart

    const dataCount = chart.data.labels?.length || 0;
    const prevAngle = (2 * Math.PI * (index - 0.5)) / dataCount - Math.PI / 2;
    const nextAngle = (2 * Math.PI * (index + 0.5)) / dataCount - Math.PI / 2;

    // Draw the pizza slice

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outerRadius, prevAngle, nextAngle);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 200, 200, 0.4)'; // Highlight color
    ctx.fill();
    ctx.restore();
  },
};
