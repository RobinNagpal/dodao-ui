import React from 'react';
import { RubricLevelProps } from '@/types/rubricsTypes/types';

const RubricLevel: React.FC<RubricLevelProps> = ({ header, index, score, isEditAccess, onScoreChange, onEditClick }) => {
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
      <div className="overflow-auto max-h-24" onClick={() => isEditAccess && onEditClick('header', index, -1)}>
        {header}
        <br />
      </div>
      <input
        type="number"
        min={0}
        max={10}
        className="w-12 h-8 border rounded-md p-2 text-center mb-2 text-black"
        placeholder="Score"
        value={score}
        onChange={(e) => onScoreChange(index, parseInt(e.target.value))}
        disabled={!isEditAccess}
      />
    </th>
  );
};

export default RubricLevel;
