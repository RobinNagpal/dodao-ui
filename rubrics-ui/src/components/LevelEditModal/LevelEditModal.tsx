import { RubricLevel } from '@prisma/client';
import React, { useState, useEffect } from 'react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLevel: RubricLevel) => void;
  level: RubricLevel;
}
const EditLevelModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, level }) => {
  const [columnName, setColumnName] = useState(level.columnName);
  const [score, setScore] = useState(level.score);

  useEffect(() => {
    setColumnName(level.columnName);
    setScore(level.score);
  }, [level]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ ...level, columnName, score });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-500">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Level</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Column Name:</label>
          <input type="text" value={columnName} onChange={(e) => setColumnName(e.target.value)} className="w-full border rounded-md p-2" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Score:</label>
          <input type="number" min={0} max={10} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full border rounded-md p-2" />
        </div>
        <div className="flex justify-center">
          <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded-full mr-2">
            Save
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded-full">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default EditLevelModal;
