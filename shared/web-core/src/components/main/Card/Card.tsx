export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-gray-200 px-4 py-5 sm:px-6">{children}</div>;
}
