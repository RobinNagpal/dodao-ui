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
  scorePercentage: number;
}

declare module 'chart.js' {
  interface TooltipPositionerMap {
    myCustomPositioner: TooltipPositionerFunction<ChartType>;
  }
}

const RadarChart: React.FC<RadarChartProps> = ({ data, scorePercentage }) => {
  console.log('RadarChart data:', data);
  const itemKeys = Object.keys(data);
  const SCORE_OFFSET = 0.5; // Adds padding ONLY for zero scores

  const scores: number[] = itemKeys.map((category) => {
    const rawScore = data[category].scores.reduce((acc, item) => acc + item.score, 0);
    return rawScore === 0 ? SCORE_OFFSET : rawScore;
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

  // Get dynamic color based on the overall score percentage
  const graphColor = getGraphColor(scorePercentage);

  // Convert data into the required format for the radar chart
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
          // Use a custom callback to wrap the text if it takes more than 20% of the chart's width
          font: { size: 14 },
          color: '#d5d5d5',
          callback: function (value: string): string | string[] {
            // 'this' is bound to the radial scale (ExtendedRadialLinearScale)
            const scale = this as ExtendedRadialLinearScale;
            const ctx = scale.ctx;
            if (!ctx) return value;
            // Get the chart width and compute maximum allowed width for the label
            const chartWidth = scale.chart.width;
            const maxWidth = chartWidth * 0.2; // 20% of the chart width

            // Split the label into words so we can measure and wrap them appropriately
            const words = value.split(' ');
            let line = '';
            const lines: string[] = [];
            for (let word of words) {
              const testLine = line ? line + ' ' + word : word;
              const measure = ctx.measureText(testLine).width;
              if (measure > maxWidth && line !== '') {
                lines.push(line);
                line = word;
              } else {
                line = testLine;
              }
            }
            lines.push(line);
            return lines;
          },
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
        enabled: true,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        titleFont: { size: 18, weight: 'bold' },
        bodyFont: { size: 14, weight: 'normal' },
        footerFont: { size: 14, weight: 'normal' },
        padding: 10,
        position: 'myCustomPositioner',
        caretSize: 0,
        callbacks: {
          title: (tooltipItems: TooltipItem<'radar'>[]) => {
            const label = tooltipItems[0].label;
            // Try to find the data directly by the label first
            let categoryKey = Object.keys(data).find((key) => data[key].name === label);
            if (!categoryKey) {
              categoryKey = getReportKey(label);
            }
            return data[categoryKey]?.name || label;
          },
          label: () => '', // Skip label
          afterBody: (tooltipItems: TooltipItem<'radar'>[]) => {
            const label = tooltipItems[0].label;
            // Try to find the data directly by the label first
            let categoryKey = Object.keys(data).find((key) => data[key].name === label);
            if (!categoryKey) {
              categoryKey = getReportKey(label);
            }
            if (!categoryKey || !data[categoryKey]) {
              return 'No data available';
            }

            // Check if this is V1 data (has V1 category keys) - if so, skip showing summary
            const isV1Data = Object.keys(data).some((key) =>
              ['BusinessAndMoat', 'FinancialStatementAnalysis', 'PastPerformance', 'FutureGrowth', 'FairValue'].includes(key)
            );

            if (isV1Data) {
              return ''; // Don't show summary for V1 data
            }

            const summary = data[categoryKey].summary;
            return summary.replace(/(.{1,50})(\s|$)/g, '$1\n');
          },
          footer: (tooltipItems: TooltipItem<'radar'>[]) => {
            const label = tooltipItems[0].label;
            // Try to find the data directly by the label first
            let categoryKey = Object.keys(data).find((key) => data[key].name === label);
            if (!categoryKey) {
              categoryKey = getReportKey(label);
            }
            if (!categoryKey || !data[categoryKey]) {
              return 'No data available';
            }
            const categoryData = data[categoryKey].scores;
            const totalChecks = categoryData.length;
            const totalOnes = categoryData.filter((item) => item.score === 1).length;

            // Check if this is V1 data (has V1 category keys)
            const isV1Data = Object.keys(data).some((key) =>
              ['BusinessAndMoat', 'FinancialStatementAnalysis', 'PastPerformance', 'FutureGrowth', 'FairValue'].includes(key)
            );

            if (isV1Data) {
              // For V1 data, show detailed factor breakdown in footer (normal text)
              const factorDetails = categoryData
                .map((item) => {
                  const icon = item.score === 1 ? '✅' : '❌';
                  // Extract factor name from comment (before the colon)
                  const factorName = item.comment.split(':')[0] || 'Unknown Factor';
                  return `${icon} ${factorName}`;
                })
                .join('\n');
              return factorDetails;
            } else {
              // For original data, show the compact version
              const analysisChecks = categoryData.map((item) => (item.score === 1 ? '✅' : '❌')).join('');
              return `Analysis Checks ${totalOnes}/${totalChecks}\n${analysisChecks}`;
            }
          },
        },
      },
    },
    onHover: (event, chartElements) => {
      const canvas = event.native?.target as HTMLCanvasElement;
      canvas.style.cursor = chartElements.length ? 'pointer' : 'default';
    },
  };

  ChartJS.register(HighlightPlugin);

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;
