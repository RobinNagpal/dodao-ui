import { CheckIcon } from './CheckIcon';
import { Container } from './Container';

export function Introduction() {
  return (
    <section id="introduction" aria-label="Introduction" className="pb-16 pt-20 sm:pb-20 md:pt-36 lg:py-32">
      <div className="text-lg tracking-tight text-slate-700 w-full">
        <p className="font-display text-4xl font-bold tracking-tight text-slate-900">Welcome to DoDAO: Where Learning Meets Simplicity</p>
        <p className="mt-4">
          In a world brimming with information, true learning lies in understanding. That&apos;s where DoDAO stands out. We’re not just a company; we’re
          educators at heart, committed to clarifying the complicated. We have expertise in crafting educational experiences within the fintech domain Through
          years of refining our approach, we have mastered the art of customer education.
        </p>
        <p className="mt-4">
          Our methods ensure that no matter the complexity of the topic, the learning remains engaging, memorable, and most importantly, understandable. Through
          our diverse educational offerings, we provide value to companies looking to educate their clients and customers.
        </p>
        <p className="mt-4 font-bold">What we offer:</p>
        <ul role="list" className="mt-8 space-y-3">
          {['Academy Sites', 'Tidbits Hub', 'AI Chatbot', 'Blockchain Courses', 'Blockchain Development Tooling'].map((feature) => (
            <li key={feature} className="flex">
              <CheckIcon className="h-8 w-8 flex-none fill-blue-500" />
              <span className="ml-4">{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8">Partner with DoDAO and let’s educate your customers together!</p>
      </div>
    </section>
  );
}
