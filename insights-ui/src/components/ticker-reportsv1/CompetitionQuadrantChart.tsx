'use client';

import type { QualityVsValueQuadrantProps } from '@/components/visualizations/QualityVsValueQuadrant';
import dynamic from 'next/dynamic';

const QualityVsValueQuadrant = dynamic<QualityVsValueQuadrantProps>(() => import('@/components/visualizations/QualityVsValueQuadrant'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse max-w-md mx-auto lg:mx-0">
      <div className="aspect-square bg-gray-800 rounded" />
      <div className="flex flex-wrap gap-4 mt-3 px-4 justify-center">
        <div className="h-3 w-20 bg-gray-800 rounded" />
        <div className="h-3 w-16 bg-gray-800 rounded" />
        <div className="h-3 w-18 bg-gray-800 rounded" />
        <div className="h-3 w-20 bg-gray-800 rounded" />
      </div>
    </div>
  ),
});

export default QualityVsValueQuadrant;
