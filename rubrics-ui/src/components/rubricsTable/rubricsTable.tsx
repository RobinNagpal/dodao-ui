'use client';
import React, { useState } from 'react';
import { RubricsPageProps } from '@/types/rubricsTypes/types';

interface Rubrics {
  Content: string[];
  Comprehensibility: string[];
  Fluency: string[];
  Accuracy: string[];
}

const initialRubrics: Rubrics = {
  Content: [
    'Complete. The speaker clearly conveys the main idea and provides details that are relevant and...',
    'Generally complete. The speaker conveys the main idea, but does not provide adequate relevant details to...',
    'Somewhat incomplete. The main idea is unclear. Much of the detail is irrelevant.',
    'Incomplete. The main idea is unclear. Details are non-existent or random and irrelevant.',
  ],
  Comprehensibility: [
    'Comprehensible. The speaker uses appropriate language to convey the main idea of this item clearly.',
    'Generally comprehensible. The message is unclear in places. The language used is adequate to...',
    'Somewhat incomprehensible. The message could only be understood by a sympathetic native speaker. The...',
    'Incomprehensible.',
  ],
  Fluency: [
    'The student speaks very clearly without hesitation. Pronunciation and intonation sound natural.',
    'The student speaks with some hesitation. Problems with pronunciation and intonation do not prevent...',
    'The student hesitates frequently. Problems with pronunciation and intonation distort meaning or disable...',
    'Frequent hesitations and extreme problems with pronunciation cause communication to break down.',
  ],
  Accuracy: [
    'Functions, grammar, and vocabulary are...',
    'Minor problems in usage do not distort...',
    'Problems in usage significantly distort...',
    'Problems in usage completely distort...',
  ],
};

interface EditState {
  type: 'rubric' | 'header';
  category: keyof Rubrics | number;
  index: number;
  value: string;
}

const RubricsPage: React.FC<RubricsPageProps> = () => {
  const [rubrics, setRubrics] = useState<Rubrics>(initialRubrics);
  const [ratingHeaders, setRatingHeaders] = useState<string[]>(['Excellent', 'Good', 'Fair', 'Needs Improvement']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<EditState>({
    type: 'rubric',
    category: 'Content',
    index: -1,
    value: '',
  });

  const handleEditClick = (type: 'rubric' | 'header', category: keyof Rubrics | number, index: number) => {
    if (type === 'header') {
      setCurrentEdit({
        type,
        category,
        index,
        value: ratingHeaders[category as number],
      });
    } else {
      setCurrentEdit({
        type,
        category,
        index,
        value: rubrics[category as keyof Rubrics][index],
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (value: string) => {
    setCurrentEdit((prevEdit) => ({
      ...prevEdit,
      value,
    }));
  };

  const handleSave = () => {
    if (currentEdit.type === 'header') {
      setRatingHeaders((prevHeaders) => prevHeaders.map((header, index) => (index === currentEdit.category ? currentEdit.value : header)));
    } else {
      setRubrics((prevRubrics) => ({
        ...prevRubrics,
        [currentEdit.category as keyof Rubrics]: prevRubrics[currentEdit.category as keyof Rubrics].map((cell, cellIndex) =>
          cellIndex === currentEdit.index ? currentEdit.value : cell
        ),
      }));
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
    <div className="container mx-auto py-8 p-6">
      <h1 className="text-3xl text-center font-bold mb-8">Create Rubrics</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b"></th>
              {ratingHeaders.map((header, index) => (
                <th
                  key={index}
                  className={`py-2 px-4 border-b cursor-pointer text-white ${getHeaderColorClass(index)}`}
                  onClick={() => handleEditClick('header', index, -1)}
                >
                  <div className="overflow-auto max-h-24">
                    {header}
                    <br />
                    {4 - index}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(rubrics).map((category) => (
              <tr key={category}>
                <td
                  className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words"
                  onClick={() => handleEditClick('rubric', category as keyof Rubrics, -1)}
                >
                  <div className="overflow-y-auto max-h-24">{category}</div>
                </td>
                {rubrics[category as keyof Rubrics].map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="py-2 px-4 border-r border-b cursor-pointer max-w-xs break-words"
                    onClick={() => handleEditClick('rubric', category as keyof Rubrics, cellIndex)}
                  >
                    <div className="overflow-y-auto max-h-24">{cell}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Text</h2>
            <textarea className="w-full border rounded p-2 mb-4" value={currentEdit.value} onChange={(e) => handleInputChange(e.target.value)} rows={4} />
            <div className="flex justify-end">
              <button className="bg-red-500 text-white py-2 px-4 rounded mr-2" onClick={handleCancel}>
                Cancel
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricsPage;
