export default function Loading(): JSX.Element {
  return (
    <div className="mx-auto max-w-7xl py-2">
      <div className="h-6 w-64 rounded bg-gray-800 animate-pulse mb-6" />
      <div className="h-8 w-80 rounded bg-gray-800 animate-pulse mb-4" />
      <div className="h-64 rounded bg-gray-800 animate-pulse" />
    </div>
  );
}
