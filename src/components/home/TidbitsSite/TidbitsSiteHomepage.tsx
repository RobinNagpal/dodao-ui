import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Grid3Cols } from '@/components/core/grids/Grid3Cols';
import ByteCollectionCategoryCard from '@/components/byteCollectionCategory/ByteCollectionCategoryCard';
import Button from '@/components/core/buttons/Button';
import Link from 'next/link';

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
];

interface TidbitsSiteHomepageProps {
  space: SpaceWithIntegrationsFragment;
  categoriesArray: CategoryWithByteCollection[];
}

export default function TidbitsSiteHomepage({ space, categoriesArray }: TidbitsSiteHomepageProps) {
  return (
    <div className="flex flex-col">
      <div className="bg-white flex-1">
        <div className="relative px-6 lg:px-8 flex flex-col justify-center">
          <div className="inset-x-0 absolute -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true"></div>
          <div className="mx-auto max-w-2xl py-8 sm:py-16 lg:pt-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{space.tidbitsHomepage?.heading}</h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">{space.tidbitsHomepage?.shortDescription}</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button variant="contained" primary>
                  <Link href={`/tidbit-collection-categories/view/${categoriesArray[0].id}/tidbit-collections`}>Get started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white">
        <Grid3Cols>
          {categoriesArray.map((category) => (
            <ByteCollectionCategoryCard space={space} category={category} key={category.id} />
          ))}
        </Grid3Cols>
      </div>
    </div>
  );
}
