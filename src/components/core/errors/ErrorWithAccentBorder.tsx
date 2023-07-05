import { XCircleIcon } from '@heroicons/react/20/solid';

export default function ErrorWithAccentBorder({ className, error }: { error: string; className?: string }) {
  return (
    <div className={`border-l-4 border-red-400 bg-red-50 p-4  ${className || ''}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            <span className="font-medium text-red-700 underline hover:text-red-600">{error}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
