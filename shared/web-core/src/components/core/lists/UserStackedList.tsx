import React from 'react';

export interface StackedListUserInfo {
  title: string;
  username: string;
  rightColumnComponentFn: () => React.ReactNode;
}

export interface UserStackedListProps {
  userId: string;
  userInfos: StackedListUserInfo[];
}

export default function UserStackedList({ userInfos }: UserStackedListProps) {
  return (
    <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden p-2">
      <ul role="list" className="divide-y divide-gray-100">
        {userInfos.map((userInfo, index) => (
          <li key={index} className="hover:bg-gray-50">
            <div className="pt-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-6 text-gray-900">{userInfo.title}</p>
                <p className="mt-1 text-xs text-gray-500">{userInfo.username}</p>
              </div>

              <div className="shrink-0 mt-4 sm:mt-0 sm:ml-6">{userInfo.rightColumnComponentFn()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
