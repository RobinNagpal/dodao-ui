import React from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import UserStackedList, { StackedListUserInfo } from '@dodao/web-core/components/core/lists/UserStackedList';
import { AverageScoresData } from '@/types/rubricsTypes/types';

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
        {data.ratingSubmissions.map(({ userId, submissions }) => {
          const userInfos: StackedListUserInfo[] = [
            {
              title: userId,
              username: session?.user?.email || 'Unknown',
              rightColumnComponentFn: () => (
                <div className="flex justify-end w-full ">
                  <ul role="list" className="divide-y divide-gray-200">
                    {submissions.map((submission, index) => (
                      <li key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 hover:bg-gray-50">
                        <div className="sm:col-span-1">
                          <p className="font-semibold text-gray-900 text-left">{submission.criteriaName}</p>
                        </div>
                        <div className="sm:col-span-1 flex justify-center items-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${getBadgeColor(
                              submission.score
                            )} text-left`}
                          >
                            {submission.score}
                          </span>
                        </div>
                        <div className="sm:col-span-1">
                          <p className="text-sm  text-gray-500 truncate text-left">{submission.description}</p>
                        </div>
                        <div className="sm:col-span-1">
                          <p className="text-sm  text-gray-500 text-left">{submission.comment}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            },
          ];

          return <UserStackedList key={userId} userId={userId} userInfos={userInfos} />;
        })}
      </div>
    </PageWrapper>
  );
}

function getBadgeColor(score: number) {
  if (score >= 8) return 'bg-green-100 text-green-800';
  if (score >= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}
