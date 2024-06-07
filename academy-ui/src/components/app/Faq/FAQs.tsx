import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';
import { marked } from 'marked';
import styles from './FAQs.module.scss';

interface FAQProps {
  compact?: boolean;
  faqs: { question: string; answer: string }[];
  heading: string;
  className?: string;
}

export default function FAQs({ compact, className, faqs, heading }: FAQProps) {
  const renderer = getMarkedRenderer();
  return (
    <div className={styles.faqItem + ' w-full ' + className}>
      <div className={'w-full ' + compact ? '' : 'py-4'}>
        <div className="mx-auto w-full">
          <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold tracking-tight ${compact ? '' : ' leading-10'}`}>{heading}</h2>
          <dl className={`${compact ? 'mt-2' : 'mt-10 space-y-6'}  divide-y divide-gray-900/10`}>
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className={compact ? '' : 'pt-6'}>
                {({ open }) => (
                  <div className="mt-2 p-2 rounded-md border border-gray-500">
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left">
                        <span className="text-sm leading-7" dangerouslySetInnerHTML={{ __html: marked.parse(faq.question, { renderer }) }} />
                        <span className="ml-6 flex h-7 items-center">
                          {open ? <MinusSmallIcon className="h-6 w-6" aria-hidden="true" /> : <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />}
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-xs leading-7 pl-2" dangerouslySetInnerHTML={{ __html: marked.parse(faq.answer, { renderer }) }} />
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
