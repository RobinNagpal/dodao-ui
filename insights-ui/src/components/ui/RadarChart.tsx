'use client';

import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

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
  const chartData = {
    labels: [
      "Product Innovation",
      "Market Opportunity",
      "Team Strength",
      "Financial Health",
      "Business Model",
    ],
    datasets: [
      {
        label: "Startup Evaluation",
        data: [
          data.productInnovation.score,
          data.marketOpportunity.score,
          data.teamStrength.score,
          data.financialHealth.score,
          data.businessModel.score,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)", // Light blue fill
        borderColor: "rgba(54, 162, 235, 1)", // Darker blue border
        borderWidth: 2,
        pointBackgroundColor: "rgba(54, 162, 235, 1)", // Dots
        tension: 0.4, 
      },
    ],
  };

  const options = {
    elements: {
        line: {
          borderWidth: 3
        }
    },
    responsive: true,
    scales: {
      r: {
        angleLines: { display: false }, // Hide angle lines for a clean look
        suggestedMin: 0,
        suggestedMax: 5,
        grid: {
            circular: true, // Circular grid
            color: (context:any) => {
              // Alternate colors for each circle
              const index = context.index;
              return index % 2 === 0 ? 'rgba(0, 123, 255, 0.1)' : 'rgba(255, 165, 0, 0.1)'; // Blue and Orange
            },
          },
        ticks: { stepSize: 1, backdropColor: 'transparent' },
      },
    },
    plugins: {
        legend: {
          display: false, // Hide main label
        },
      },
  };

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;
