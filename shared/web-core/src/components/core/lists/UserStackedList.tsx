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
    <ul role="list" className="divide-y divide-gray-100">
      {userInfos.map((userInfo, index) => (
        <li key={index} className="relative py-5 hover:bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-4xl justify-between gap-x-6">
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <span className="absolute inset-x-0 -top-px bottom-0" />
                    {userInfo.title}
                  </p>
                  <p className="mt-1 flex text-xs leading-5 text-gray-500">{userInfo.username}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">{userInfo.rightColumnComponentFn()}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
