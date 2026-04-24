'use client';

import { QuadrantDataPoint } from '@/util/quadrant-chart-utils';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend, ChartOptions, ChartData, Plugin, Chart, TooltipItem } from 'chart.js';
import React, { useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export type { QuadrantDataPoint };

export interface QualityVsValueQuadrantProps {
  dataPoints: QuadrantDataPoint[];
  mainTickerSymbol: string;
}

const CLASSIFICATION_COLORS = {
  'High Quality': { bg: 'rgba(52, 211, 153, 0.85)', border: '#34d399' },
  Investable: { bg: 'rgba(129, 140, 248, 0.85)', border: '#818cf8' },
  'Value Play': { bg: 'rgba(56, 189, 248, 0.85)', border: '#38bdf8' },
  Underperform: { bg: 'rgba(251, 113, 133, 0.85)', border: '#fb7185' },
} as const;

const QuadrantBackgroundPlugin: Plugin<'scatter'> = {
  id: 'quadrantBackground',
  beforeDatasetsDraw: (chart: Chart<'scatter'>) => {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const { left, right, top, bottom } = chartArea;
    const xMid = scales.x.getPixelForValue(50);
    const yMid = scales.y.getPixelForValue(50);

    ctx.save();

    // Top-right: High Quality + Good Value — premium green gradient
    const trGrad = ctx.createRadialGradient(right, top, 0, right, top, Math.max(right - xMid, yMid - top) * 1.5);
    trGrad.addColorStop(0, 'rgba(52, 211, 153, 0.18)');
    trGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.08)');
    trGrad.addColorStop(1, 'rgba(52, 211, 153, 0.02)');
    ctx.fillStyle = trGrad;
    ctx.fillRect(xMid, top, right - xMid, yMid - top);

    // Top-left: High Quality + Expensive — Investable, soft indigo
    const tlGrad = ctx.createRadialGradient(left, top, 0, left, top, Math.max(xMid - left, yMid - top) * 1.5);
    tlGrad.addColorStop(0, 'rgba(129, 140, 248, 0.12)');
    tlGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.05)');
    tlGrad.addColorStop(1, 'rgba(129, 140, 248, 0.01)');
    ctx.fillStyle = tlGrad;
    ctx.fillRect(left, top, xMid - left, yMid - top);

    // Bottom-right: Low Quality + Good Value — Value Play, soft cyan
    const brGrad = ctx.createRadialGradient(right, bottom, 0, right, bottom, Math.max(right - xMid, bottom - yMid) * 1.5);
    brGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    brGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
    brGrad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
    ctx.fillStyle = brGrad;
    ctx.fillRect(xMid, yMid, right - xMid, bottom - yMid);

    // Bottom-left: Low Quality + Expensive — Underperform, soft rose
    const blGrad = ctx.createRadialGradient(left, bottom, 0, left, bottom, Math.max(xMid - left, bottom - yMid) * 1.5);
    blGrad.addColorStop(0, 'rgba(251, 113, 133, 0.14)');
    blGrad.addColorStop(0.5, 'rgba(251, 113, 133, 0.06)');
    blGrad.addColorStop(1, 'rgba(251, 113, 133, 0.01)');
    ctx.fillStyle = blGrad;
    ctx.fillRect(left, yMid, xMid - left, bottom - yMid);

    // Midlines — thin, subtle
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(xMid, top);
    ctx.lineTo(xMid, bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(left, yMid);
    ctx.lineTo(right, yMid);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  },
};

type GroupedTickerPoint = { x: number; y: number; tickers: string[]; companyNames: string[]; isMainTicker: boolean };

const TickerLabelPlugin: Plugin<'scatter'> = {
  id: 'tickerLabels',
  afterDatasetsDraw: (chart: Chart<'scatter'>) => {
    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px Inter, sans-serif';

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((point, index) => {
        const raw = dataset.data[index] as GroupedTickerPoint;
        if (!raw?.tickers?.length) return;

        const { x, y } = point.getProps(['x', 'y']);
        const isMain = raw.isMainTicker;

        ctx.fillStyle = isMain ? '#fbbf24' : '#d1d5db';
        ctx.fillText(raw.tickers.join(', '), x, y + (isMain ? 22 : 18));
      });
    });

    ctx.restore();
  },
};

