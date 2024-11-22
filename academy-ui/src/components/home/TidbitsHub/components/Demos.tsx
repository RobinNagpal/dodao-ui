import Image from 'next/image';
import clickabledemos from '@/images/TidbitsHub/GIFs/clickabledemos.gif';

export default function Demos() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl sm:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600">Bring it to life</h2>
          <p className="mt-2 text-3xl font-medium tracking-tight">Hands-On Clickable Demos</p>
          <p className="mt-2 text-lg">
            Users learn by doing. Our guided, interactive demos let customers click through your product’s features as if they’re using it live. This hands-on
            experience helps them understand functionality quickly and remember it better.
          </p>
        </div>

        <div className="mt-16">
          <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <Image src={clickabledemos} alt="Clickable Demos screenshot" className="rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
