import './ProgressBar.scss';

interface ProgressBarProps {
  processedCount: number;
  totalCount: number;
}

const ProgressBar = ({ processedCount, totalCount }: ProgressBarProps) => {
  const percentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  return (
    <div className="my-5">
      <div className="mb-1 text-sm font-medium text-color">
        Progress: {processedCount} / {totalCount}
      </div>
      <div className="w-full bg-primary-text rounded-full h-4 flex items-center px-1 relative overflow-hidden">
        <div className="background-color h-3 rounded-full" style={{ width: `${percentage}%` }}>
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
