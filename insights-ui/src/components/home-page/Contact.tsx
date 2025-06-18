import { BuildingOffice2Icon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Contact() {
  return (
    <div id="contact" className="bg-gray-800 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate bg-gray-800">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="relative px-6 lg:static lg:px-8">
              <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Get in Touch</h2>
                <p className="mt-6 text-lg text-gray-400">
                  Whether you’re a private investor, an analyst, or an institution, we’d love to hear your questions and discuss how KoalaGains can help you
                  make data-driven decisions.
                </p>
                <dl className="mt-10 space-y-4 text-base text-gray-400">
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Address</span>
                      <BuildingOffice2Icon aria-hidden="true" className="h-7 w-6 text-gray-500" />
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
                      <EnvelopeIcon aria-hidden="true" className="h-7 w-6 text-gray-500" />
                    </dt>
                    <dd>
                      <a href="mailto:hello@koalagains.com" className="hover:text-indigo-400">
                        hello@koalagains.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Contact Form */}
            <form action="#" method="POST" className="px-6 lg:px-8">
              <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-semibold text-white">
                      First name
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="first-name"
                        name="first-name"
                        type="text"
                        autoComplete="given-name"
                        className="block w-full rounded-md bg-gray-700 px-3.5 py-2 text-base text-gray-100 outline outline-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-semibold text-white">
                      Last name
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="last-name"
                        name="last-name"
                        type="text"
                        autoComplete="family-name"
                        className="block w-full rounded-md bg-gray-700 px-3.5 py-2 text-base text-gray-100 outline outline-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-white">
                      Email
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md bg-gray-700 px-3.5 py-2 text-base text-gray-100 outline outline-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone-number" className="block text-sm font-semibold text-white">
                      Phone number
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="phone-number"
                        name="phone-number"
                        type="tel"
                        autoComplete="tel"
                        className="block w-full rounded-md bg-gray-700 px-3.5 py-2 text-base text-gray-100 outline outline-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-white">
                      Message
                    </label>
                    <div className="mt-2.5">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="block w-full rounded-md bg-gray-700 px-3.5 py-2 text-base text-gray-100 outline outline-1 outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                        defaultValue={''}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Send message
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
