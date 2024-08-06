export default function ImageSkeleton() {
  return (
    <div className="w-48 h-48 bg-gray-300 mb-4 flex items-center justify-center rounded-lg animate-pulse">
      <svg className="w-1/4 h-1/4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H3c-1.1 0-1.99.9-1.99 2L1 19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-8-8l-4 4-2-2-1.41 1.41L12 18l6-6-1.41-1.41z" />
      </svg>
    </div>
  );
}
