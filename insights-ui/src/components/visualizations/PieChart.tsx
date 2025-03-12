'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  values: number[];
}

const generateColors = (numColors: number) => {
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    // Evenly distribute hues over 360 degrees
    const hue = Math.floor((360 / numColors) * i);
    // Background: use a lighter version
    backgroundColors.push(`hsl(${hue}, 60%, 50%)`);
    // Border: use a slightly darker version
    borderColors.push(`hsl(${hue}, 60%, 40%)`);
  }
  return { backgroundColors, borderColors };
};

export default function PieChart({ labels, values }: PieChartProps) {
  const { backgroundColors, borderColors } = generateColors(labels.length);
  const chartData: ChartData<'pie'> = {
    labels: labels,
    datasets: [
      {
        label: '$',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}
