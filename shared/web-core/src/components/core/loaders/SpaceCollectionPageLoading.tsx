import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default function Loading() {
  return (
    <PageWrapper>
      <div className="flex items-start justify-center h-screen">
        <div className="border border-gray-200 rounded-xl overflow-hidden p-4 animate-pulse w-96">
          <div className="flex items-center mb-4">
            <div className="h-8 w-1/2 bg-gray-300 rounded"></div>
          </div>

          {/* List of Items */}
          <ul className="space-y-4">
            {[...Array(5)].map((_, itemIndex) => (
              <li key={itemIndex} className="flex items-center space-x-3">
                {/* Circle Icon */}
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                {/* Rectangular Text Area */}
                <div className="flex-1 h-6 bg-gray-300 rounded"></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
