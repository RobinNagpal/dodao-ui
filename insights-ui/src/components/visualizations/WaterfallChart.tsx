'use client';

import React, { useMemo } from 'react';
import { extent } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';

type XAccessor<TDatum> = (datum: TDatum) => string | number;
type YAccessor<TDatum> = (datum: TDatum) => number;

interface WaterfallChartProps<TDatum> {
  width: number;
  height: number;
  data: TDatum[];
  xAccessor: XAccessor<TDatum>;
  yAccessor: YAccessor<TDatum>;
  yLabel: string;
}

const colors = {
  positive: '#49b86f',
  negative: '#c92e5b',
  total: '#434857',
  stepConnector: '#888d94',
  axes: '#888d94',
};

function calculateWaterfallSteps<TDatum>(data: TDatum[], xAccessor: XAccessor<TDatum>, yAccessor: YAccessor<TDatum>) {
  let cumulativeTotal = 0;
  const steps = data.map((datum) => {
    const xValue = xAccessor(datum);
    const yValue = yAccessor(datum);
    const prevTotal = cumulativeTotal;
    cumulativeTotal += yValue;

    return {
      x: xValue,
      y: yValue,
      start: prevTotal,
      end: cumulativeTotal,
      color: yValue > 0 ? colors.positive : colors.negative,
    };
  });

  // Append final total step
  steps.push({
    x: 'Total',
    y: cumulativeTotal,
    start: 0,
    end: cumulativeTotal,
    color: colors.total,
  });

  return steps;
}

export default function WaterfallChart<TDatum>({ width, height, data, xAccessor, yAccessor, yLabel }: WaterfallChartProps<TDatum>) {
  // Define chart margins and inner dimensions.
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate steps from data.
  const steps = useMemo(() => calculateWaterfallSteps(data, xAccessor, yAccessor), [data, xAccessor, yAccessor]);

  // Build scales using d3-scale.
  const padding = 0.2;
  const xScale = scaleBand<string | number>()
    .domain(steps.map((step) => step.x))
    .range([0, innerWidth])
    .padding(padding);

  const yDomain = useMemo(() => {
    const values = steps.flatMap((step) => [step.start, step.end]);
    const [min, max] = extent<number>(values);
    return min != null && max != null ? [min, max] : [0, innerHeight];
  }, [steps, innerHeight]);

  const yScale = scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

  // Create ticks for the y axis.
  const yTicks = yScale.ticks(5);

  return (
    <svg width={width} height={height} className="bg-white">
      {/* Translate the group to account for margins */}
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Grid Rows */}
        {yTicks.map((tick, i) => {
          const yPos = yScale(tick);
          return <line key={`grid-${i}`} x1={0} x2={innerWidth} y1={yPos} y2={yPos} stroke={colors.axes} strokeDasharray="5,5" className="stroke-dashed" />;
        })}

        {/* Bars and connectors */}
        {steps.map((step, index) => {
          const x = xScale(step.x);
          const y = yScale(Math.max(step.start, step.end));
          if (x === undefined || y === undefined) {
            return null;
          }
          const barHeight = Math.abs(yScale(step.start) - yScale(step.end));
          const isLast = index === steps.length - 1;
          const linePadding = 2;
          const x1 = x + xScale.bandwidth() + linePadding;
          const x2 = x + xScale.bandwidth() / (1 - padding) - linePadding;
          const lineY = step.end < step.start ? y + barHeight : y;
          const labelOffset = 10;
          const labelY = yScale(step.end) + (step.y < 0 ? labelOffset : -labelOffset);

          return (
            <g key={index}>
              {/* Bar */}
              <rect x={x} y={y} width={xScale.bandwidth()} height={barHeight} fill={step.color} />
              {/* Connector line */}
              {!isLast && <line x1={x1} x2={x2} y1={lineY} y2={lineY} stroke={colors.stepConnector} strokeDasharray="2,2" />}
              {/* Bar label */}
              <text x={x + xScale.bandwidth() / 2} y={labelY} textAnchor="middle" fill={colors.axes} style={{ fontSize: 13, fontWeight: 700 }}>
                {step.y}
              </text>
            </g>
          );
        })}

        {/* Y Axis */}
        <g className="axis-left">
          {/* Axis label */}
          <text
            x={-margin.left + 10}
            y={innerHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${-margin.left + 10}, ${innerHeight / 2})`}
            fill={colors.axes}
            style={{ fontSize: 16 }}
          >
            {yLabel}
          </text>
          {/* Y Axis ticks */}
          {yTicks.map((tick, i) => {
            const yPos = yScale(tick);
            return (
              <g key={`y-tick-${i}`}>
                <line x1={-5} x2={0} y1={yPos} y2={yPos} stroke={colors.axes} />
                <text x={-10} y={yPos} textAnchor="end" dy="0.32em" fill={colors.axes} style={{ fontSize: 13 }}>
                  {tick}
                </text>
              </g>
            );
          })}
        </g>

        {/* X Axis */}
        <g className="axis-bottom" transform={`translate(0, ${innerHeight})`}>
          {steps.map((step, i) => {
            const xPos = xScale(step.x);
            if (xPos === undefined) return null;
            return (
              <g key={`x-tick-${i}`}>
                <line x1={xPos + xScale.bandwidth() / 2} x2={xPos + xScale.bandwidth() / 2} y1={0} y2={5} stroke={colors.axes} />
                <text x={xPos + xScale.bandwidth() / 2} y={15} textAnchor="middle" fill={colors.axes} style={{ fontSize: 13, fontWeight: 600 }}>
                  {step.x}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
