import { PropsWithChildren } from 'react';

export default function Card({ children }: PropsWithChildren) {
  return (
    <div
      role="listitem"
      className="border border-gray-200 rounded-xl shadow-md transform hover:scale-95 transition duration-300 ease-in-out max-w-md overflow-hidden"
    >
      {children}
    </div>
  );
}
