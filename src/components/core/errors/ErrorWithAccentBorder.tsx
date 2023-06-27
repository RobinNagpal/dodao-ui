import { XCircleIcon } from '@heroicons/react/20/solid';

export default function ErrorWithAccentBorder({ error }: { error: string }) {
  return (
    <div className="border-l-4 border-red-400 bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            You have no credits left.{' '}
            <a href="#" className="font-medium text-red-700 underline hover:text-red-600">
              {error}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
