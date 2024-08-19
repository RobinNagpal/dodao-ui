import { RubricLevel } from '@prisma/client';
import React from 'react';

export interface ViewRubricLevelProps {
  rubricLevel: RubricLevel;
  index: number;
}

const ViewRubricLevel: React.FC<ViewRubricLevelProps> = ({ rubricLevel, index }) => {
  const getHeaderColorClass = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-green-500';
      case 1:
        return 'bg-yellow-400';
      case 2:
        return 'bg-yellow-600';
      case 3:
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <th className={`py-2 px-4 border-b cursor-pointer text-white ${getHeaderColorClass(index)}`}>
      <div className="overflow-auto max-h-24">
        {rubricLevel.columnName}
        <br />
      </div>
      <span className="w-12 h-8  p-2 text-center mb-2">{rubricLevel.score}</span>
    </th>
  );
};

export default ViewRubricLevel;
