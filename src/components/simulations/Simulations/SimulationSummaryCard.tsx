import Card from '@/components/core/card/Card';
import { SimulationsQuery } from '@/graphql/generated/generated-types';
import { shorten } from '@/utils/utils';
import Link from 'next/link';
import React from 'react';

interface SimulationSummaryCardProps {
  simulation: SimulationsQuery['simulations'][0];
}

export default function SimulationSummaryCard({ simulation }: SimulationSummaryCardProps) {
  return (
    <Card>
      <Link href={`/simulations/view/${simulation.id}/0`} className="card blog-card w-inline-block h-full w-full">
        <div>
          <div className="p-4 text-center">
            <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(simulation.name, 32)}</h2>
            <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(simulation.content, 300)}</p>
          </div>

          {simulation.publishStatus === 'Draft' && (
            <div className="flex flex-wrap justify-end absolute top-2 left-2">
              <div className="badge post-category mb-1">{simulation.publishStatus}</div>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
