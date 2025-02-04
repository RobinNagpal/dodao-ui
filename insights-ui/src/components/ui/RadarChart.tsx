'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TooltipItem,
  Chart,
  ChartArea,
  ChartComponent,
  Plugin,
  TooltipPositionerFunction,
  ChartType,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { SpiderGraph } from '@/types/project/project';

// Register necessary Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
const AlternateRingBackgroundPlugin: Plugin = {
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
    const color1 = 'rgba(255, 255, 255, 0)'; // transparent (or any color)
    const color2 = 'rgba(200, 200, 200, 0.2)'; // e.g. light grey

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
  },
};

// Register the alternate background plugin
ChartJS.register(AlternateRingBackgroundPlugin);

interface RadarChartProps {
  data: SpiderGraph;
}
declare module 'chart.js' {
  interface TooltipPositionerMap {
    myCustomPositioner: TooltipPositionerFunction<ChartType>;
  }
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const labels = Object.keys(data);
  const scores = labels.map((category) => data[category].reduce((acc, item) => acc + item.score, 0));

  Tooltip.positioners.myCustomPositioner = function (tooltipItems, eventPosition) {
    // A reference to the tooltip model
    const tooltip = this;

    if (!tooltipItems.length) {
      return eventPosition;
    }
    // Use the first active tooltip item for positioning
    const firstItem = tooltipItems[0];
    const chart = this.chart;
    const radialScale = chart.scales.r as RadialLinearScale;

    const centerX = radialScale.xCenter; // Center X of the chart
    const centerY = radialScale.yCenter; // Center Y of the chart
    const total = chart.data.labels?.length || 0;
    const index = firstItem.index;
    // Compute the angle for the hovered label (start at -90°)
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    // Use the drawing area as the outer radius and add a margin for the tooltip
    const outerRadius = (radialScale as any).drawingArea;
    const margin = 550; // adjust this value to your liking
    const x = centerX + (outerRadius + margin) * Math.cos(angle);
    const y = centerY + (outerRadius + margin) * Math.sin(angle);
    return { x, y };
  };

  // Convert data into the required format
  const chartData: ChartData<'radar'> = {
    labels: labels,
    datasets: [
      {
        data: scores,
        backgroundColor: 'rgba(54, 162, 235, 0.7)', // Light blue fill
        borderColor: 'rgba(54, 162, 235, 1)', // Darker blue border
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
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index; // Get the clicked index
        const targetLabel = labels[index]; // Get the corresponding label
        const targetElement = document.getElementById(targetLabel); // Find the section by id
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Smooth scroll to the section
        }
      }
    },
    scales: {
      r: {
        angleLines: { display: false }, // Hide angle lines for a clean look
        suggestedMin: 0,
        suggestedMax: 5,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
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
          title: (tooltipItems: TooltipItem<'radar'>[]) => tooltipItems[0].label.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()),
          label: () => '', // Skip label
          afterBody: (tooltipItems: TooltipItem<'radar'>[]) => {
            const categoryData = data[tooltipItems[0].label]; // Match category
            return `${'a sentence over here a sentence over here a sentence over here'}`;
          },
          footer: (tooltipItems: TooltipItem<'radar'>[]) => {
            const categoryData = data[tooltipItems[0].label];
            const totalChecks = categoryData.length;
            const totalOnes = categoryData.filter((item) => item.score === 1).length;
            const analysisChecks = categoryData.map((item) => (item.score === 1 ? '✅' : '❌')).join('');
            return `\nAnalysis Checks ${totalOnes}/${totalChecks}\n${analysisChecks}`;
          },
        },
      },
    },
    onHover: (event, chartElements) => {
      const canvas = event.native?.target as HTMLCanvasElement; // Get the canvas element
      canvas.style.cursor = chartElements.length ? 'pointer' : 'default';
    },
  };

  const HighlightPlugin: Plugin = {
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
      ctx.fillStyle = 'rgba(255, 206, 86, 0.3)'; // Highlight color
      ctx.fill();
      ctx.restore();
    },
  };

  ChartJS.register(HighlightPlugin);

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;
