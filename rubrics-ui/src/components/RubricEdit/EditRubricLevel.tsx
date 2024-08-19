import React from 'react';

export interface EditRubricLevelProps {
  header: string;
  index: number;
  score: number;
  onScoreChange: (index: number, score: number) => void;
  onEditClick: (type: 'header', criteria: number, index: number) => void;
}

const EditRubricLevel: React.FC<EditRubricLevelProps> = ({ header, index, score, onScoreChange, onEditClick }) => {
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
      <div className="overflow-auto max-h-24" onClick={() => onEditClick('header', index, -1)}>
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
      />
    </th>
  );
};

export default EditRubricLevel;
