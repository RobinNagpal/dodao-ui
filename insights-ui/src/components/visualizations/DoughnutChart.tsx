'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  labels: string[];
  values: number[];
}

const colorPalette = [
  { background: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
  { background: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
  { background: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' },
  { background: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
  { background: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
  { background: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' },
];

export default function DonutChart({ labels, values }: DonutChartProps) {
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];

  for (let i = 0; i < labels.length; i++) {
    const color = colorPalette[i % colorPalette.length];
    backgroundColors.push(color.background);
    borderColors.push(color.border);
  }

  const chartData: ChartData<'doughnut'> = {
    labels: labels,
    datasets: [
      {
        label: 'Expenses',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  return <Doughnut data={chartData} />;
}
