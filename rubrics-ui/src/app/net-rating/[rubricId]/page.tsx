import React from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import StackedList from '@dodao/web-core/components/core/lists/StackedList'; // Import the StackedList component

interface AverageScoresData {
  name: string;
  summary: string;
  averageScores: {
    criteriaId: string;
    criteriaName: string;
    averageScore: number;
    description: string;
  }[];
  ratingSubmissions: {
    userId: string;
    submissions: {
      criteriaId: string;
      criteriaName: string;
      score: number;
      description: string;
      comment: string;
    }[];
  }[];
}

export default async function RubricsNetRating({ params }: { params: { rubricId: string } }) {
  const session = (await getServerSession(authOptions)) as Session | undefined;
  const { rubricId } = params;

  const response = await fetch(`${getBaseUrl()}/api/net-rating/${rubricId}?userId=${session?.userId}`);
  if (!response.ok) {
    const { error } = await response.json();
    return <div className="text-center py-4">Error: {error || 'Failed to fetch rubric analytics.'}</div>;
  }

  const data: AverageScoresData = await response.json();

  return (
    <PageWrapper>
      <div className="analytics-page p-4 sm:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">{data.name}</h1>
        <p className="text-md sm:text-lg text-center text-gray-700 mb-6 sm:mb-8">{data.summary}</p>

        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Overall Average Scores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-6 sm:mb-8">
            <thead className="bg-gray-100">
              <tr>
                {['Criteria', 'Average Score', 'Description'].map((header) => (
                  <th key={header} className="py-3 sm:py-4 px-4 sm:px-6 text-left text-gray-600 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.averageScores.map(({ criteriaId, criteriaName, averageScore, description }) => (
                <tr key={criteriaId} className="border-t">
                  <td className="py-3 sm:py-4 px-4 sm:px-6">{criteriaName}</td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">{averageScore.toFixed(2)}</td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Individual Rating Submissions</h2>
        {data.ratingSubmissions.map(({ userId, submissions }) => (
          <StackedList key={userId} userId={userId} submissions={submissions} />
        ))}
      </div>
    </PageWrapper>
  );
}
