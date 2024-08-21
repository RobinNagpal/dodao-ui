import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { RubricLevel } from '@prisma/client';
import React from 'react';

export interface EditRubricLevelProps {
  level: RubricLevel;
  levelIndex: number;
  onLevelChanged: (level: RubricLevel) => void;
  rubric: RubricWithEntities;
}

const EditRubricLevel: React.FC<EditRubricLevelProps> = ({ levelIndex, level }) => {
  const [levelScore, setLevelScore] = React.useState(level.score);

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
    <th className={`py-2 px-4 border-b cursor-pointer text-white ${getHeaderColorClass(levelIndex)}`}>
      <div className="overflow-auto max-h-24" onClick={() => {}}>
        {level.columnName}
        <br />
      </div>
      <input
        type="number"
        min={0}
        max={10}
        className="w-12 h-8 border rounded-md p-2 text-center mb-2 text-black"
        placeholder="Score"
        value={levelScore}
        onChange={(e) => {}}
      />
    </th>
  );
};

export default EditRubricLevel;
