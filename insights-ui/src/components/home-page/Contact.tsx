'use client';

import NoticeCallout from '@/components/ui/NoticeCallout';
import { submitContactForm } from '@/utils/contact/contact-actions';
import { BuildingOffice2Icon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { FormEvent, useRef, useState } from 'react';

type SubmitStatus = { state: 'idle' } | { state: 'submitting' } | { state: 'success' } | { state: 'error'; message: string };

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' });
  // Guards against a double-click/double-Enter firing two submits before the `disabled` re-render commits.
  const submittingRef = useRef(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    const data = new FormData(e.currentTarget);
    setStatus({ state: 'submitting' });
    try {
      const result = await submitContactForm({
        firstName: data.get('first-name'),
        lastName: data.get('last-name'),
        email: data.get('email'),
        phoneNumber: data.get('phone-number'),
        message: data.get('message'),
        honeypot: data.get('company'),
      });
      if (result.ok) {
        setStatus({ state: 'success' });
        formRef.current?.reset();
      } else {
        setStatus({ state: 'error', message: result.error });
      }
    } catch {
      setStatus({ state: 'error', message: 'Something went wrong. Please try again, or email hello@koalagains.com directly.' });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div id="contact" className="bg-surface py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate bg-surface">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="relative px-6 lg:static lg:px-8">
              <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                <h2 className="text-4xl font-semibold tracking-tight text-heading sm:text-5xl">Get in Touch</h2>
                <p className="mt-6 text-lg text-muted">
                  Whether you’re a private investor, an analyst, or an institution, we’d love to hear your questions and discuss how KoalaGains can help you
                  make data-driven decisions.
                </p>
                <dl className="mt-10 space-y-4 text-base text-muted">
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Address</span>
                      <BuildingOffice2Icon aria-hidden="true" className="h-7 w-6 text-muted" />
                    </dt>
                    <dd>
                      890 Rushbrook Crescent
                      <br />
                      London, ON N6G 5B5, Canada
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Email</span>
                      <EnvelopeIcon aria-hidden="true" className="h-7 w-6 text-muted" />
                    </dt>
                    <dd>
                      <a href="mailto:hello@koalagains.com" className="hover:text-link">
                        hello@koalagains.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Contact Form */}
            <form ref={formRef} onSubmit={handleSubmit} method="POST" className="px-6 lg:px-8">
              {/* Honeypot: hidden from sighted users, so a non-empty value means a bot filled every field blindly. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute h-0 w-0 opacity-0"
                style={{ left: '-9999px' }}
              />
              <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-semibold text-heading">
                      First name
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="first-name"
                        name="first-name"
                        type="text"
                        autoComplete="given-name"
                        className="block w-full rounded-md bg-surface-2 px-3.5 py-2 text-base text-body outline outline-1 outline-border placeholder:text-muted focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-semibold text-heading">
                      Last name
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="last-name"
                        name="last-name"
                        type="text"
                        autoComplete="family-name"
                        className="block w-full rounded-md bg-surface-2 px-3.5 py-2 text-base text-body outline outline-1 outline-border placeholder:text-muted focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-heading">
                      Email
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full rounded-md bg-surface-2 px-3.5 py-2 text-base text-body outline outline-1 outline-border placeholder:text-muted focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone-number" className="block text-sm font-semibold text-heading">
                      Phone number
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="phone-number"
                        name="phone-number"
                        type="tel"
                        autoComplete="tel"
                        className="block w-full rounded-md bg-surface-2 px-3.5 py-2 text-base text-body outline outline-1 outline-border placeholder:text-muted focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-heading">
                      Message
                    </label>
                    <div className="mt-2.5">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="block w-full rounded-md bg-surface-2 px-3.5 py-2 text-base text-body outline outline-1 outline-border placeholder:text-muted focus:outline-2 focus:outline-indigo-600"
                        defaultValue={''}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-end gap-3">
                  {status.state === 'success' && (
                    <NoticeCallout tone="success">Thanks — your message has been sent. We&apos;ll get back to you soon.</NoticeCallout>
                  )}
                  {status.state === 'error' && <NoticeCallout tone="danger">{status.message}</NoticeCallout>}
                  <button
                    type="submit"
                    disabled={status.state === 'submitting'}
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status.state === 'submitting' ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
