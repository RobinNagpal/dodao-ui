import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

export default function WarningWithAccentBorder({ className, warning }: { warning: string; className?: string }) {
  return (
    <div className={`border-l-4 border-yellow-400 bg-yellow-50 p-4 ${className || ''}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <div className="font-medium text-yellow-700 underline hover:text-yellow-600">{warning}</div>
          </p>
        </div>
      </div>
    </div>
  );
}
