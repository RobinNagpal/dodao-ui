import ClickableDemoAdminDropdown from '@/components/clickableDemos/List/ClickableDemoAdminDropDown';
import { ClickableDemo } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Card from '@dodao/web-core/components/core/card/Card';
import { shorten } from '@dodao/web-core/utils/utils';
import Link from 'next/link';
import React from 'react';

interface ClickableDemosSummaryCardProps {
  clickableDemo: ClickableDemo;
  space: SpaceWithIntegrationsDto;
}

export default function SimulationSummaryCard({ clickableDemo, space }: ClickableDemosSummaryCardProps) {
  return (
    <Card>
      <Link href={`/clickable-demos/view/${clickableDemo.id}`} className="card blog-card w-inline-block h-full w-full">
        <div>
          <div className="absolute top-0 right-0 m-2">
            <ClickableDemoAdminDropdown clickableDemo={clickableDemo} space={space} />
          </div>
          <div className="p-4 text-center">
            <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(clickableDemo.title, 32)}</h2>
            <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(clickableDemo.excerpt, 300)}</p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
