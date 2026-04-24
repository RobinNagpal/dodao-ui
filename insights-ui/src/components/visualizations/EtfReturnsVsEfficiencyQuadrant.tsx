'use client';

import type { EtfCompetitorClassification, EtfQuadrantDataPoint } from '@/util/etf-quadrant-chart-utils';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend, ChartOptions, ChartData, Plugin, Chart, TooltipItem } from 'chart.js';
import React, { useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export type { EtfQuadrantDataPoint };

export interface EtfReturnsVsEfficiencyQuadrantProps {
  dataPoints: EtfQuadrantDataPoint[];
  mainEtfSymbol: string;
}

const CLASSIFICATION_COLORS: Record<EtfCompetitorClassification, { bg: string; border: string }> = {
  'Top Pick': { bg: 'rgba(52, 211, 153, 0.85)', border: '#34d399' },
  'Return Focused': { bg: 'rgba(129, 140, 248, 0.85)', border: '#818cf8' },
  'Cost Efficient': { bg: 'rgba(56, 189, 248, 0.85)', border: '#38bdf8' },
  Underperform: { bg: 'rgba(251, 113, 133, 0.85)', border: '#fb7185' },
};

const CLASSIFICATION_ORDER: ReadonlyArray<EtfCompetitorClassification> = ['Top Pick', 'Return Focused', 'Cost Efficient', 'Underperform'];

const QuadrantBackgroundPlugin: Plugin<'scatter'> = {
  id: 'etfQuadrantBackground',
  beforeDatasetsDraw: (chart: Chart<'scatter'>) => {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const { left, right, top, bottom } = chartArea;
    const xMid = scales.x.getPixelForValue(50);
    const yMid = scales.y.getPixelForValue(50);

    ctx.save();

    // Top-right: High returns + Efficient cost/risk — "Top Pick" (green)
    const trGrad = ctx.createRadialGradient(right, top, 0, right, top, Math.max(right - xMid, yMid - top) * 1.5);
    trGrad.addColorStop(0, 'rgba(52, 211, 153, 0.18)');
    trGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.08)');
    trGrad.addColorStop(1, 'rgba(52, 211, 153, 0.02)');
    ctx.fillStyle = trGrad;
    ctx.fillRect(xMid, top, right - xMid, yMid - top);

    // Top-left: High returns + costly/risky — "Return Focused" (indigo)
    const tlGrad = ctx.createRadialGradient(left, top, 0, left, top, Math.max(xMid - left, yMid - top) * 1.5);
    tlGrad.addColorStop(0, 'rgba(129, 140, 248, 0.12)');
    tlGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.05)');
    tlGrad.addColorStop(1, 'rgba(129, 140, 248, 0.01)');
    ctx.fillStyle = tlGrad;
    ctx.fillRect(left, top, xMid - left, yMid - top);

    // Bottom-right: Low returns + Efficient — "Cost Efficient" (cyan)
    const brGrad = ctx.createRadialGradient(right, bottom, 0, right, bottom, Math.max(right - xMid, bottom - yMid) * 1.5);
    brGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    brGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
    brGrad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
    ctx.fillStyle = brGrad;
    ctx.fillRect(xMid, yMid, right - xMid, bottom - yMid);

    // Bottom-left: Low returns + costly/risky — "Underperform" (rose)
    const blGrad = ctx.createRadialGradient(left, bottom, 0, left, bottom, Math.max(xMid - left, bottom - yMid) * 1.5);
    blGrad.addColorStop(0, 'rgba(251, 113, 133, 0.14)');
    blGrad.addColorStop(0.5, 'rgba(251, 113, 133, 0.06)');
    blGrad.addColorStop(1, 'rgba(251, 113, 133, 0.01)');
    ctx.fillStyle = blGrad;
    ctx.fillRect(left, yMid, xMid - left, bottom - yMid);

    // Midlines
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

const SymbolLabelPlugin: Plugin<'scatter'> = {
  id: 'etfSymbolLabels',
  afterDatasetsDraw: (chart: Chart<'scatter'>) => {
    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px Inter, sans-serif';

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((point, index) => {
        const raw = dataset.data[index] as { x: number; y: number; symbol?: string; isMainEtf?: boolean };
        if (!raw?.symbol) return;

        const { x, y } = point.getProps(['x', 'y']);
        const isMain = Boolean(raw.isMainEtf);

        ctx.fillStyle = isMain ? '#fbbf24' : '#d1d5db';
        ctx.fillText(raw.symbol, x, y + (isMain ? 22 : 18));
      });
    });

    ctx.restore();
  },
};

export default function EtfReturnsVsEfficiencyQuadrant({ dataPoints, mainEtfSymbol: _mainEtfSymbol }: EtfReturnsVsEfficiencyQuadrantProps): JSX.Element | null {
  const chartData = useMemo((): ChartData<'scatter'> => {
    const grouped: Record<EtfCompetitorClassification, Array<{ x: number; y: number; symbol: string; name: string; isMainEtf: boolean }>> = {
      'Top Pick': [],
      'Return Focused': [],
      'Cost Efficient': [],
      Underperform: [],
    };

    for (const dp of dataPoints) {
      grouped[dp.classification].push({
        x: dp.efficiencyScore,
        y: dp.returnsScore,
        symbol: dp.symbol,
        name: dp.name,
        isMainEtf: dp.isMainEtf,
      });
    }

    return {
      datasets: CLASSIFICATION_ORDER.map((cls) => ({
        label: cls,
        data: grouped[cls],
        backgroundColor: grouped[cls].map((p) => (p.isMainEtf ? 'rgba(251, 191, 36, 0.95)' : CLASSIFICATION_COLORS[cls].bg)),
        borderColor: grouped[cls].map((p) => (p.isMainEtf ? '#fbbf24' : 'rgba(255,255,255,0.2)')),
        borderWidth: grouped[cls].map((p) => (p.isMainEtf ? 2.5 : 1.5)),
        pointRadius: grouped[cls].map((p) => (p.isMainEtf ? 10 : 7)),
        pointHoverRadius: grouped[cls].map((p) => (p.isMainEtf ? 13 : 10)),
        pointStyle: 'circle' as const,
      })),
    };
  }, [dataPoints]);

  const options = useMemo(
    (): ChartOptions<'scatter'> => ({
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      layout: { padding: { top: 24, right: 16, bottom: 8, left: 16 } },
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
              const raw = items[0]?.raw as { name?: string; symbol?: string };
              return raw?.name || raw?.symbol || '';
            },
            label: (item: TooltipItem<'scatter'>) => {
              const raw = item.raw as { x: number; y: number; symbol?: string };
              return [`Returns: ${raw.y.toFixed(0)}%`, `Efficiency: ${raw.x.toFixed(0)}%`, `(${item.dataset.label})`];
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[11px] font-medium text-gray-500 z-10">Strong Returns</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] font-medium text-gray-500 z-10">Weak Returns</div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 text-[11px] font-medium text-gray-500 z-10 [writing-mode:vertical-rl] rotate-180">
          Costly / Risky
        </div>
        <div className="absolute top-1/2 right-0 translate-x-1 -translate-y-1/2 text-[11px] font-medium text-gray-500 z-10 [writing-mode:vertical-rl]">
          Efficient
        </div>

        <div className="px-4">
          <Scatter data={chartData} options={options} plugins={[QuadrantBackgroundPlugin, SymbolLabelPlugin]} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 px-4 text-[11px]">
        {CLASSIFICATION_ORDER.map((cls) => (
          <div key={cls} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLASSIFICATION_COLORS[cls].border }} />
            <span className="text-gray-400">{cls}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
