import React from 'react';

export interface Submission {
  criteriaName: string;
  score: number;
  description: string;
  comment: string;
}

export interface StackedListProps {
  userId: string;
  submissions: Submission[];
}

export default function StackedList({ userId, submissions }: StackedListProps) {
  const getBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row h-full">
        <div className="sm:w-1/3 w-full bg-gray-100 p-4 flex items-center justify-center">
          <div className="text-left flex flex-col justify-center h-full">
            <h3 className="text-lg font-medium text-black mb-1">User ID: {userId}</h3>
            <p className="text-sm text-gray-600">user@example.com</p>
          </div>
        </div>

        <div className="sm:w-2/3 w-full">
          <ul role="list" className="divide-y divide-gray-200">
            <li className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2 bg-gray-100">
              <div className="sm:col-span-1">
                <p className="text-base font-semibold leading-6 text-gray-900">Criteria</p>
              </div>
              <div className="sm:col-span-1">
                <p className="text-base font-semibold leading-6 text-gray-900 lg:text-center mr-2">Score</p>
              </div>
              <div className="sm:col-span-1">
                <p className="text-base font-semibold leading-6 text-gray-900">Description</p>
              </div>
              <div className="sm:col-span-1">
                <p className="text-base font-semibold leading-6 text-gray-900">Comment</p>
              </div>
            </li>
            {submissions.map((submission, index) => (
              <li key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2 hover:bg-gray-50">
                <div className="sm:col-span-1">
                  <p className="text-base font-semibold leading-6 text-gray-900 pl-0.5 ">{submission.criteriaName}</p>
                </div>

                <div className="sm:col-span-1 flex sm:justify-end lg:justify-center items-center mr-2">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${getBadgeColor(submission.score)}`}>
                    {submission.score}
                  </span>
                </div>

                <div className="sm:col-span-1">
                  <p className="text-sm leading-5 text-gray-500 truncate">{submission.description}</p>
                </div>

                <div className="sm:col-span-1">
                  <p className="text-sm leading-5 text-gray-500">{submission.comment}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
