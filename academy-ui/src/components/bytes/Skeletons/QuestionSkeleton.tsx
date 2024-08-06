export default function QuestionSkeleton() {
  return (
    <div className="p-4 rounded-lg">
      {/* Heading */}
      <h2 className="text-2xl font-semibold mb-4 text-center bg-gray-300 animate-pulse h-6 w-1/2 mx-auto rounded-md" />

      {/* Question Content Placeholder */}
      <div className="flex justify-between items-center content-center mb-4 rounded-md ">
        <div className="markdown-body mb-2 text-lg text-center w-full bg-gray-300 animate-pulse h-12 rounded-md" />
      </div>

      {/* Choices Placeholder */}
      <div className="flex flex-col space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="bg-gray-300 animate-pulse h-8 w-3/4 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
