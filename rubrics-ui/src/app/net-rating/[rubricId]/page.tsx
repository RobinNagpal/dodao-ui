import React from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface AverageScoresData {
  name: string;
  summary: string;
  averageScores: { criteriaId: string; criteriaName: string; averageScore: number }[];
}

export default async function RubricsNetRating({ params }: { params: { rubricId: string } }) {
  let averageScoresData: AverageScoresData | null = null;
  let error: string | null = null;
  const rubricId = params;
  const response = await fetch(`${getBaseUrl()}/api/net-rating/${rubricId}`);

  if (response.ok) {
    averageScoresData = await response.json();
  } else {
    const errorData = await response.json();
    error = errorData.error || 'Failed to fetch rubric analytics.';
  }

  if (error) {
    return <div className="text-center py-4">Error: {error}</div>;
  }

  if (!averageScoresData) {
    return <div className=" text-center py-4">Loading...</div>;
  }

  return (
    <div className="analytics-page p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-6">{averageScoresData.name}</h1>
      <p className="text-lg text-center text-gray-700 mb-8">{averageScoresData.summary}</p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-4 px-6 text-left text-gray-600 font-semibold">Criteria</th>
              <th className="py-4 px-6 text-left text-gray-600 font-semibold">Average Score</th>
            </tr>
          </thead>
          <tbody>
            {averageScoresData.averageScores.map((scoreData) => (
              <tr key={scoreData.criteriaId} className="border-t">
                <td className="py-4 px-6">{scoreData.criteriaName}</td>
                <td className="py-4 px-6">{scoreData.averageScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
