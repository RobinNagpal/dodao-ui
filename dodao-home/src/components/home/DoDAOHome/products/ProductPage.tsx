import { Footer } from '@/components/home/DoDAOHome/components/Footer';
import { ActionLink, SectionIntro } from '@/components/home/DoDAOHome/components/SiteUi';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import Image, { StaticImageData } from 'next/image';
import { ComponentType, SVGProps } from 'react';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type ProductItem = { name: string; description: string; icon?: Icon };

export type ProductSection = { title: string; lead?: string; items: ProductItem[] };

export type ProductPageContent = {
  /** What kind of product this is, e.g. "AI agents". */
  kind: string;
  name: string;
  lead: string;
  highlights: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  preview: { image: StaticImageData; alt: string; url: string };
  story: ProductSection;
  features: ProductSection;
  audiences?: ProductSection;
  benefits: ProductSection;
};

function IconBadge({ icon: Icon }: { icon?: Icon }) {
  if (!Icon) return null;
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/25">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}

function ItemCard({ item, large }: { item: ProductItem; large?: boolean }) {
  return (
    <li className={`rounded-3xl bg-surface ring-1 ring-border ${large ? 'p-8' : 'p-7'}`}>
      <IconBadge icon={item.icon} />
      <h3 className={`font-semibold text-heading ${item.icon ? 'mt-6' : ''} ${large ? 'font-display text-2xl' : 'text-lg'}`}>{item.name}</h3>
      <p className="mt-2.5 text-[0.95rem] leading-6 text-body">{item.description}</p>
    </li>
  );
}

/** Shared layout for the dodao.io product pages (KoalaGains, DeFi Alerts, ...). */
export default function ProductPage({ content }: { content: ProductPageContent }) {
  const { story, features, audiences, benefits } = content;
  return (
    <div>
      {/* Hero */}
      <section className="dodao-glow relative overflow-hidden bg-bg">
        <div
          className="dodao-viewport-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_70%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="lg:col-span-5">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <a href="/#earlier-work" className="hover:text-heading">
                Products
              </a>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span className="text-accent">{content.kind}</span>
            </nav>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.02] text-heading lg:text-6xl">{content.name}</h1>
            <p className="mt-6 text-lg leading-8 text-body">{content.lead}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {content.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm text-heading ring-1 ring-inset ring-border"
                >
                  <CheckCircleIcon className="h-4 w-4 text-accent" aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ActionLink href={content.primaryCta.href} size="lg">
                {content.primaryCta.label}
              </ActionLink>
              <ActionLink href={content.secondaryCta.href} external size="lg" variant="secondary">
                {content.secondaryCta.label}
              </ActionLink>
            </div>
          </div>

          {/* Product preview in a browser-style frame */}
          <div className="lg:col-span-7">
            <figure className="overflow-hidden rounded-2xl bg-viewport ring-1 ring-border shadow-[0_30px_80px_-30px_rgb(var(--primary-rgb)/0.6)]">
              <div className="flex items-center gap-2 border-b border-on-viewport/10 px-4 py-3" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="ml-3 truncate rounded-md bg-on-viewport/5 px-3 py-1 text-xs text-on-viewport-muted">{content.preview.url}</span>
              </div>
              <Image src={content.preview.image} alt={content.preview.alt} unoptimized priority className="w-full" />
            </figure>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title={story.title} lead={story.lead} />
          <ul className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {story.items.map((item) => (
              <ItemCard key={item.name} item={item} large />
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="relative overflow-hidden bg-bg py-24">
        <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title={features.title} lead={features.lead} />
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.items.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </ul>
        </div>
      </section>

      {audiences && (
        <section className="dodao-light bg-bg py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro title={audiences.title} lead={audiences.lead} />
            <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.items.map((item) => (
                <ItemCard key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Benefits, on the brand panel */}
      <section className={`${audiences ? '' : 'dodao-light'} bg-bg py-24`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-text sm:px-12 lg:px-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-viewport/50" aria-hidden="true" />
            <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-display max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">{benefits.title}</h2>
              {benefits.lead && <p className="mt-4 max-w-2xl text-lg leading-8 text-primary-text/85">{benefits.lead}</p>}
              <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                {benefits.items.map((item) => (
                  <li key={item.name} className="rounded-2xl bg-primary-text/10 p-6 ring-1 ring-inset ring-primary-text/20 backdrop-blur">
                    {item.icon && <item.icon className="h-6 w-6" aria-hidden="true" />}
                    <h3 className="mt-4 text-lg font-semibold">{item.name}</h3>
                    <p className="mt-2 text-[0.95rem] leading-6 text-primary-text/85">{item.description}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ActionLink href={content.primaryCta.href} size="lg" variant="inverse">
                  {content.primaryCta.label}
                </ActionLink>
                <ActionLink href={content.secondaryCta.href} external size="lg" variant="onColor">
                  {content.secondaryCta.label}
                </ActionLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer showSiteLinks />
    </div>
  );
}
