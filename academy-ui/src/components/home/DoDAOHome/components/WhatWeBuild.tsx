import { roboticsAreas } from '@/components/robotics-page/areas/roboticsAreas';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { SectionIntro } from './SiteUi';

// Card sizes for the five areas, in order: a large lead card, then four.
const cardLayout = ['lg:col-span-4 lg:row-span-2 min-h-[420px] lg:min-h-[560px]', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-3'];

export default function WhatWeBuild() {
  return (
    <section id="capabilities" className="dodao-light scroll-mt-20 bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          title="What we build"
          lead="Ten areas of robotics engineering, grouped into five. Most projects use several of them; you can also bring us in for just one."
        />

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {roboticsAreas.map((area, index) => (
            <li key={area.slug} className={`${cardLayout[index]} ${index === 0 ? 'sm:col-span-2' : ''}`}>
              <a
                href={`/robotics/${area.slug}`}
                className="group relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-3xl bg-viewport p-6 ring-1 ring-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-8"
              >
                <Image
                  src={area.cardImage}
                  alt=""
                  fill
                  sizes={index === 0 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 50vw, 100vw'}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-viewport via-viewport/70 to-viewport/5" aria-hidden="true" />
                <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-on-viewport/10 text-on-viewport ring-1 ring-on-viewport/25 backdrop-blur transition group-hover:bg-primary group-hover:ring-primary">
                  <ArrowUpRightIcon className="h-5 w-5" aria-hidden="true" />
                </span>

                <div className="relative">
                  <h3 className={`font-display font-semibold text-on-viewport ${index === 0 ? 'text-3xl lg:text-4xl' : 'text-2xl'}`}>{area.name}</h3>
                  <p className="mt-2 max-w-xl text-[0.95rem] leading-6 text-on-viewport/80">{area.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {area.capabilities.map((capability) => (
                      <li
                        key={capability.name}
                        className="rounded-full bg-on-viewport/10 px-3 py-1 text-xs font-medium text-on-viewport ring-1 ring-inset ring-on-viewport/20 backdrop-blur"
                      >
                        {capability.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
