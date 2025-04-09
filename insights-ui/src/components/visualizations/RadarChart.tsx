'use client';

import { SpiderGraph } from '@/types/project/project';
import { SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { AlternateRingBackgroundPlugin, ExtendedRadialLinearScale, getGraphColor, HighlightPlugin } from '@/util/radar-chart-utils';
import { getReportKey, getReportName } from '@/util/report-utils';
import {
  Chart,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  ChartType,
  Filler,
  Legend,
  LineElement,
  Point,
  PointElement,
  RadialLinearScale,
  Tooltip,
  TooltipItem,
  TooltipPositionerFunction,
} from 'chart.js';
import { ActiveElement, TooltipPosition } from 'chart.js';
import React from 'react';
import { Radar } from 'react-chartjs-2';

// Register necessary Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Register the alternate circles and spokes plugin
ChartJS.register(AlternateRingBackgroundPlugin);

interface RadarChartProps {
  data: SpiderGraph | SpiderGraphForTicker;
}

declare module 'chart.js' {
  interface TooltipPositionerMap {
    myCustomPositioner: TooltipPositionerFunction<ChartType>;
  }
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const itemKeys = Object.keys(data);
  const SCORE_OFFSET = 0.5; // Adds padding ONLY for zero scores

  const scores: number[] = itemKeys.map((category) => {
    const rawScore = data[category].scores.reduce((acc, item) => acc + item.score, 0);
    return rawScore === 0 ? SCORE_OFFSET : rawScore; // Apply offset ONLY if score is 0
  });

  // Define a custom tooltip positioner to show tooltips outside the radar chart.
  Tooltip.positioners.myCustomPositioner = function (tooltipItems: readonly ActiveElement[], eventPosition: Point): TooltipPosition | false {
    if (!tooltipItems.length) {
      return eventPosition;
    }
    const firstItem = tooltipItems[0];
    const chart = this.chart as Chart<'radar'>;
    const radialScale = chart.scales.r as ExtendedRadialLinearScale | undefined;
    if (!radialScale) {
      return eventPosition;
    }
    const { xCenter, yCenter, drawingArea } = radialScale;
    const total = chart.data.labels?.length || 0;
    if (total === 0) return eventPosition;
    const index = firstItem.index;
    // Compute the angle for the tooltip position (starting at -90°)
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    const margin = 600; // Adjust margin as needed
    const x = xCenter + (drawingArea + margin) * Math.cos(angle);
    const y = yCenter + (drawingArea + margin) * Math.sin(angle);
    return { x, y };
  };

  // get graph color based on the overall score percentage
  const graphColor = getGraphColor(data);

  // Convert data into the required format
  const chartData: ChartData<'radar'> = {
    labels: itemKeys.map((itemKey) => data[itemKey].name),
    datasets: [
      {
        data: scores,
        backgroundColor: graphColor.background,
        borderColor: graphColor.border,
        borderWidth: 2,
        tension: 0.45,
        pointRadius: 0, // Remove dots (data points)
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    elements: {
      line: {
        borderWidth: 3,
      },
    },
    responsive: true,
    scales: {
      r: {
        angleLines: { display: false }, // Hide angle lines for a clean look
        suggestedMin: 0,
        suggestedMax: 5,
        pointLabels: {
          font: {
            size: 14,
            // weight : 'bold',
          },
          color: '#ffffff',
        },
        ticks: {
          display: false,
          stepSize: 1,
        },
        grid: {
          circular: true,
        },
      },
    },
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Hide main legend
      },
      tooltip: {
        enabled: true, // Enable tooltips
        intersect: false, // Tooltip shows as soon as you enter a section
        backgroundColor: 'rgba(0, 0, 0, 1)',
        titleFont: { size: 18 },
        bodyFont: { size: 14 },
        footerFont: { size: 14 },
        padding: 15,
        position: 'myCustomPositioner',
        caretSize: 0,
        callbacks: {
          title: (tooltipItems: TooltipItem<'radar'>[]) => getReportName(tooltipItems[0].label),
          label: () => '', // Skip label
          afterBody: (tooltipItems: TooltipItem<'radar'>[]) => {
            const categoryKey = getReportKey(tooltipItems[0].label);
            if (!categoryKey || !data[categoryKey]) {
              return 'No data available';
            }
            const summary = data[categoryKey].summary;
            return summary.replace(/(.{1,50})(\s|$)/g, '$1\n');
          },
          footer: (tooltipItems: TooltipItem<'radar'>[]) => {
            const categoryKey = getReportKey(tooltipItems[0].label);
            if (!categoryKey || !data[categoryKey]) {
              return 'No data available';
            }
            const categoryData = data[categoryKey].scores;
            const totalChecks = categoryData.length;
            const totalOnes = categoryData.filter((item) => item.score === 1).length;
            const analysisChecks = categoryData.map((item) => (item.score === 1 ? '✅' : '❌')).join('');
            return `Analysis Checks ${totalOnes}/${totalChecks}\n${analysisChecks}`;
          },
        },
      },
    },
    onHover: (event, chartElements) => {
      const canvas = event.native?.target as HTMLCanvasElement; // Get the canvas element
      canvas.style.cursor = chartElements.length ? 'pointer' : 'default';
    },
  };

  ChartJS.register(HighlightPlugin);

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;
