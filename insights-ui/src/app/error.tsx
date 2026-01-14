'use client';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold mb-3 text-white">Service Temporarily Unavailable</h1>
        <p className="text-gray-400">We’re experiencing technical difficulties. Please try again later.</p>
      </div>
    </div>
  );
}
