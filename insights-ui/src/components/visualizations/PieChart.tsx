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

  // Start from a lighter yellow-green shade (HSL 60° is yellowish-green)
  const startHue = 60;
  const hueStep = 360 / numColors;

  for (let i = 0; i < numColors; i++) {
    const hue = (startHue + hueStep * i) % 360; // Ensures hues wrap correctly
    backgroundColors.push(`hsl(${Math.round(hue)}, 60%, 50%)`); // Lighter background
    borderColors.push(`hsl(${Math.round(hue)}, 60%, 40%)`); // Darker border
  }
  return { backgroundColors, borderColors };
};

export default function PieChart({ labels, values }: PieChartProps) {
  const sortedData = labels.map((label, index) => ({ label, value: values[index] })).sort((a, b) => b.value - a.value); // Sorting in descending order

  const sortedLabels = sortedData.map((item) => item.label);
  const sortedValues = sortedData.map((item) => item.value);

  const { backgroundColors, borderColors } = generateColors(sortedLabels.length);
  const chartData: ChartData<'pie'> = {
    labels: sortedLabels,
    datasets: [
      {
        label: '$',
        data: sortedValues,
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
