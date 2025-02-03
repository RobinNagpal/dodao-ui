'use client';

import React from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register necessary Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Define the expected data structure
interface EvaluationData {
  productInnovation: { score: number };
  marketOpportunity: { score: number };
  teamStrength: { score: number };
  financialHealth: { score: number };
  businessModel: { score: number };
}

interface RadarChartProps {
  data: EvaluationData;
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  // Convert data into the required format
  const chartData: ChartData<'radar'> = {
    labels: ['Product Innovation', 'Market Opportunity', 'Team Strength', 'Financial Health', 'Business Model'],
    datasets: [
      {
        data: [data.productInnovation.score, data.marketOpportunity.score, data.teamStrength.score, data.financialHealth.score, data.businessModel.score],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light blue fill
        borderColor: 'rgba(54, 162, 235, 1)', // Darker blue border
        borderWidth: 2,
        tension: 0.5,
        pointRadius: 0, // Remove dots (data points)
        pointHoverRadius: 0, // Remove hover effect on points
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
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        ticks: {
          display: false,
          stepSize: 1,
        },
        grid: {
          circular: true, // Keep the grid circular
        },
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    plugins: {
      legend: {
        display: false, // Hide main legend
      },
      tooltip: {
        enabled: true, // Enable tooltips
        callbacks: {
          title: (tooltipItems: any) => tooltipItems[0].label, // Show section name as tooltip title
          label: (tooltipItem: any) => `Score: ${tooltipItem.raw}`, // Show score in tooltip
        },
      },
    },
  };

  const HighlightPlugin = {
    id: 'highlightSlice',
    afterDatasetsDraw: (chart) => {
      const { ctx, scales, tooltip } = chart;
      const activeElement = tooltip?.dataPoints?.[0]; // Get the hovered data point
      if (activeElement) {
        const index = activeElement.dataIndex; // Index of the hovered point
        const centerX = scales.r.xCenter; // Center X of the chart
        const centerY = scales.r.yCenter; // Center Y of the chart
        const dataCount = chart.data.labels?.length || 0;
        const startAngle = (2 * Math.PI * index) / dataCount - Math.PI / 2;
        const endAngle = (2 * Math.PI * (index + 1)) / dataCount - Math.PI / 2;
        const outerRadius = scales.r.drawingArea; // Outer radius of the radar chart
        const innerRadius = 0; // Start from the center

        // Draw the pizza slice
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 206, 86, 0.3)'; // Highlight color
        ctx.fill();
        ctx.restore();
      }
    },
  };

  ChartJS.register(HighlightPlugin);

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;