export default function QualityVsValueQuadrant({ dataPoints, mainTickerSymbol: _mainTickerSymbol }: QualityVsValueQuadrantProps): JSX.Element | null {
  const chartData = useMemo((): ChartData<'scatter'> => {
    type Classification = 'High Quality' | 'Investable' | 'Value Play' | 'Underperform';
    const groupsByKey = new Map<string, { cls: Classification; point: GroupedTickerPoint }>();

    for (const dp of dataPoints) {
      const key = `${Math.round(dp.valueScore)},${Math.round(dp.qualityScore)}`;
      const existing = groupsByKey.get(key);
      if (!existing) {
        groupsByKey.set(key, {
          cls: dp.classification,
          point: { x: dp.valueScore, y: dp.qualityScore, tickers: [dp.ticker], companyNames: [dp.companyName], isMainTicker: dp.isMainTicker },
        });
        continue;
      }
      const p = existing.point;
      if (dp.isMainTicker) {
        p.tickers.unshift(dp.ticker);
        p.companyNames.unshift(dp.companyName);
        p.isMainTicker = true;
        p.x = dp.valueScore;
        p.y = dp.qualityScore;
      } else {
        p.tickers.push(dp.ticker);
        p.companyNames.push(dp.companyName);
      }
    }

    const grouped: Record<Classification, GroupedTickerPoint[]> = {
      'High Quality': [],
      Investable: [],
      'Value Play': [],
      Underperform: [],
    };
    for (const { cls, point } of groupsByKey.values()) {
      grouped[cls].push(point);
    }

    return {
      datasets: (['High Quality', 'Investable', 'Value Play', 'Underperform'] as const).map((cls) => ({
        label: cls,
        data: grouped[cls],
        backgroundColor: grouped[cls].map((p) => (p.isMainTicker ? 'rgba(251, 191, 36, 0.95)' : CLASSIFICATION_COLORS[cls].bg)),
        borderColor: grouped[cls].map((p) => (p.isMainTicker ? '#fbbf24' : 'rgba(255,255,255,0.2)')),
        borderWidth: grouped[cls].map((p) => (p.isMainTicker ? 2.5 : 1.5)),
        pointRadius: grouped[cls].map((p) => (p.isMainTicker ? 10 : 7)),
        pointHoverRadius: grouped[cls].map((p) => (p.isMainTicker ? 13 : 10)),
        pointStyle: 'circle' as const,
      })),
    };
  }, [dataPoints]);

  const options = useMemo(
    (): ChartOptions<'scatter'> => ({
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      layout: {
        padding: { top: 24, right: 16, bottom: 8, left: 16 },
      },
      scales: {
        x: {
          type: 'linear',
          min: -8,
          max: 108,
          title: { display: false },
          grid: { color: 'rgba(55, 65, 81, 0.2)' },
          ticks: { display: false },
          border: { color: 'rgba(55, 65, 81, 0.3)' },
        },
        y: {
          type: 'linear',
          min: -8,
          max: 108,
          title: { display: false },
          grid: { color: 'rgba(55, 65, 81, 0.2)' },
          ticks: { display: false },
          border: { color: 'rgba(55, 65, 81, 0.3)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#f3f4f6',
          bodyColor: '#d1d5db',
          borderColor: '#374151',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (items: TooltipItem<'scatter'>[]) => {
              const raw = items[0]?.raw as GroupedTickerPoint | undefined;
              if (!raw) return '';
              if (raw.companyNames.length > 1) return `${raw.companyNames.length} stocks at this position`;
              return raw.companyNames[0] || raw.tickers[0] || '';
            },
            label: (item: TooltipItem<'scatter'>) => {
              const raw = item.raw as GroupedTickerPoint;
              const lines: string[] = [];
              if (raw.companyNames.length > 1) {
                for (let i = 0; i < raw.companyNames.length; i++) {
                  lines.push(`• ${raw.companyNames[i]} (${raw.tickers[i]})`);
                }
                lines.push('');
              }
              lines.push(`Quality: ${raw.y.toFixed(0)}%`, `Value: ${raw.x.toFixed(0)}%`, `(${item.dataset.label})`);
              return lines;
            },
          },
        },
      },
    }),
    []
  );

  if (dataPoints.length === 0) return null;

  return (
    <div className="max-w-md mx-auto lg:mx-0">
      <div className="relative">
        {/* Axis labels */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[11px] font-medium text-gray-500 z-10">High Quality</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] font-medium text-gray-500 z-10">Low Quality</div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 text-[11px] font-medium text-gray-500 z-10 [writing-mode:vertical-rl] rotate-180">
          Expensive
        </div>
        <div className="absolute top-1/2 right-0 translate-x-1 -translate-y-1/2 text-[11px] font-medium text-gray-500 z-10 [writing-mode:vertical-rl]">
          Good Value
        </div>

        <div className="px-4">
          <Scatter data={chartData} options={options} plugins={[QuadrantBackgroundPlugin, TickerLabelPlugin]} />
        </div>
      </div>

      {/* Legend - aligned with chart */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 px-4 text-[11px]">
        {(['High Quality', 'Investable', 'Value Play', 'Underperform'] as const).map((cls) => (
          <div key={cls} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLASSIFICATION_COLORS[cls].border }} />
            <span className="text-gray-400">{cls}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
