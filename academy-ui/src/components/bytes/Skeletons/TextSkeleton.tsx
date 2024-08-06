export default function TextSkeleton() {
  return (
    <>
      {/* Skeleton for Lines */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className=" markdown-body w-full h-4 bg-gray-200 rounded-md mb-2 animate-pulse" />
      ))}
    </>
  );
}
